import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsDate, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, DeliveryChannel } from '../entities/notification.entity';

export class TriggerNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  content: Record<string, any>;

  @IsOptional()
  @IsEnum(DeliveryChannel)
  deliveryChannel?: DeliveryChannel;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;

  @IsOptional()
  @IsNumber()
  priority?: number;
} 