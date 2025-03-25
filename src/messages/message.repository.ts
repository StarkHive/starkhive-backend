import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';

@Injectable()
export class MessageRepository {
    private messages: Message[] = [];

    create(message: Message): Message {
        this.messages.push(message);
        return message;
    }

    findAll(): Message[] {
        return this.messages;
    }

    findById(id: number): Message {
        return this.messages.find(message => message.id === id);
    }

    updateStatus(id: number, status: string): Message {
        const message = this.findById(id);
        if (message) {
            message.status = status;
        }
        return message;
    }

    searchByContent(content: string): Message[] {
        return this.messages.filter(message => message.content.includes(content));
    }
}