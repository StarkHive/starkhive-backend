import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, WebSocket } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class WebsocketsService {
  @WebSocketServer()
  server: Server;

  private clients: Set<WebSocket> = new Set();

  handleConnection(client: WebSocket) {
    this.clients.add(client);
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
  }

  sendMessage(message: string) {
    this.server.emit('message', message);
  }

  broadcastMessage(message: string) {
    this.server.emit('broadcast', message);
  }

  getClientsCount(): number {
    return this.clients.size;
  }
}