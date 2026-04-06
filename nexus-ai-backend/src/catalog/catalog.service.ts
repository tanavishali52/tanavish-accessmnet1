import { Injectable, NotFoundException } from '@nestjs/common';
import { AGENT_TEMPLATES, LABS, MODELS, RESEARCH } from '../data/static-data';
import type { ResearchEntry } from '../data/research-data';

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
    return RESEARCH.map(({ id, date, org, title, summary }) => ({ id, date, org, title, summary }));
  }

  getResearchById(id: string): ResearchEntry {
    const item = RESEARCH.find((r) => r.id === id);
    if (!item) {
      throw new NotFoundException(`Research item not found: ${id}`);
    }
    return item;
  }
}
