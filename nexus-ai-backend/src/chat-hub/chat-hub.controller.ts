import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatHubService } from './chat-hub.service';

@ApiTags('chat-hub')
@Controller('chat-hub')
export class ChatHubController {
  constructor(private readonly chatHubService: ChatHubService) {}

  @Get()
  @ApiOperation({ summary: 'Get chat hub static data' })
  @ApiOkResponse({ description: 'Chat hub UI data in JSON format' })
  getChatHubData() {
    return this.chatHubService.getHubData();
  }
}
