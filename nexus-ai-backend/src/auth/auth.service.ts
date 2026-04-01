import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'node:crypto';
import { User, UserDocument } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async signup(payload: SignupDto) {
    const exists = await this.userModel.findOne({ email: payload.email.toLowerCase() }).lean();
    if (exists) throw new BadRequestException('Email already registered');

    const created = await this.userModel.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: this.hashPassword(payload.password),
      plan: payload.plan ?? 'free',
    });
    return this.toSessionUser(created);
  }

  async login(payload: LoginDto) {
    const user = await this.userModel.findOne({ email: payload.email.toLowerCase() });
    if (!user || user.password !== this.hashPassword(payload.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.toSessionUser(user);
  }

  createGuestSession() {
    const guestId = `guest_${crypto.randomUUID()}`;
    return {
      id: guestId,
      name: 'Guest User',
      email: `${guestId}@guest.local`,
      plan: 'free' as const,
      guestMode: true,
    };
  }

  private hashPassword(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private toSessionUser(user: UserDocument | User) {
    return {
      id: user['_id'].toString(),
      name: user.name,
      email: user.email,
      plan: user.plan,
      guestMode: false,
    };
  }
}
