import { Test, type TestingModule } from "@nestjs/testing"
import { SseService, type SseEvent } from "./sse.service"

describe("SseService", () => {
  let service: SseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SseService],
    }).compile()

    service = module.get<SseService>(SseService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("should track client connections", () => {
    // Add a few clients
    service.addClient(1)
    service.addClient(1)
    service.addClient(2)

    const metrics = service.getConnectionMetrics()

    expect(metrics.totalConnections).toBe(3)
    expect(metrics.uniqueUsers).toBe(2)
    expect(metrics.userConnections[1]).toBe(2)
    expect(metrics.userConnections[2]).toBe(1)
  })

  it("should remove client connections", () => {
    // Add and remove clients
    service.addClient(1)
    service.addClient(1)
    service.removeClient(1)

    const metrics = service.getConnectionMetrics()

    expect(metrics.totalConnections).toBe(1)
    expect(metrics.userConnections[1]).toBe(1)
  })

  it("should emit events to specific users", (done) => {
    // Subscribe to events for user 1
    const subscription = service.getUserEventStream(1).subscribe((event: SseEvent) => {
      expect(event.type).toBe("test")
      expect(event.data).toEqual({ message: "test message" })
      expect(event.userId).toBe(1)
      subscription.unsubscribe()
      done()
    })

    // Emit an event for user 1
    service.emit({
      type: "test",
      data: { message: "test message" },
      userId: 1,
    })
  })

  it("should emit broadcast events", (done) => {
    // Subscribe to broadcast events
    const subscription = service.getBroadcastEventStream().subscribe((event: SseEvent) => {
      expect(event.type).toBe("broadcast")
      expect(event.data).toEqual({ message: "broadcast message" })
      expect(event.userId).toBeUndefined()
      subscription.unsubscribe()
      done()
    })

    // Emit a broadcast event
    service.emit({
      type: "broadcast",
      data: { message: "broadcast message" },
    })
  })
})

