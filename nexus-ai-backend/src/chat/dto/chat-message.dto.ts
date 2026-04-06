import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  Allow,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
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
    let raw: Record<string, unknown> | undefined;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      raw = value as Record<string, unknown>;
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          raw = parsed as Record<string, unknown>;
        }
      } catch {
        return undefined;
      }
    }
    if (!raw) return undefined;

    /** Only whitelisted keys — avoids forbidNonWhitelisted failures on multipart + nested plain objects */
    const slim: Record<string, string> = {};
    for (const key of ['goal', 'audience', 'level', 'budget'] as const) {
      const v = raw[key];
      if (v != null && typeof v === 'string') slim[key] = v;
    }
    if (Object.keys(slim).length === 0) return undefined;

    return plainToInstance(ChatContextDto, slim);
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
