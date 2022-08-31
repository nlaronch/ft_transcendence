import type Status from '@/types/Status';

export default interface User {
	id: number;
	login_42: string;
	avatar: string;
	avatar_64?: string;
	username: string;
	status: Status;
}

export interface UserStatus {
	id: number;
	status: Status;
}

export interface Auth {
	token_jwt: string;
	has_2fa: boolean;
}

export interface UserState {
	userToken: string | null;
	userAuth: Auth;
	userData: User;
}
