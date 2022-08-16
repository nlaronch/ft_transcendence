/** @prettier */
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { DeleteResult, InsertResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Friendship, FriendshipStatus } from './entity/friendship.entity';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(Friendship)
		private friendsRepository: Repository<Friendship>
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getRepo() {
		return this.friendsRepository;
	}

	/**
	 * Add a friend request.
	 *
	 * @param user is the user who ask for friendship.
	 * @param target is the user who receives the request.
	 * @return A confimation message
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When they are already friends or waiting for one of them to accept a friend request.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async addFriendRequest(user: User, target: UserSelectDTO): Promise<{ statusCode: number; message: string }> {
		if (user.id == target.id) throw new PreconditionFailedException("You can't be friends with yourself.");

		const friendshipCheck: Friendship = await this.findOne(user.id, target.id, false);

		if (friendshipCheck) {
			throw new NotAcceptableException(`They is already a relation between ${user.username} and ${target.username}` + ` with status ${FriendshipStatus[friendshipCheck.status]}.`);
		}
		const friendship: Friendship = new Friendship();

		friendship.user_id1 = user.id;
		friendship.user_id2 = target.id;

		return await this.friendsRepository.insert(friendship).then((insertResult: InsertResult) => {
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add friendship of ${friendship.user_id1} and ${friendship.user_id1}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + ' rows was modify instead of one.');
			}
			return { statusCode: 200, message: `You asked as a friend ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Accept a friend request.
	 *
	 * @param user is the user who accepts the request.
	 * @param target is the user who ask for friendship.
	 * @return A confimation message
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When they are already friends or waiting for one of them to accept a friend request.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async acceptFriendRequest(user: UserSelectDTO, target: User): Promise<{ statusCode: number; message: string }> {
		if (target.id == user.id) throw new PreconditionFailedException("You can't be friends with yourself.");
		const friendship: Friendship = await this.findOne(target.id, user.id, true);

		if (!friendship) throw new NotAcceptableException(`${user.username} has no friend request from ${target.username}.`);

		if (friendship.status == FriendshipStatus.ACCEPTED) throw new NotAcceptableException(`You are already friend with ${target.username}.`);

		friendship.status = FriendshipStatus.ACCEPTED;

		return await this.friendsRepository.save(friendship).then((fs: Friendship) => {
			return { statusCode: 200, message: `You are now friend with ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Remove a relation (friend request or friend relation). Order of params changed only confirmation message.
	 *
	 * @return A confirmation message.
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When there is no pending friendship request or a confirmed friendship.
	 * @throws {InternalServerErrorException} When the value in database can't be changed.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async removeFriendship(user: UserSelectDTO, target: User): Promise<{ statusCode: number; message: string }> {
		if (target.id == user.id) throw new PreconditionFailedException('Unable to suppress a friendship with oneself.');

		const friendship: Friendship = await this.findOne(user.id, target.id, false);

		if (!friendship) {
			throw new NotAcceptableException(`You are not friends with ${target.username}.`);
		}

		return await this.friendsRepository.delete({ id: friendship.id }).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) throw new InternalServerErrorException("Can't remove friendship of ${friendship.user_id1} and ${friendship.user_id1}.");
			else return { statusCode: 200, message: `You are no longer friends with ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Find a {@link Friendship} with the two users concerned.
	 *
	 * @param user1 is the user who originally requested the friendship if {@link strict} is true.
	 * @param user2 is the user who originally receives the request if {@link strict} is true.
	 * @param strict strict must be set to true if the order of the parameters is important. Otherwise it must be false.
	 * @return The {@link Friendship} find with theses parameters.
	 *
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	private async findOne(user1: number, user2: number, strict: boolean): Promise<Friendship> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		sqlStatement.where('friendship.user_id1 = :id1', { id1: user1 }).andWhere('friendship.user_id2 = :id2', { id2: user2 });
		if (!strict) {
			sqlStatement.orWhere('friendship.user_id1 = :id2').andWhere('friendship.user_id2 = :id1');
		}
		// console.log("SQL friendship", sqlStatement.getQueryAndParameters());

		return await sqlStatement.getOne().then((friendship: Friendship) => {
			return friendship;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * A pending invitation is when you make a friend request and you are waiting for its validation
	 *
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async findPendingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.user_id1 = :id', { id: userId }).andWhere('friendship.status = :status', { status: FriendshipStatus.PENDING });

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user_id1 != userId) friends.push(fs.user_id1);
				else friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findPending(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findPendingIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findPendingNames(userId: number): Promise<string[]> {
		return (await this.findPending(userId)).map((friend) => friend.username);
	}

	/**
	 * A waiting invitation is when someone has asked you as a friend and is waiting for your answer
	 */
	async findWaitingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.user_id2 = :id', { id: userId }).andWhere('friendship.status = :status', { status: FriendshipStatus.PENDING });

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user_id1 != userId) friends.push(fs.user_id1);
				else friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findWaiting(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findWaitingIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findWaitingNames(userId: number): Promise<string[]> {
		return (await this.findWaiting(userId)).map((friend) => friend.username);
	}

	/**
	 * A friend is when both people have accepted the friend request
	 */
	async findFriendsIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.status = :status', { status: FriendshipStatus.ACCEPTED });
		sqlStatement.where('friendship.user_id1 = :id', { id: userId }).orWhere('friendship.user_id2 = :id');

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user_id1 != userId) friends.push(fs.user_id1);
				else friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findFriends(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findFriendsIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findFriendsNames(userId: number): Promise<string[]> {
		return (await this.findFriends(userId)).map((friend) => friend.username);
	}

	async findAllRelations(userId: number): Promise<Friendship[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.user_id1 = :id', { id: userId }).orWhere('friendship.user_id2 = :id');

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			return friendships;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findAll(): Promise<Friendship[]> {
		try {
			return await this.friendsRepository.find();
		} catch (err) {
			return this.userService.lambdaDatabaseUnvailable(err);
		}
	}
}
