import { IsEmail, IsInt, IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserStatus {
	OFFLINE,
	ONLINE,
	IN_GAME,
	IN_CHAT,
	SPEC
}

@Entity()
export class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	// @IsInt()
	id: number;

	@Column()
	@IsNotEmpty()
	login_42: string;

	@Column({ unique: true, nullable: true, length: 32 })
	@IsNotEmpty()
	username: string;

	@Column({ nullable: true })
	avatar: string;

	// @Column("int", { nullable: true, array: true })
	// friends?: number[];

	@Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE})
	status: UserStatus;
}
