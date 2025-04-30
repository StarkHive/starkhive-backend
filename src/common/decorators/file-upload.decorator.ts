import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function FileUploadDecorator(fieldName: string, options?: MulterOptions) {
  return UseInterceptors(
    FileInterceptor(fieldName, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv', 'application/json'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only CSV and JSON are allowed.'), false);
        }
      },
      ...options,
    })
  );
}