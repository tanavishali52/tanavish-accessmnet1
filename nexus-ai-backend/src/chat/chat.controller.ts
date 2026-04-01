import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message and receive smart model recommendations' })
  @ApiBody({ type: ChatMessageDto })
  sendMessage(@Body() dto: ChatMessageDto) {
    return this.chatService.reply(dto.message, dto.context);
  }
}
