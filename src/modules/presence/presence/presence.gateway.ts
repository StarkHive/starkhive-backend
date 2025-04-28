import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io/dist';
import { PresenceService } from '../presence.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { User } from '@src/user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket'],
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticateUser(client);
      if (!user) {
        client.disconnect(true);
        return;
      }

      await this.presenceService.handleUserConnection(user.id);
      client.join(this.getUserRoom(user.id));

      client.emit('status:update', user.presenceStatus);
    } catch (error) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = await this.authenticateUser(client);
    if (user) {
      await this.presenceService.handleUserDisconnection(user.id);
      this.server
        .to(this.getUserRoom(user.id))
        .emit('status:update', 'offline');
    }
  }

  private async authenticateUser(client: Socket): Promise<User | null> {
    const authToken = client.handshake.headers.authorization?.split(' ')[1];
    if (!authToken) return null;

    try {
      const payload = this.jwtService.verify(authToken);
      return this.presenceService.getUserById(payload.sub);
    } catch (error) {
      return null;
    }
  }

  private getUserRoom(userId: string): string {
    return `user_${userId}`;
  }
}
