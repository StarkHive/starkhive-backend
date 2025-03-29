import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsEventType } from '../entities/job-analytic.entity';

interface SubscriptionData {
  jobId: number;
  eventType?: AnalyticsEventType;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, you'd specify your frontend domains
  },
  namespace: 'job-analytics',
})
@Injectable()
export class JobAnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobAnalyticsGateway.name);
  private subscribers = new Map<string, Set<string>>(); // jobId -> socketIds

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up subscriptions for disconnected client
    this.subscribers.forEach((clients, jobId) => {
      if (clients && clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.subscribers.delete(jobId);
        }
      }
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: SubscriptionData,
    @ConnectedSocket() client: Socket,
  ) {
    const jobId = String(data.jobId);
    
    if (!this.subscribers.has(jobId)) {
      this.subscribers.set(jobId, new Set<string>());
    }
    
    // This is safe now because we just ensured the Set exists
    this.subscribers.get(jobId)!.add(client.id);
    
    this.logger.log(`Client ${client.id} subscribed to job ${jobId}`);
    return { success: true, message: `Subscribed to analytics for job ${jobId}` };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: SubscriptionData,
    @ConnectedSocket() client: Socket,
  ) {
    const jobId = String(data.jobId);
    
    if (this.subscribers.has(jobId)) {
      const subscribers = this.subscribers.get(jobId);
      if (subscribers) {
        subscribers.delete(client.id);
        if (subscribers.size === 0) {
          this.subscribers.delete(jobId);
        }
      }
    }
    
    this.logger.log(`Client ${client.id} unsubscribed from job ${jobId}`);
    return { success: true, message: `Unsubscribed from analytics for job ${jobId}` };
  }

  /**
   * Event handler for job analytics events
   */
  @OnEvent('job.analytics')
  handleAnalyticsEvent(payload: any) {
    const jobIdStr = String(payload.jobId);
    
    if (this.subscribers.has(jobIdStr)) {
      const roomClients = this.subscribers.get(jobIdStr);
      
      if (!roomClients) {
        return; // No subscribers for this job
      }
      
      this.logger.log(`Broadcasting event to ${roomClients.size} clients for job ${payload.jobId}`);
      
      roomClients.forEach(clientId => {
        const client = this.server.sockets.sockets.get(clientId);
        if (client) {
          client.emit('analytics_update', payload);
        }
      });
    }
  }
}