import { Body, Controller, Post, Get, Put, Delete, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateChatSessionDto, UpdateChatSessionDto, SaveChatMessageDto } from './dto/chat-session.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ────────────────────────────────────────────────────────────────────
  // Session Endpoints
  // ────────────────────────────────────────────────────────────────────

  @Post('session/create')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiBody({ type: CreateChatSessionDto })
  async createSession(@Body() dto: CreateChatSessionDto) {
    const session = await this.chatService.createSession(dto);
    return { success: true, data: session };
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get a single chat session with messages' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.chatService.getSession(sessionId);
    return { success: true, data: session };
  }

  @Get('sessions/:userId')
  @ApiOperation({ summary: 'Get all chat sessions for a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getUserSessions(@Param('userId') userId: string) {
    const sessions = await this.chatService.getUserSessions(userId);
    return { success: true, data: sessions };
  }

  @Put('session/:sessionId')
  @ApiOperation({ summary: 'Update a chat session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  @ApiBody({ type: UpdateChatSessionDto })
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateChatSessionDto,
  ) {
    const updated = await this.chatService.updateSession(sessionId, dto);
    return { success: true, data: updated };
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async deleteSession(@Param('sessionId') sessionId: string) {
    const result = await this.chatService.deleteSession(sessionId);
    return { success: true, data: result };
  }

  @Delete('sessions/:userId')
  @ApiOperation({ summary: 'Delete all chat sessions for a user' })
  @ApiParam({ name: 'userId', type: 'string' })
  async deleteAllUserSessions(@Param('userId') userId: string) {
    const result = await this.chatService.deleteAllUserSessions(userId);
    return { success: true, data: result };
  }

  // ────────────────────────────────────────────────────────────────────
  // Message Endpoints
  // ────────────────────────────────────────────────────────────────────

  @Post('session/:sessionId/message')
  @ApiOperation({ summary: 'Save a message in a chat session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  @ApiBody({ type: SaveChatMessageDto })
  async saveMessage(
    @Param('sessionId') sessionId: string,
    @Body() dto: SaveChatMessageDto,
  ) {
    const message = await this.chatService.saveMessage(sessionId, dto);
    return { success: true, data: message };
  }

  @Get('session/:sessionId/messages')
  @ApiOperation({ summary: 'Get all messages in a session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async getSessionMessages(@Param('sessionId') sessionId: string) {
    const messages = await this.chatService.getSessionMessages(sessionId);
    return { success: true, data: messages };
  }

  @Delete('message/:messageId/:sessionId')
  @ApiOperation({ summary: 'Delete a specific message' })
  @ApiParam({ name: 'messageId', type: 'string' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.chatService.deleteMessage(messageId, sessionId);
    return { success: true, data: result };
  }

  // ────────────────────────────────────────────────────────────────────
  // AI Recommendations (Legacy Endpoint)
  // ────────────────────────────────────────────────────────────────────

  @Post('message')
  @ApiOperation({ summary: 'Send a message and receive smart model recommendations' })
  @ApiBody({ type: ChatMessageDto })
  sendMessage(@Body() dto: ChatMessageDto) {
    return this.chatService.reply(dto.message, dto.context);
  }
}

