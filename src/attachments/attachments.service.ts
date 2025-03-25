import { Injectable } from '@nestjs/common';
import { Attachment } from './attachment.entity';

@Injectable()
export class AttachmentsService {
    private attachments: Attachment[] = [];

    createAttachment(file: Express.Multer.File, messageId: string): Attachment {
        const newAttachment = new Attachment();
        newAttachment.id = this.attachments.length + 1; // Simple ID generation
        newAttachment.fileName = file.originalname;
        newAttachment.fileType = file.mimetype;
        newAttachment.size = file.size;
        newAttachment.messageId = messageId;
        newAttachment.createdAt = new Date();

        this.attachments.push(newAttachment);
        return newAttachment;
    }

    getAttachmentsByMessageId(messageId: string): Attachment[] {
        return this.attachments.filter(attachment => attachment.messageId === messageId);
    }
}