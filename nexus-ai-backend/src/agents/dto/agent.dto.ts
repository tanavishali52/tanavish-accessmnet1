import { IsString, IsOptional, IsArray, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ example: 'My Research Agent' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'Automates web research and generates reports.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ example: 'gpt5' })
  @IsString()
  modelId: string;

  @ApiPropertyOptional({ example: 'You are a research assistant. Always cite sources.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  systemPrompt?: string;

  @ApiPropertyOptional({ example: ['web_search', 'code_interpreter'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused'] })
  @IsOptional()
  @IsIn(['draft', 'active', 'paused'])
  status?: string;
}

export class UpdateAgentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  systemPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused'] })
  @IsOptional()
  @IsIn(['draft', 'active', 'paused'])
  status?: string;
}

export class RunAgentDto {
  @ApiProperty({ example: 'Research the latest AI trends and write a summary.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;
}
