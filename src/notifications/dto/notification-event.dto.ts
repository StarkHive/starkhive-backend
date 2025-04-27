export class NotificationEventDto {
    readonly type: string
    readonly message: string
    readonly data?: any
    readonly timestamp: Date
    readonly userId?: number
  
    constructor(partial: Partial<NotificationEventDto>) {
      Object.assign(this, partial)
      this.timestamp = new Date()
    }
  }
  
  