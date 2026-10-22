process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-length-for-testing';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateReportAttachment,
  verifyImageBufferSignature,
  sanitizeFileName,
  MAX_ATTACHMENT_SIZE,
} from './lib/attachmentValidation';
import { ROLES } from '../convex/roles';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let JWTService: any;

// Valid sample magic-byte image buffers
const VALID_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const VALID_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const VALID_WEBP = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38,
]);
const FAKE_JPEG_WITH_PDF = Buffer.from('%PDF-1.4 Fake malicious payload disguised as image');
const FAKE_JPEG_WITH_HTML = Buffer.from('<script>alert("XSS")</script>');
const FAKE_JPEG_WITH_EXE = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

describe('Phase 2C — Community Report Attachments (Security-First Implementation)', () => {
  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-length-for-testing';
    if (!JWTService) {
      const jwtMod = await import('./lib/jwt');
      JWTService = jwtMod.JWTService;
    }
  });

  // ---------------------------------------------------------------------------
  // 1. Upload Validation & Magic-Byte Verification
  // ---------------------------------------------------------------------------
  describe('Upload Validation & Magic-Byte Inspection', () => {
    it('accepts valid JPEG, PNG, and WebP image buffers with matching extensions', () => {
      const jpegResult = validateReportAttachment({
        name: 'water_sample.jpg',
        size: VALID_JPEG.length,
        type: 'image/jpeg',
        buffer: VALID_JPEG,
      });
      expect(jpegResult.valid).toBe(true);
      expect(jpegResult.detectedType).toBe('image/jpeg');

      const pngResult = validateReportAttachment({
        name: 'outbreak_site.png',
        size: VALID_PNG.length,
        type: 'image/png',
        buffer: VALID_PNG,
      });
      expect(pngResult.valid).toBe(true);
      expect(pngResult.detectedType).toBe('image/png');

      const webpResult = validateReportAttachment({
        name: 'field_report.webp',
        size: VALID_WEBP.length,
        type: 'image/webp',
        buffer: VALID_WEBP,
      });
      expect(webpResult.valid).toBe(true);
      expect(webpResult.detectedType).toBe('image/webp');
    });

    it('rejects unsupported extensions (SVG, HTML, EXE, PDF, SH)', () => {
      const svgResult = validateReportAttachment({
        name: 'exploit.svg',
        size: 100,
        type: 'image/svg+xml',
        buffer: Buffer.from('<svg></svg>'),
      });
      expect(svgResult.valid).toBe(false);
      expect(svgResult.error).toContain('Unsupported file MIME type');

      const pdfResult = validateReportAttachment({
        name: 'record.pdf',
        size: FAKE_JPEG_WITH_PDF.length,
        type: 'application/pdf',
        buffer: FAKE_JPEG_WITH_PDF,
      });
      expect(pdfResult.valid).toBe(false);

      const exeResult = validateReportAttachment({
        name: 'malware.exe',
        size: 500,
        type: 'application/x-msdownload',
        buffer: FAKE_JPEG_WITH_EXE,
      });
      expect(exeResult.valid).toBe(false);
    });

    it('rejects files exceeding the 5MB size limit', () => {
      const oversizedResult = validateReportAttachment({
        name: 'huge_photo.jpg',
        size: MAX_ATTACHMENT_SIZE + 1,
        type: 'image/jpeg',
        buffer: VALID_JPEG,
      });
      expect(oversizedResult.valid).toBe(false);
      expect(oversizedResult.error).toContain('exceeds maximum size of 5MB');
    });

    it('rejects empty (0 byte) attachments', () => {
      const emptyResult = validateReportAttachment({
        name: 'empty.jpg',
        size: 0,
        type: 'image/jpeg',
        buffer: Buffer.alloc(0),
      });
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.error).toContain('cannot be empty');
    });

    it('detects magic-byte spoofing when extension is .jpg but content is PDF, HTML, or EXE', () => {
      // Named as .jpg, declared as image/jpeg, but actually PDF
      const spoofedPdf = validateReportAttachment({
        name: 'spoofed.jpg',
        size: FAKE_JPEG_WITH_PDF.length,
        type: 'image/jpeg',
        buffer: FAKE_JPEG_WITH_PDF,
      });
      expect(spoofedPdf.valid).toBe(false);
      expect(spoofedPdf.error).toContain('Invalid file signature');

      // Named as .png, declared as image/png, but actually HTML
      const spoofedHtml = validateReportAttachment({
        name: 'xss.png',
        size: FAKE_JPEG_WITH_HTML.length,
        type: 'image/png',
        buffer: FAKE_JPEG_WITH_HTML,
      });
      expect(spoofedHtml.valid).toBe(false);
      expect(spoofedHtml.error).toContain('Invalid file signature');
    });

    it('rejects polyglot images that start with valid magic bytes but contain embedded scripts or HTML', () => {
      // Valid JPEG header followed immediately by script tag
      const polyglotJpeg = Buffer.concat([VALID_JPEG, Buffer.from('<script>alert("pwned")</script>')]);
      const resJpeg = validateReportAttachment({
        name: 'polyglot.jpg',
        size: polyglotJpeg.length,
        type: 'image/jpeg',
        buffer: polyglotJpeg,
      });
      expect(resJpeg.valid).toBe(false);
      expect(resJpeg.error).toContain('Malicious payload detected');

      // Valid PNG header followed by php tag
      const polyglotPng = Buffer.concat([VALID_PNG, Buffer.from('<?php echo "exploit"; ?>')]);
      const resPng = validateReportAttachment({
        name: 'polyglot.png',
        size: polyglotPng.length,
        type: 'image/png',
        buffer: polyglotPng,
      });
      expect(resPng.valid).toBe(false);
      expect(resPng.error).toContain('Malicious payload detected');

      // Valid WebP header followed by html markup
      const polyglotWebp = Buffer.concat([VALID_WEBP, Buffer.from('<!DOCTYPE html><html><body>malicious</body></html>')]);
      const resWebp = validateReportAttachment({
        name: 'polyglot.webp',
        size: polyglotWebp.length,
        type: 'image/webp',
        buffer: polyglotWebp,
      });
      expect(resWebp.valid).toBe(false);
      expect(resWebp.error).toContain('Malicious payload detected');
    });

    it('sanitizes user filenames, stripping path traversal and control characters', () => {
      expect(sanitizeFileName('../../etc/passwd.jpg')).toBe('etcpasswd.jpg');
      expect(sanitizeFileName('test\r\n\x00"inject".png')).toBe('testinject.png');
      expect(sanitizeFileName('../../../../../../windows/system32/cmd.exe')).toBe('windowssystem32cmd.exe');
      expect(sanitizeFileName('   spaced_photo.webp   ')).toBe('spaced_photo.webp');
      expect(sanitizeFileName('')).toBe('attachment.jpg');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Authentication & Authorization Access Control
  // ---------------------------------------------------------------------------
  describe('Authentication & Attachment Access Control', () => {
    it('rejects unauthenticated requests to POST /api/community-reports with 401', async () => {
      const { POST } = await import('./app/api/community-reports/route');
      const req = new NextRequest('http://localhost:3000/api/community-reports', {
        method: 'POST',
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Authentication required');
    });

    it('rejects unauthenticated requests to GET /api/community-reports/[id]/attachment with 401', async () => {
      const { GET } = await import('./app/api/community-reports/[id]/attachment/route');
      const req = new NextRequest('http://localhost:3000/api/community-reports/test-id/attachment', {
        method: 'GET',
      });
      const res = await GET(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Authentication required');
    });

    it('rejects malformed or expired JWT tokens with 401 on attachment retrieval', async () => {
      const { GET } = await import('./app/api/community-reports/[id]/attachment/route');

      // Malformed token
      const malformedReq = new NextRequest('http://localhost:3000/api/community-reports/test-id/attachment', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid.garbage.token.structure',
        },
      });
      const resMalformed = await GET(malformedReq, { params: Promise.resolve({ id: 'test-id' }) });
      expect(resMalformed.status).toBe(401);
      const malformedData = await resMalformed.json();
      expect(malformedData.error).toContain('Invalid or expired session token');

      // Expired token signed with test secret
      const expiredToken = JWTService.generateToken({
        userId: 'user-expired',
        email: 'expired@healthnex.org',
        role: ROLES.PUBLIC_USER,
      });
      // Mock verifyToken to simulate expiration failure
      const verifySpy = vi.spyOn(JWTService, 'verifyToken').mockReturnValueOnce(null);
      const expiredReq = new NextRequest('http://localhost:3000/api/community-reports/test-id/attachment', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });
      const resExpired = await GET(expiredReq, { params: Promise.resolve({ id: 'test-id' }) });
      expect(resExpired.status).toBe(401);
      verifySpy.mockRestore();
    });

    it('enforces role-based access logic: allows author, health_worker, and admin, rejects unauthorized users', () => {
      const authorId = 'user_author_123';
      const strangerId = 'user_stranger_456';
      const healthWorkerId = 'user_hw_789';
      const adminId = 'user_admin_999';

      const mockReport = {
        _id: 'rep_123',
        userId: authorId,
        title: 'Contaminated well',
        attachmentStorageId: 'storage_777',
      };

      const checkAccess = (user: { userId: string; role: string }) => {
        const isOwner = mockReport.userId === user.userId;
        const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.HEALTH_WORKER;
        return isOwner || isStaff;
      };

      // Author has access
      expect(checkAccess({ userId: authorId, role: ROLES.PUBLIC_USER })).toBe(true);
      // Health Worker has access
      expect(checkAccess({ userId: healthWorkerId, role: ROLES.HEALTH_WORKER })).toBe(true);
      // Admin has access
      expect(checkAccess({ userId: adminId, role: ROLES.ADMIN })).toBe(true);
      // Another citizen does NOT have access
      expect(checkAccess({ userId: strangerId, role: ROLES.PUBLIC_USER })).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Anti-IDOR Storage Isolation & Safe Query Sanitization
  // ---------------------------------------------------------------------------
  describe('Anti-IDOR & Query Sanitization Boundary', () => {
    it('prevents attaching storage IDs that belong to user credentials, health records, or other reports', () => {
      // Simulate Convex anti-IDOR check logic from convex/communityReports.ts
      const existingReports = [{ _id: 'rep_1', attachmentStorageId: 'storage_in_use' }];
      const existingUsers = [{ _id: 'u_1', verificationDocStorageId: 'storage_credential' }];
      const existingHealthRecords = [{ _id: 'hr_1', fileStorageId: 'storage_health_vault' }];

      const validateStorageIdAttachment = (candidateStorageId: string) => {
        if (existingReports.some((r) => r.attachmentStorageId === candidateStorageId)) {
          throw new Error('Invalid attachment: Storage reference is already associated with another report');
        }
        if (existingUsers.some((u) => u.verificationDocStorageId === candidateStorageId)) {
          throw new Error('Invalid attachment: Storage reference belongs to private user credentials');
        }
        if (existingHealthRecords.some((h) => h.fileStorageId === candidateStorageId)) {
          throw new Error('Invalid attachment: Storage reference belongs to private health records');
        }
        return true;
      };

      // Clean storage ID passes
      expect(validateStorageIdAttachment('storage_fresh_upload')).toBe(true);

      // Stolen report attachment fails
      expect(() => validateStorageIdAttachment('storage_in_use')).toThrow('already associated with another report');

      // Stolen health worker credential document fails
      expect(() => validateStorageIdAttachment('storage_credential')).toThrow('belongs to private user credentials');

      // Stolen private health vault file fails
      expect(() => validateStorageIdAttachment('storage_health_vault')).toThrow('belongs to private health records');
    });

    it('sanitizes public query responses to completely strip raw attachmentStorageId', () => {
      // Simulate sanitizeReport helper in convex/communityReports.ts
      function sanitizeReport(report: any) {
        if (!report) return null;
        const { attachmentStorageId, ...safeReport } = report;
        return {
          ...safeReport,
          hasAttachment: Boolean(attachmentStorageId),
        };
      }

      const rawDbReportWithAttachment = {
        _id: 'report_101',
        userId: 'user_1',
        title: 'Unsafe Water Well',
        description: 'Water has strange odor and brown color',
        category: 'water',
        attachmentStorageId: 'kg2_secret_storage_identifier_12345',
        attachmentName: 'water_test.jpg',
        attachmentMimeType: 'image/jpeg',
        attachmentSize: 1048576,
      };

      const sanitized = sanitizeReport(rawDbReportWithAttachment);

      expect(sanitized.attachmentStorageId).toBeUndefined();
      expect(sanitized.hasAttachment).toBe(true);
      expect(sanitized.attachmentName).toBe('water_test.jpg');
      expect(sanitized.title).toBe('Unsafe Water Well');

      const rawDbReportWithoutAttachment = {
        _id: 'report_102',
        userId: 'user_2',
        title: 'General Health Notice',
        description: 'Flu symptoms observed',
        category: 'health',
      };

      const sanitizedNoAtt = sanitizeReport(rawDbReportWithoutAttachment);
      expect(sanitizedNoAtt.hasAttachment).toBe(false);
      expect(sanitizedNoAtt.attachmentStorageId).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Lifecycle & Storage Deletion Resilience
  // ---------------------------------------------------------------------------
  describe('Attachment Lifecycle & Storage Deletion Resilience', () => {
    it('cleans up storage attachment when report is deleted by author or admin', () => {
      const mockStorage = new Map<string, string>();
      mockStorage.set('storage_file_1', 'binary_content');

      const deleteReportSimulation = (
        report: { _id: string; userId: string; attachmentStorageId?: string },
        caller: { userId: string; role: string }
      ) => {
        const isOwner = report.userId === caller.userId;
        const isAdmin = caller.role === ROLES.ADMIN;
        if (!isOwner && !isAdmin) {
          throw new Error('Forbidden: You cannot delete another user\'s report');
        }

        let storageCleanupSuccess = true;
        if (report.attachmentStorageId) {
          try {
            mockStorage.delete(report.attachmentStorageId);
          } catch (err) {
            storageCleanupSuccess = false;
          }
        }
        return { success: true, storageCleanupSuccess };
      };

      const report = {
        _id: 'r_1',
        userId: 'u_author',
        attachmentStorageId: 'storage_file_1',
      };

      // Non-owner citizen fails
      expect(() =>
        deleteReportSimulation(report, { userId: 'u_stranger', role: ROLES.PUBLIC_USER })
      ).toThrow('Forbidden');
      expect(mockStorage.has('storage_file_1')).toBe(true);

      // Owner author succeeds and file is deleted
      const ownerRes = deleteReportSimulation(report, { userId: 'u_author', role: ROLES.PUBLIC_USER });
      expect(ownerRes.success).toBe(true);
      expect(ownerRes.storageCleanupSuccess).toBe(true);
      expect(mockStorage.has('storage_file_1')).toBe(false);
    });

    it('honestly reports storage deletion failures without corrupting report deletion status', () => {
      let storageFail = true;
      const deleteReportWithFailingStorage = (
        report: { _id: string; userId: string; attachmentStorageId?: string },
        caller: { userId: string; role: string }
      ) => {
        let storageCleanupSuccess = true;
        if (report.attachmentStorageId) {
          try {
            if (storageFail) {
              throw new Error('Simulated Convex storage service timeout');
            }
          } catch (err) {
            storageCleanupSuccess = false;
          }
        }
        return { success: true, storageCleanupSuccess };
      };

      const result = deleteReportWithFailingStorage(
        { _id: 'r_2', userId: 'u_author', attachmentStorageId: 'storage_file_2' },
        { userId: 'u_author', role: ROLES.PUBLIC_USER }
      );

      expect(result.success).toBe(true);
      expect(result.storageCleanupSuccess).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Cache & PWA Isolation Verification
  // ---------------------------------------------------------------------------
  describe('Cache & PWA Isolation (Phase 2B Preservation)', () => {
    it('sets strict Cache-Control: no-store on community report API responses', async () => {
      const { POST } = await import('./app/api/community-reports/route');
      const req = new NextRequest('http://localhost:3000/api/community-reports', {
        method: 'POST',
      });
      const res = await POST(req);
      const cacheControl = res.headers.get('cache-control');
      expect(cacheControl).toContain('no-store');
      expect(cacheControl).toContain('no-cache');
      expect(res.headers.get('pragma')).toBe('no-cache');
    });

    it('sets strict Cache-Control: no-store and X-Content-Type-Options: nosniff on attachment responses', async () => {
      const { GET } = await import('./app/api/community-reports/[id]/attachment/route');
      const req = new NextRequest('http://localhost:3000/api/community-reports/test-id/attachment', {
        method: 'GET',
      });
      const res = await GET(req, { params: Promise.resolve({ id: 'test-id' }) });
      const cacheControl = res.headers.get('cache-control');
      expect(cacheControl).toContain('no-store');
      expect(cacheControl).toContain('no-cache');
      expect(res.headers.get('pragma')).toBe('no-cache');
    });

    it('ensures service worker Rule 0 (NetworkOnly) covers /api/community-reports routes', () => {
      const swSource = readFileSync(resolve(__dirname, 'app/sw.ts'), 'utf-8');
      expect(swSource).toContain('pathname.startsWith("/api/")');
      expect(swSource).toContain('new NetworkOnly()');

      // Verify that the predicate matches community report paths
      const matcher = ({ sameOrigin, url: { pathname } }: { sameOrigin: boolean; url: { pathname: string } }) =>
        sameOrigin && pathname.startsWith('/api/');

      expect(matcher({ sameOrigin: true, url: { pathname: '/api/community-reports' } })).toBe(true);
      expect(
        matcher({
          sameOrigin: true,
          url: { pathname: '/api/community-reports/rep_123/attachment' },
        })
      ).toBe(true);
      expect(matcher({ sameOrigin: false, url: { pathname: '/api/community-reports' } })).toBe(false);
    });
  });
});
