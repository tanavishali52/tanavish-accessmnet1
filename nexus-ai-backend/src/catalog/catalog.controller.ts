import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('labs')
  @ApiOperation({ summary: 'Get labs list' })
  @ApiOkResponse({ description: 'List of labs from frontend data' })
  getLabs() {
    return this.catalogService.getLabs();
  }

  @Get('models')
  @ApiOperation({ summary: 'Get models list' })
  @ApiOkResponse({ description: 'List of models from frontend data' })
  getModels() {
    return this.catalogService.getModels();
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get agent templates' })
  @ApiOkResponse({ description: 'List of agent templates from frontend data' })
  getAgents() {
    return this.catalogService.getAgents();
  }

  @Get('research')
  @ApiOperation({ summary: 'Get research feed' })
  @ApiOkResponse({ description: 'List of research items from frontend data' })
  getResearch() {
    return this.catalogService.getResearch();
  }
}
