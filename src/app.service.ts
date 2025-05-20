// app.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentPreviewModule } from './document-preview/document-preview.module';
import { AppService } from './app.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    DocumentPreviewModule,
    // Other existing modules
  ],
  providers: [AppService],
})
export class AppModule {}
