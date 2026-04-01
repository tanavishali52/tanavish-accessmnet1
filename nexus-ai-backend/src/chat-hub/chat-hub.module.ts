import { Module } from '@nestjs/common';
import { ChatHubController } from './chat-hub.controller';
import { ChatHubService } from './chat-hub.service';

@Module({
  controllers: [ChatHubController],
  providers: [ChatHubService],
})
export class ChatHubModule {}
