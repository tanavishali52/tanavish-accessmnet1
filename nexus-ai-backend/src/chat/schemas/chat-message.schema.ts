import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface ModelRecommendation {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  price_start?: number;
}

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true })
  conversationId: Types.ObjectId;

  @Prop({ enum: ['user', 'ai'], required: true })
  role: 'user' | 'ai';

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Object], default: [] })
  attachments?: Attachment[];

  @Prop({ type: [Object], default: [] })
  recs?: ModelRecommendation[];

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
