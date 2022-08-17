import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchStats } from './entity/matchstats.entity';
import { MatchStatsService } from './matchs.service';

@Controller('matchs')
export class MatchsStatsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsHistoryService: MatchStatsService) {}

	/**
	 * @deprecated Only for test
	 */
	@Post('start')
	async startMatch(@Body() usersSelected: UserSelectDTO[]): Promise<MatchStats> {
		const user: User = await usersSelected[0].resolveUser(this.usersService);
		const target: User = await usersSelected[1].resolveUser(this.usersService);
		const match: MatchStats = new MatchStats();
		match.user1_id = user.id;
		match.user2_id = target.id;
		return await this.matchsHistoryService.add(match);
	}

	@Post('history')
	async getUserHistory(@Body() userSelected: UserSelectDTO) {
		const user: User = await userSelected.resolveUser(this.usersService);

		return await this.matchsHistoryService.findAll(user.id);
	}

	/**
	 * @deprecated only for test
	 */
	@Patch(':id')
	async updateMatch(@Body() match: MatchStats) {
		return this.matchsHistoryService.save(match);
	}

	@Get('in-progress')
	async getMatchInProgress() {
		return await this.matchsHistoryService.findOnlineMatchs();
	}
}
