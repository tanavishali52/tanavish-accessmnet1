import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CatalogModule } from './catalog/catalog.module';
import { ChatHubModule } from './chat-hub/chat-hub.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { AgentsModule } from './agents/agents.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        process.env.MONGODB_URI ??
        'mongodb://127.0.0.1:27017/nexus-ai-hub',
    ),
    MulterModule.register({
      dest: './uploads', // Directory to store uploaded files
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CatalogModule,
    ChatHubModule,
    AuthModule,
    ChatModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
