import { IsString, IsOptional, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatContextDto {
  @ApiPropertyOptional({ example: 'Code & Dev' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ example: 'Small business' })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({ example: 'Intermediate dev' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'Under $50/mo' })
  @IsOptional()
  @IsString()
  budget?: string;
}

export class ChatMessageDto {
  @ApiProperty({ example: 'I need a model for coding tasks' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatContextDto)
  context?: ChatContextDto;
}
