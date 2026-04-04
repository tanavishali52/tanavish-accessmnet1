import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatContextDto } from './chat-message.dto';

export class CreateChatSessionDto {
  @ApiPropertyOptional({ example: 'My Coding Session' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  sessionId: string; // user ID or guest session ID

  @ApiProperty({ example: false })
  @IsBoolean()
  isGuest: boolean;

  @ApiPropertyOptional({ type: ChatContextDto })
  @IsOptional()
  @Type(() => ChatContextDto)
  @ValidateNested()
  context?: ChatContextDto;

  @ApiPropertyOptional({ example: 'gpt-4' })
  @IsOptional()
  @IsString()
  currentModelId?: string;
}

export class UpdateChatSessionDto {
  @ApiPropertyOptional({ example: 'Updated Chat Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ type: ChatContextDto })
  @IsOptional()
  @Type(() => ChatContextDto)
  @ValidateNested()
  context?: ChatContextDto;

  @ApiPropertyOptional({ example: 'gpt-4' })
  @IsOptional()
  @IsString()
  currentModelId?: string;
}

export class SaveChatMessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  role: 'user' | 'ai';

  @ApiProperty({ example: 'Hello, I need help with code' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  recs?: any[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  attachments?: any[];
}

export class GetChatSessionsDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isGuest: boolean;
}
