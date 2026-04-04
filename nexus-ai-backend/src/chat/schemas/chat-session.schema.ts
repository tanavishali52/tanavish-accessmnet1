import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  sessionId: string; // Either user ID or guest session ID

  @Prop({ default: 'Untitled Chat' })
  title: string;

  @Prop({ default: false })
  isGuest: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'ChatMessage', default: [] })
  messages: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  context: {
    goal?: string;
    audience?: string;
    level?: string;
    budget?: string;
  };

  @Prop({ default: '' })
  currentModelId: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
