import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { privateJsonResponse } from '@/lib/apiResponse';
import { validateReportAttachment } from '@/lib/attachmentValidation';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

const VALID_CATEGORIES = ['water', 'health', 'outbreak', 'environmental', 'safety'] as const;

export async function POST(request: NextRequest) {
  let uploadedStorageId: string | null = null;
  let authToken: string | null = null;

  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`community-report-submit:${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
      return privateJsonResponse(
        { error: 'Too many submissions. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    authToken = JWTService.extractTokenFromRequest(request);
    if (!authToken) {
      return privateJsonResponse(
        { error: 'Unauthorized: Authentication required to submit reports.' },
        { status: 401 }
      );
    }

    const payload = JWTService.verifyToken(authToken);
    if (!payload) {
      return privateJsonResponse(
        { error: 'Unauthorized: Invalid or expired session token.' },
        { status: 401 }
      );
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return privateJsonResponse(
        { error: 'Invalid form payload. Multipart form data required.' },
        { status: 400 }
      );
    }

    const titleRaw = formData.get('title');
    const descriptionRaw = formData.get('description');
    const categoryRaw = formData.get('category');
    const addressRaw = formData.get('address');
    const latRaw = formData.get('latitude');
    const lngRaw = formData.get('longitude');
    const severityRaw = formData.get('severity');

    const description = typeof descriptionRaw === 'string' ? descriptionRaw.trim().slice(0, 2000) : '';
    if (!description) {
      return privateJsonResponse(
        { error: 'Problem description is required.' },
        { status: 400 }
      );
    }

    const category = typeof categoryRaw === 'string' && VALID_CATEGORIES.includes(categoryRaw as any)
      ? (categoryRaw as typeof VALID_CATEGORIES[number])
      : 'health';

    const title = typeof titleRaw === 'string' && titleRaw.trim().length > 0
      ? titleRaw.trim().slice(0, 200)
      : (category === 'water' ? 'Unsafe Water Source' : 'Health Issue');

    const latitude = Number(latRaw) || 20.5937;
    const longitude = Number(lngRaw) || 78.9629;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return privateJsonResponse(
        { error: 'Invalid coordinates provided.' },
        { status: 400 }
      );
    }

    const severityNum = Number(severityRaw) || 3;
    const severity = ([1, 2, 3, 4, 5].includes(severityNum) ? severityNum : 3) as 1 | 2 | 3 | 4 | 5;
    const address = typeof addressRaw === 'string' ? addressRaw.trim().slice(0, 200) : '';

    // Handle optional file attachment
    let attachmentDetails: {
      storageId: any;
      name: string;
      mimeType: string;
      size: number;
    } | null = null;

    const attachmentFile = formData.get('attachment') as File | null;
    if (attachmentFile && attachmentFile.size > 0) {
      const arrayBuffer = await attachmentFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const validation = validateReportAttachment({
        name: attachmentFile.name,
        size: attachmentFile.size,
        type: attachmentFile.type,
        buffer,
      });

      if (!validation.valid) {
        return privateJsonResponse(
          { error: validation.error || 'Attachment validation failed.' },
          { status: 400 }
        );
      }

      // Obtain single-use upload URL from Convex
      let uploadUrl: string;
      try {
        uploadUrl = await convex.mutation(api.communityReports.generateAttachmentUploadUrl, {
          token: authToken,
        });
      } catch (uploadErr: any) {
        return privateJsonResponse(
          { error: uploadErr.message || 'Failed to authorize attachment upload.' },
          { status: 403 }
        );
      }

      // Transfer binary buffer to Convex storage
      const storageRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': validation.detectedType || attachmentFile.type,
        },
        body: buffer,
      });

      if (!storageRes.ok) {
        return privateJsonResponse(
          { error: 'Storage transfer failed. Please try again.' },
          { status: 502 }
        );
      }

      const storageData = await storageRes.json();
      if (!storageData?.storageId) {
        return privateJsonResponse(
          { error: 'Storage service did not return a valid identifier.' },
          { status: 502 }
        );
      }

      uploadedStorageId = storageData.storageId;
      attachmentDetails = {
        storageId: storageData.storageId,
        name: validation.sanitizedFileName || 'attachment.jpg',
        mimeType: validation.detectedType || attachmentFile.type,
        size: attachmentFile.size,
      };
    }

    // Persist report record in Convex
    try {
      const reportId = await convex.mutation(api.communityReports.createReport, {
        token: authToken,
        title,
        description,
        category,
        location: {
          latitude,
          longitude,
          address,
        },
        severity,
        attachmentStorageId: attachmentDetails?.storageId,
        attachmentName: attachmentDetails?.name,
        attachmentMimeType: attachmentDetails?.mimeType,
        attachmentSize: attachmentDetails?.size,
      });

      return privateJsonResponse(
        {
          success: true,
          reportId,
          hasAttachment: Boolean(attachmentDetails),
          message: 'Report submitted successfully.',
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      // Safe lifecycle recovery: clean up orphaned storage object if report persistence failed
      if (uploadedStorageId && authToken) {
        try {
          await convex.mutation(api.communityReports.cleanupOrphanedStorage, {
            token: authToken,
            storageId: uploadedStorageId as any,
          });
        } catch (cleanupErr) {
          console.warn(`Failed to clean up orphaned storage object ${uploadedStorageId}:`, cleanupErr);
        }
      }
      throw dbError;
    }
  } catch (err: any) {
    console.error('Community report submission error:', err);
    return privateJsonResponse(
      { error: err.message || 'Internal server error processing report submission.' },
      { status: 500 }
    );
  }
}
