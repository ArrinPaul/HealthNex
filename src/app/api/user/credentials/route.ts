import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { privateJsonResponse } from '@/lib/apiResponse';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

// Verify magic bytes of the file buffer to prevent MIME/extension spoofing
export function verifyFileSignature(buffer: Buffer): { valid: boolean; detectedType?: string } {
  if (buffer.length < 4) {
    return { valid: false };
  }

  // PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedType: 'application/pdf' };
  }

  // PNG: \x89PNG (0x89, 0x50, 0x4E, 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, detectedType: 'image/png' };
  }

  // JPEG: \xFF\xD8\xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, detectedType: 'image/jpeg' };
  }

  // WebP: RIFF at offset 0, WEBP at offset 8
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, detectedType: 'image/webp' };
  }

  return { valid: false };
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`credentials-upload:${clientIp}`, 5, 60000);
    if (!rateLimit.allowed) {
      return privateJsonResponse(
        { error: 'Too many upload attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const token = JWTService.extractTokenFromRequest(request);
    if (!token) {
      return privateJsonResponse({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);
    if (!payload) {
      return privateJsonResponse({ error: 'Invalid or expired session token.' }, { status: 401 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return privateJsonResponse({ error: 'Invalid multipart form data.' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return privateJsonResponse({ error: 'No credential file provided.' }, { status: 400 });
    }

    // Check file size (0 < size <= 10MB)
    if (file.size <= 0) {
      return privateJsonResponse({ error: 'Uploaded file cannot be empty.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return privateJsonResponse({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Check declared MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return privateJsonResponse(
        { error: 'Unsupported file format. Please upload PDF, JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    // Check file extension
    const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return privateJsonResponse(
        { error: 'Unsupported file extension. Allowed: .pdf, .jpg, .jpeg, .png, .webp' },
        { status: 400 }
      );
    }

    // Inspect real file buffer signature / magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const signature = verifyFileSignature(buffer);

    if (!signature.valid) {
      return privateJsonResponse(
        { error: 'Invalid file content. File does not match its declared format.' },
        { status: 400 }
      );
    }

    // Obtain an authenticated single-use upload URL from Convex
    let uploadUrl: string;
    try {
      uploadUrl = await convex.mutation(api.users.generateCredentialUploadUrl, { token });
    } catch (err: any) {
      return privateJsonResponse(
        { error: err.message || 'Failed to authorize document upload.' },
        { status: 403 }
      );
    }

    // Upload the validated binary buffer directly to Convex storage
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      return privateJsonResponse(
        { error: 'Storage transfer failed. Please try again.' },
        { status: 502 }
      );
    }

    const { storageId } = await uploadRes.json();
    if (!storageId) {
      return privateJsonResponse(
        { error: 'Storage service did not return a valid identifier.' },
        { status: 502 }
      );
    }

    // Attach the storage ID strictly to the authenticated user's account
    await convex.mutation(api.users.attachVerificationDocument, {
      token,
      storageId,
      fileName: file.name,
    });

    return privateJsonResponse({
      success: true,
      message: 'Credential document uploaded successfully and pending verification.',
    });
  } catch (error: any) {
    console.error('Credential upload failed:', error);
    return privateJsonResponse(
      { error: error.message || 'Internal server error processing document.' },
      { status: 500 }
    );
  }
}
