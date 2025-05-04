import { registerAs } from '@nestjs/config';

export default registerAs('kyc', () => ({
    uploadDir: process.env.KYC_UPLOAD_DIR || 'uploads/kyc',
  
    maxFileSize: process.env.KYC_MAX_FILE_SIZE
      ? parseInt(process.env.KYC_MAX_FILE_SIZE, 10)
      : 5 * 1024 * 1024, // 5MB default
  
    allowedMimeTypes: process.env.KYC_ALLOWED_MIME_TYPES
      ? process.env.KYC_ALLOWED_MIME_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  
    encryptionEnabled: process.env.KYC_ENCRYPTION_ENABLED === 'true',
  }));
  
