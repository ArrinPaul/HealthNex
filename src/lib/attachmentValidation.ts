export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
  sanitizedFileName?: string;
}

export function sanitizeFileName(rawName: string): string {
  return rawName
    .replace(/[\x00-\x1F\x7F<>:"/\\|?*]/g, '')
    .replace(/\.\.+/g, '')
    .trim()
    .slice(0, 100) || 'attachment.jpg';
}

export function verifyImageBufferSignature(buffer: Buffer): { valid: boolean; detectedType?: string } {
  if (buffer.length < 4) {
    return { valid: false };
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

export function validateReportAttachment(file: {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}): ValidationResult {
  if (!file || file.size <= 0) {
    return { valid: false, error: 'Attachment file cannot be empty.' };
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return {
      valid: false,
      error: `Attachment file exceeds maximum size of 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const mime = file.type.toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
    return { valid: false, error: 'Unsupported file MIME type. Only JPEG, PNG, and WebP images are allowed.' };
  }

  const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Unsupported file extension. Allowed extensions are: .jpg, .jpeg, .png, .webp.' };
  }

  const signature = verifyImageBufferSignature(file.buffer);
  if (!signature.valid) {
    return { valid: false, error: 'Invalid file signature: Content does not match genuine image magic bytes.' };
  }

  if (signature.detectedType !== mime) {
    return { valid: false, error: 'File content mismatch: Declared MIME type does not match verified magic bytes.' };
  }

  // Deep inspection: Check buffer for embedded executable/script or markup tags to prevent polyglot payloads
  const sampleText = file.buffer.subarray(0, Math.min(file.buffer.length, 2048)).toString('latin1').toLowerCase();
  if (
    sampleText.includes('<script') ||
    sampleText.includes('<svg') ||
    sampleText.includes('<html') ||
    sampleText.includes('<?php') ||
    sampleText.includes('<!doctype')
  ) {
    return { valid: false, error: 'Malicious payload detected: File contains disallowed script or markup content.' };
  }

  return {
    valid: true,
    detectedType: signature.detectedType,
    sanitizedFileName: sanitizeFileName(file.name),
  };
}
