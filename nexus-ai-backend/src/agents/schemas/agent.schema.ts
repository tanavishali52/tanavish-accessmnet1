import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ default: '' })
  systemPrompt: string;

  @Prop({ type: [String], default: [] })
  tools: string[];

  /** Conversation memory: none | short_term (session) | short_and_long_term (vector store). */
  @Prop({
    enum: ['none', 'short_term', 'short_and_long_term'],
    default: 'short_term',
  })
  memoryMode: string;

  @Prop({ enum: ['draft', 'active', 'paused'], default: 'draft' })
  status: string;

  @Prop({ type: String, default: null })
  userId: string | null;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
