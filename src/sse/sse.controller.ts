import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common"
import { Response } from "express"
import { Request } from "express"
import { SseService } from "./sse.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Logger } from "@nestjs/common"
import { interval } from "rxjs"
import { map, takeUntil } from "rxjs/operators"
import { fromEvent } from "rxjs"

@Controller("sse")
export class SseController {
  private readonly logger = new Logger(SseController.name)

  constructor(private readonly sseService: SseService) {}

  // Endpoint for user-specific notifications
  @UseGuards(JwtAuthGuard)
  @Get("notifications")
  async streamNotifications(@Req() req: Request & { user?: { id: number } }, @Res() res: Response) {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).send("Unauthorized")
    }

    // Set necessary SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no") 

    // Track client connection
    this.sseService.addClient(userId)
    this.logger.log(`SSE connection established for user ${userId}`)

    // Create "close" event handler
    const closeConnection = fromEvent(req, "close").pipe(
      map(() => {
        this.sseService.removeClient(userId)
        this.logger.log(`SSE connection closed for user ${userId}`)
        return true
      }),
    )

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeat = interval(30000).pipe(
      takeUntil(closeConnection),
      map(() => {
        res.write(":heartbeat\n\n")
        return true
      }),
    )
    heartbeat.subscribe()

    // Subscribe to user-specific events
    const subscription = this.sseService
      .getUserEventStream(userId)
      .pipe(takeUntil(closeConnection))
      .subscribe((event) => {
        res.write(`event: ${event.type}\n`)
        res.write(`data: ${JSON.stringify(event.data)}\n\n`)
      })

    // Handle client disconnect
    req.on("close", () => {
      subscription.unsubscribe()
    })
  }

  // Public broadcast endpoint (no auth required)
  @Get("broadcasts")
  async streamBroadcasts(@Req() req: Request, @Res() res: Response) {
    // Set necessary SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no") // For NGINX proxy buffering

    this.logger.log("Public broadcast SSE connection established")

    // Create "close" event handler
    const closeConnection = fromEvent(req, "close").pipe(
      map(() => {
        this.logger.log("Public broadcast SSE connection closed")
        return true
      }),
    )

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeat = interval(30000).pipe(
      takeUntil(closeConnection),
      map(() => {
        res.write(":heartbeat\n\n")
        return true
      }),
    )
    heartbeat.subscribe()

    // Subscribe to broadcast events only
    const subscription = this.sseService
      .getBroadcastEventStream()
      .pipe(takeUntil(closeConnection))
      .subscribe((event) => {
        res.write(`event: ${event.type}\n`)
        res.write(`data: ${JSON.stringify(event.data)}\n\n`)
      })

    // Handle client disconnect
    req.on("close", () => {
      subscription.unsubscribe()
    })
  }

  // Admin endpoint for monitoring SSE connections
  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics(@Req() req: Request & { user?: { id: number } }) {
    // You might want to add role-based restrictions here
    return this.sseService.getConnectionMetrics();
  }
}