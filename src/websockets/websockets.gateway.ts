import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Message } from '../messages/message.entity';
import { WebsocketsService } from './websockets.service';
import { Server } from 'socket.io';

@WebSocketGateway()
export class WebsocketsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketsService: WebsocketsService) {}

  handleMessage(client: Socket, payload: Message): void {
    this.websocketsService.sendMessage(payload.content);
    this.server.emit('messageReceived', payload);
  }

  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
  }

  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
  }
}