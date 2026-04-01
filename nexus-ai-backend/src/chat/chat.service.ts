import { Injectable } from '@nestjs/common';
import { MODELS } from '../data/static-data';
import { ChatContextDto } from './dto/chat-message.dto';

type Model = (typeof MODELS)[number];

export interface ReplyResult {
  text: string;
  recs: Model[];
}

@Injectable()
export class ChatService {
  reply(message: string, context?: ChatContextDto): ReplyResult {
    const msg = message.toLowerCase();
    let candidates = [...MODELS];

    // Apply budget filter from context
    if (context?.budget) {
      const budget = context.budget.toLowerCase();
      if (budget.includes('free')) {
        candidates = candidates.filter((m) => m.price_start === 0);
      } else if (budget.includes('under $50')) {
        candidates = candidates.filter((m) => m.price_start < 5);
      } else if (budget.includes('$50')) {
        candidates = candidates.filter((m) => m.price_start < 50);
      }
    }

    // Apply goal filter from context
    if (context?.goal) {
      const goal = context.goal.toLowerCase();
      let goalFiltered: Model[] = [];
      if (goal.includes('code') || goal.includes('dev')) {
        goalFiltered = candidates.filter((m) => m.types.includes('code'));
      } else if (goal.includes('image')) {
        goalFiltered = candidates.filter((m) => m.types.includes('image'));
      } else if (goal.includes('agent')) {
        goalFiltered = candidates.filter((m) =>
          m.tags.some((t) => t.toLowerCase().includes('agent')),
        );
      } else if (goal.includes('data')) {
        goalFiltered = candidates.filter(
          (m) => m.types.includes('language') || m.types.includes('vision'),
        );
      } else if (goal.includes('content') || goal.includes('writ')) {
        goalFiltered = candidates.filter((m) => m.types.includes('language'));
      } else if (goal.includes('chat') || goal.includes('assist')) {
        goalFiltered = candidates.filter((m) => m.types.includes('language'));
      }
      if (goalFiltered.length > 0) candidates = goalFiltered;
    }

    // Score each model based on message keywords
    const scored = candidates.map((m) => ({ model: m, score: this.score(m, msg) }));
    scored.sort((a, b) => b.score - a.score || b.model.rating - a.model.rating);
    const top = scored.slice(0, 3).map((s) => s.model);

    return { text: this.buildText(msg, context), recs: top };
  }

  private score(model: Model, msg: string): number {
    let score = 0;

    const checks: { keywords: string[]; typeMatch?: string; tagMatch?: string; points: number }[] = [
      { keywords: ['code', 'coding', 'program', 'bug', 'debug', 'test', 'sql', 'algorithm', 'dev', 'developer', 'github', 'pull request', 'pr review'], typeMatch: 'code', points: 10 },
      { keywords: ['image', 'picture', 'photo', 'generate image', 'art', 'visual', 'draw', 'design', 'creative'], typeMatch: 'image', points: 10 },
      { keywords: ['vision', 'see', 'analyze image', 'screenshot', 'ocr', 'document scan'], typeMatch: 'vision', points: 10 },
      { keywords: ['cheap', 'free', 'budget', 'affordable', 'low cost', 'save money', 'inexpensive'], points: 8 },
      { keywords: ['fast', 'quick', 'speed', 'low latency', 'real-time', 'realtime'], tagMatch: 'fast', points: 8 },
      { keywords: ['agent', 'agentic', 'tool use', 'function call', 'automation', 'workflow', 'orchestrat'], tagMatch: 'agent', points: 10 },
      { keywords: ['open source', 'open-source', 'self-host', 'local', 'private', 'on-premise'], typeMatch: 'open', points: 10 },
      { keywords: ['long context', 'large context', 'big document', 'pdf', 'book', 'entire codebase', 'context window'], points: 7 },
      { keywords: ['reasoning', 'think', 'math', 'logic', 'complex', 'research', 'science', 'analyse', 'analyze'], tagMatch: 'reasoning', points: 8 },
      { keywords: ['multimodal', 'multi-modal', 'mixed media', 'text and image'], points: 7 },
      { keywords: ['content', 'write', 'writing', 'blog', 'article', 'email', 'marketing', 'seo', 'copy'], typeMatch: 'language', points: 6 },
      { keywords: ['data', 'spreadsheet', 'chart', 'analytics', 'insight', 'report', 'dataset'], points: 6 },
      { keywords: ['chat', 'conversation', 'assistant', 'help', 'answer', 'question'], typeMatch: 'language', points: 4 },
    ];

    for (const check of checks) {
      const hit = check.keywords.some((kw) => msg.includes(kw));
      if (hit) {
        if (check.typeMatch && model.types.includes(check.typeMatch)) score += check.points;
        else if (check.tagMatch && model.tags.some((t) => t.toLowerCase().includes(check.tagMatch!))) score += check.points;
        else if (!check.typeMatch && !check.tagMatch) {
          // Generic keyword hit — boost by price or rating
          if (check.keywords.some((kw) => ['cheap', 'free', 'budget', 'affordable', 'low cost', 'inexpensive'].includes(kw))) {
            score += (10 - Math.min(model.price_start, 10));
          } else {
            score += check.points * (model.rating / 5);
          }
        }
      }
    }

    // Tiebreak by rating
    score += model.rating / 10;
    return score;
  }

  private buildText(msg: string, context?: ChatContextDto): string {
    if (context?.goal) {
      const goal = context.goal;
      const budget = context.budget ?? '';
      const level = context.level ?? '';
      const audience = context.audience ?? '';

      const budgetNote = budget && !budget.toLowerCase().includes('$500')
        ? `, within your ${budget} budget`
        : '';
      const levelNote = level && level.toLowerCase().includes('beginner')
        ? ', optimised for ease of use'
        : '';

      return `Based on your profile (${goal}${audience ? ` for ${audience}` : ''}${budgetNote}${levelNote}), here are my top personalised recommendations:`;
    }

    const t = msg.toLowerCase();
    if (t.includes('code') || t.includes('bug') || t.includes('programming') || t.includes('dev'))
      return 'For coding and development tasks, here are the top models:';
    if (t.includes('image') || t.includes('art') || t.includes('design') || t.includes('visual'))
      return 'For image generation and visual tasks, here are the top models:';
    if (t.includes('cheap') || t.includes('free') || t.includes('budget'))
      return 'Here are the best value / budget-friendly models:';
    if (t.includes('fast') || t.includes('speed') || t.includes('quick'))
      return 'Here are the fastest models for low-latency tasks:';
    if (t.includes('open') || t.includes('self-host') || t.includes('local'))
      return 'Here are the top open-source, self-hostable models:';
    if (t.includes('agent') || t.includes('automation') || t.includes('workflow'))
      return 'Here are the best models for building AI agents and workflows:';
    if (t.includes('reasoning') || t.includes('think') || t.includes('math') || t.includes('research'))
      return 'Here are the top models for deep reasoning and research:';
    if (t.includes('vision') || t.includes('multimodal') || t.includes('image analys'))
      return 'Here are the top vision and multimodal models:';

    return `Based on your query, here are the best matching models:`;
  }
}
