import { ChatService } from "chat/chat.service";
import { ChildEntity, Column } from "typeorm";
import { User } from "users/entity/user.entity";
import { UsersService } from "users/users.service";
import { Chat, ChatFront, ChatStatus } from "./chat.entity";

export class Channel extends Chat {

	name: string;
	owner_id: number;
	avatar: string;
	avatar_64: string;
	admins_ids: number[];
	muted_ids: number[];
	banned_ids: number[];

	public async toFront?(chatService: ChatService, user: User | null): Promise<ChannelFront> {
		const chFront: ChannelFront = {
			name: this.name,
			owner: await chatService.getUserService().findOne(this.owner_id),
			avatar: `http://${'localhost'}:${process.env.PORT}/api/chat/avatar-${ChatStatus[this.type].toLowerCase()}/${this.id}`,
			password: null,
			users: await chatService.getUserService().arrayIdsToUsers(this.users_ids),
			// users: this.users_ids,
			admins: await chatService.getUserService().arrayIdsToUsers(this.admins_ids),
			muted: await chatService.getUserService().arrayIdsToUsers(this.muted_ids),
			banned: await chatService.getUserService().arrayIdsToUsers(this.banned_ids),
			id: this.id,
			type: this.type,
			messages: await chatService.fetchMessage(this.id)
		}
		return chFront;
	}
}

@ChildEntity(ChatStatus.PUBLIC)
export class ChannelPublic extends Channel {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

}

@ChildEntity(ChatStatus.PROTECTED)
export class ChannelProtected extends Channel {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

	@Column()
	password: string | null;

	public async toFront?(chatService: ChatService, user: User | null): Promise<ChannelFront> {
		const chFront: ChannelFront = await super.toFront(chatService, user);
		chFront.password = this.password;
		return chFront;
	}
}

export class ChannelFront extends ChatFront {

	name: string;
	owner: User;
	avatar: string;
	password: string | null;
	users: User[];
	admins: User[];
	muted: User[];
	banned: User[];
}
