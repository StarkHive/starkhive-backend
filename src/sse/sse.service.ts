import { Injectable, Logger } from "@nestjs/common"
import { Subject } from "rxjs"
import { filter } from "rxjs/operators"

export interface SseEvent {
  type: string
  data: any
  userId?: number
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name)
  private eventSubject = new Subject<SseEvent>()
  private clientConnections = new Map<number, number>()

  constructor() {
    // Log active connections every minute
    setInterval(() => {
      this.logActiveConnections()
    }, 60000)
  }

  // Add a client connection to tracking
  public addClient(userId: number): void {
    const currentCount = this.clientConnections.get(userId) || 0
    this.clientConnections.set(userId, currentCount + 1)
    this.logger.log(`New client connection for user ${userId}. Total: ${currentCount + 1}`)
  }

  // Remove a client connection from tracking
  public removeClient(userId: number): void {
    const currentCount = this.clientConnections.get(userId) || 0
    if (currentCount > 0) {
      this.clientConnections.set(userId, currentCount - 1)
      this.logger.log(`Client disconnected for user ${userId}. Remaining: ${currentCount - 1}`)
    }
  }

  // Emit an event to all subscribers
  public emit(event: SseEvent): void {
    this.logger.debug(`Emitting event: ${JSON.stringify(event)}`)
    this.eventSubject.next(event)
  }

  // Get an observable for a specific user's events
  public getUserEventStream(userId: number) {
    return this.eventSubject.pipe(filter((event) => !event.userId || event.userId === userId))
  }

  // Get an observable for broadcast events (no specific user)
  public getBroadcastEventStream() {
    return this.eventSubject.pipe(filter((event) => !event.userId))
  }

  // Log active connection statistics
  private logActiveConnections(): void {
    let totalConnections = 0
    this.clientConnections.forEach((count) => {
      totalConnections += count
    })

    this.logger.log(`Active SSE connections: ${totalConnections} across ${this.clientConnections.size} users`)
  }

  // Get active connection metrics for monitoring
  public getConnectionMetrics() {
    let totalConnections = 0
    this.clientConnections.forEach((count) => {
      totalConnections += count
    })

    return {
      totalConnections,
      uniqueUsers: this.clientConnections.size,
      userConnections: Object.fromEntries(this.clientConnections),
    }
  }
}

