import { Injectable } from '@nestjs/common';
import { CHAT_HUB_DATA } from '../data/static-data';

@Injectable()
export class ChatHubService {
  getHubData() {
    return CHAT_HUB_DATA;
  }
}
