import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { UserStats } from './entity/userstats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([UserStats]), StatsModule, FriendsModule],
	providers: [StatsService],
	controllers: [StatsController],
	exports: [StatsService]
})
export class StatsModule {}
