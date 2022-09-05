import type User from '@/types/User';
import type Channel from '@/types/Channel';

export interface GlobalState {
	users: User[];
	friends: User[];
	selectedItems: User[] | Channel[];
	isLoading: boolean
}

export default GlobalState;
