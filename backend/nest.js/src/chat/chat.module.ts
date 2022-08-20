/** @prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Channel])],
	providers: [ChatService],
	controllers: [ChatController],
})
export class ChatModule {}
