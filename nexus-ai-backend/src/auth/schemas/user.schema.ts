import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['free', 'pro', 'enterprise'], default: 'free' })
  plan: 'free' | 'pro' | 'enterprise';
}

export const UserSchema = SchemaFactory.createForClass(User);
