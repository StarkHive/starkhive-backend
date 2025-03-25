import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { WebsocketsService } from './websockets.service';

@Module({
  providers: [WebsocketsGateway, WebsocketsService],
  exports: [WebsocketsGateway],
})
export class WebsocketsModule {}