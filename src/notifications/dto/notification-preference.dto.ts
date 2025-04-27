import { IsEnum, IsBoolean, IsOptional, ValidateNested, IsUrl, IsEmail, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, DeliveryChannel, DigestFrequency } from '../entities/notification.entity';

class WebhookConfig {
  @IsUrl()
  url: string;

  @IsOptional()
  headers?: Record<string, string>;
}

class EmailConfig {
  @IsEmail()
  address: string;
}

class PushConfig {
  @IsArray()
  @IsString({ each: true })
  deviceTokens: string[];
}

class ChannelConfig {
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookConfig)
  webhook?: WebhookConfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailConfig)
  email?: EmailConfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => PushConfig)
  push?: PushConfig;
}

export class UpdateNotificationPreferenceDto {
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @IsArray()
  @IsEnum(DeliveryChannel, { each: true })
  deliveryChannels: DeliveryChannel[];

  @IsEnum(DigestFrequency)
  digestFrequency: DigestFrequency;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelConfig)
  channelConfig?: ChannelConfig;
} 