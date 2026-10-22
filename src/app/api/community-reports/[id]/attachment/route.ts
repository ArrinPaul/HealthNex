import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';
import { privateJsonResponse } from '@/lib/apiResponse';
import { sanitizeFileName } from '@/lib/attachmentValidation';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    const token = JWTService.extractTokenFromRequest(request);
    if (!token) {
      return privateJsonResponse(
        { error: 'Unauthorized: Authentication required to access report attachments.' },
        { status: 401 }
      );
    }

    const payload = JWTService.verifyToken(token);
    if (!payload) {
      return privateJsonResponse(
        { error: 'Unauthorized: Invalid or expired session token.' },
        { status: 401 }
      );
    }

    let attachmentInfo: {
      downloadUrl: string | null;
      attachmentName: string;
      attachmentMimeType: string;
      attachmentSize: number;
    } | null = null;

    try {
      attachmentInfo = await convex.query(api.communityReports.getAttachmentDownloadUrl, {
        token,
        reportId: reportId as any,
      });
    } catch (queryErr: any) {
      const msg = queryErr?.message || '';
      if (msg.includes('Forbidden')) {
        return privateJsonResponse(
          { error: 'Forbidden: You do not have permission to access this attachment.' },
          { status: 403 }
        );
      }
      if (msg.includes('Report not found')) {
        return privateJsonResponse(
          { error: 'Report not found.' },
          { status: 404 }
        );
      }
      if (msg.includes('Unauthorized')) {
        return privateJsonResponse(
          { error: 'Unauthorized: Authentication required.' },
          { status: 401 }
        );
      }
      throw queryErr;
    }

    if (!attachmentInfo || !attachmentInfo.downloadUrl) {
      return privateJsonResponse(
        { error: 'No attachment found for this report.' },
        { status: 404 }
      );
    }

    const safeName = sanitizeFileName(attachmentInfo.attachmentName || 'report-attachment.jpg');
    const mimeType = attachmentInfo.attachmentMimeType || 'image/jpeg';

    // If client requested metadata only
    if (request.nextUrl.searchParams.get('metadata') === 'true') {
      return privateJsonResponse({
        hasAttachment: true,
        fileName: safeName,
        mimeType,
        size: attachmentInfo.attachmentSize,
      });
    }

    // Stream the binary asset server-to-server to avoid exposing Convex storage bearer URL
    const fileRes = await fetch(attachmentInfo.downloadUrl);
    if (!fileRes.ok) {
      return privateJsonResponse(
        { error: 'Failed to retrieve attachment file from storage service.' },
        { status: 502 }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', `inline; filename="${safeName}"`);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('X-Content-Type-Options', 'nosniff');
    const contentLength = fileRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(fileRes.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Failed to retrieve report attachment:', error);
    return privateJsonResponse(
      { error: error.message || 'Internal server error retrieving attachment.' },
      { status: 500 }
    );
  }
}
