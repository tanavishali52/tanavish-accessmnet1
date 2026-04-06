import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  Allow,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
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
  @Transform(({ value }: { value: unknown }) => {
    if (value == null || value === '') return undefined;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
          ? parsed
          : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  @ValidateNested()
  @Type(() => ChatContextDto)
  context?: ChatContextDto;

  /** Multipart may include this key on `req.body`; real files use @UploadedFiles() */
  @ApiPropertyOptional()
  @Allow()
  @IsOptional()
  files?: unknown;
}
