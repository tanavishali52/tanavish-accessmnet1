import { Injectable, NotFoundException } from '@nestjs/common';
import { AGENT_TEMPLATES, LABS, MODELS, RESEARCH } from '../data/static-data';
import type { ResearchEntry } from '../data/research-data';
import { HERO_ONBOARD_STEPS } from '../data/hero-onboarding-data';

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
    return RESEARCH.map(({ id, date, org, title, summary, category }) => ({
      id,
      date,
      org,
      title,
      summary,
      category,
    }));
  }

  getResearchById(id: string): ResearchEntry {
    const item = RESEARCH.find((r) => r.id === id);
    if (!item) {
      throw new NotFoundException(`Research item not found: ${id}`);
    }
    return item;
  }

  getHeroOnboarding() {
    return HERO_ONBOARD_STEPS;
  }
}
