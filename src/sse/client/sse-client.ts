/**
 * Client-side SSE connection handler
 *
 * This file should be imported in your frontend application
 * and used to establish and maintain SSE connections.
 */
export class SseClient {
    private eventSource: EventSource | null = null
    private reconnectTimer: any = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 10
    private reconnectDelay = 2000 // Starting delay in ms
    private eventListeners: Map<string, Function[]> = new Map()
    private connectionUrl: string
  
    constructor(baseUrl: string, path = "sse/notifications") {
      this.connectionUrl = `${baseUrl}/${path}`
    }
  
    /**
     * Connect to the SSE endpoint
     */
    public connect(): void {
      if (this.eventSource) {
        this.disconnect()
      }
  
      if (!window.EventSource) {
        console.error("This browser does not support Server-Sent Events")
        this.fallbackToPolling()
        return
      }
  
      try {
        this.eventSource = new EventSource(this.connectionUrl, {
          withCredentials: true, // Important for auth cookies
        })
  
        // Set up connection event handlers
        this.eventSource.onopen = this.handleOpen.bind(this)
        this.eventSource.onerror = this.handleError.bind(this)
  
        // Register for message events
        this.eventSource.onmessage = this.handleMessage.bind(this)
  
        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0
      } catch (error) {
        console.error("Failed to establish SSE connection:", error)
        this.scheduleReconnect()
      }
    }
  
    /**
     * Disconnect from the SSE endpoint
     */
    public disconnect(): void {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }
  
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }
  
    /**
     * Add an event listener for a specific event type
     */
    public on(eventType: string, callback: Function): void {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, [])
  
        // If we already have an event source, register for this event
        if (this.eventSource) {
          this.eventSource.addEventListener(eventType, ((event: MessageEvent) => {
            this.handleEvent(eventType, event)
          }) as EventListener)
        }
      }
  
      const listeners = this.eventListeners.get(eventType) || []
      listeners.push(callback)
      this.eventListeners.set(eventType, listeners)
    }
  
    /**
     * Remove an event listener
     */
    public off(eventType: string, callback?: Function): void {
      if (!callback) {
        // Remove all listeners for this event type
        this.eventListeners.delete(eventType)
        return
      }
  
      const listeners = this.eventListeners.get(eventType) || []
      const updatedListeners = listeners.filter((listener) => listener !== callback)
  
      if (updatedListeners.length === 0) {
        this.eventListeners.delete(eventType)
      } else {
        this.eventListeners.set(eventType, updatedListeners)
      }
    }
  
    /**
     * Handle successful connection
     */
    private handleOpen(event: Event): void {
      console.log("SSE connection established")
      // Reset reconnection parameters
      this.reconnectAttempts = 0
      this.reconnectDelay = 2000
    }
  
    /**
     * Handle connection errors
     */
    private handleError(event: Event): void {
      console.error("SSE connection error:", event)
  
      // EventSource automatically attempts to reconnect, but we'll
      // implement our own reconnection strategy if it keeps failing
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.scheduleReconnect()
      }
    }
  
    /**
     * Handle incoming messages (default event type)
     */
    private handleMessage(event: MessageEvent): void {
      try {
        const data = JSON.parse(event.data)
        console.log("SSE message received:", data)
  
        // Dispatch to default listeners
        const listeners = this.eventListeners.get("message") || []
        listeners.forEach((callback) => callback(data))
      } catch (error) {
        console.error("Error processing SSE message:", error)
      }
    }
  
    /**
     * Handle typed events
     */
    private handleEvent(eventType: string, event: MessageEvent): void {
      try {
        const data = JSON.parse(event.data)
        console.log(`SSE ${eventType} event received:\`, data);pe} event received:`, data)
  
        // Dispatch to type-specific listeners
        const listeners = this.eventListeners.get(eventType) || []
        listeners.forEach((callback) => callback(data))
      } catch (error) {
        console.error(`Error processing SSE ${eventType} event:`, error)
      }
    }
  
    /**
     * Schedule a reconnection attempt with exponential backoff
     */
    private scheduleReconnect(): void {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
      }
  
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`)
        this.fallbackToPolling()
        return
      }
  
      // Calculate backoff delay with jitter to prevent thundering herd
      const jitter = Math.random() * 0.5 + 0.75 // 0.75-1.25 multiplier
      const delay = Math.min(this.reconnectDelay * jitter, 30000) // Cap at 30 seconds
  
      console.log(
        `Scheduling SSE reconnection in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
      )
  
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000) // Exponential backoff
        this.connect()
      }, delay)
    }
  
    /**
     * Fallback to polling strategy when SSE is not supported or fails
     */
    private fallbackToPolling(): void {
      console.log("Falling back to polling strategy for notifications")
  
      // Set up a polling interval (e.g., every 30 seconds)
      const pollingInterval = setInterval(() => {
        // Make a regular HTTP request to fetch latest notifications
        fetch(`${this.connectionUrl.replace("/sse/", "/api/admin/")}/notifications/poll`, {
          credentials: "include", // Include auth cookies
        })
          .then((response) => response.json())
          .then((data) => {
            // Simulate SSE events by dispatching to listeners
            if (data && Array.isArray(data)) {
              data.forEach((notification) => {
                // Dispatch as message event
                const listeners = this.eventListeners.get("message") || []
                listeners.forEach((callback) => callback(notification))
  
                // Dispatch as typed event if applicable
                if (notification.type) {
                  const typeListeners = this.eventListeners.get(notification.type) || []
                  typeListeners.forEach((callback) => callback(notification))
                }
              })
            }
          })
          .catch((error) => {
            console.error("Error polling for notifications:", error)
          })
      }, 30000) // Poll every 30 seconds
  
      // Store the interval ID for cleanup
      this.reconnectTimer = pollingInterval
    }
  }
  
  