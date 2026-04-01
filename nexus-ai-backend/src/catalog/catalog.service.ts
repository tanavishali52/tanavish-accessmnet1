import { Injectable } from '@nestjs/common';
import { AGENT_TEMPLATES, LABS, MODELS, RESEARCH } from '../data/static-data';

@Injectable()
export class CatalogService {
  getLabs() {
    return LABS;
  }

  getModels() {
    return MODELS;
  }

  getAgents() {
    return AGENT_TEMPLATES;
  }

  getResearch() {
    return RESEARCH;
  }
}
