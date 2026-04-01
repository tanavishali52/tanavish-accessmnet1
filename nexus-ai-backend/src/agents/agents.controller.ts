import { Body, Controller, Delete, Get, Param, Post, Put, Session } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto, RunAgentDto } from './dto/agent.dto';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiBody({ type: CreateAgentDto })
  create(@Body() dto: CreateAgentDto, @Session() session: Record<string, any>) {
    return this.agentsService.create(dto, session.user?.id ?? null);
  }

  @Get()
  @ApiOperation({ summary: 'List all agents for current session user' })
  findAll(@Session() session: Record<string, any>) {
    return this.agentsService.findAll(session.user?.id ?? null);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single agent by ID' })
  findOne(@Param('id') id: string, @Session() session: Record<string, any>) {
    return this.agentsService.findOne(id, session.user?.id ?? null);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an agent' })
  @ApiBody({ type: UpdateAgentDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @Session() session: Record<string, any>,
  ) {
    return this.agentsService.update(id, dto, session.user?.id ?? null);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agent' })
  remove(@Param('id') id: string, @Session() session: Record<string, any>) {
    return this.agentsService.remove(id, session.user?.id ?? null);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run / test an agent with a message' })
  @ApiBody({ type: RunAgentDto })
  run(
    @Param('id') id: string,
    @Body() dto: RunAgentDto,
    @Session() session: Record<string, any>,
  ) {
    return this.agentsService.run(id, dto.message, session.user?.id ?? null);
  }
}
