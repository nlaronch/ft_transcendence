import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import UserService from '@/services/UserService';
import type GlobalState from '@/types/GlobalState';
import type User from '@/types/User';
import type Channel from '@/types/Channel';

type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

export const useGlobalStore = defineStore('globalStore', {
	state: (): GlobalState => ({
		users: [],
		friends: [],
		selectedItems: [],
		isLoading: false
	}),
	getters: {
		isTypeArrayUsers: (state) => {
			return (array: selectedItems): array is User[] => (array as User[])[0] === undefined || (array as User[])[0].username !== undefined;
		},
		isTypeUser: (state) => {
			return (user: selectedItem): user is User => (user as User).username !== undefined;
		},
		isFriend: (state) => {
			return (userId: number) => state.friends.some((friend) => friend.id === userId);
		},
		getUserName: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.username;
		},
		getUserAvatar: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.avatar;
		},
		getUserId: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.id;
		},
		getUser: (state) => {
			return (userId: number) => state.users.find((user) => user.id === userId);
		},
		getIndexSelectedItems: (state) => {
			return  (user: User) => state.selectedItems.findIndex((userSelectioned) => userSelectioned.id === user.id);
		},
		getUsersFiltered: (state) => {
			return  (userToFilter: User) => state.users.filter((user) => user.id != userToFilter.id);
		},
	},
	actions: {
		async fetchAll() {
			try {
				await Promise.all([this.fetchUsers(), this.fetchfriends()]);
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUsers() {
			if (!this.users.length)
			{
				try {
					const response = await UserService.getUsers();
					this.users = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchfriends() {
			if (!this.friends.length)
			{
				try {
					const userStore = useUserStore();
					const response = await UserService.getUserfriends(userStore.userData.id);
					this.friends = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		checkChangeInArray(baseArray: User[]) {
			for (const userBa of baseArray) {
				const index = this.getIndexSelectedItems(userBa);
				if (index < 0) return true;
			}
			for (const selectedUser of this.selectedItems) {
				const index = baseArray.findIndex((user) => user.id === selectedUser.id);
				if (index < 0) return true;
			}
			return false;
		},
		resetSelectedItems() {
			this.selectedItems = []
		},
		addUser(user: User) {
			this.users.push(user);
		},
		removeUser(userToRemoveId: number) {
			const index = this.users.findIndex(user => user.id === userToRemoveId);
			this.users.splice(index, 1);
		},
		removeFriend(friendToRemoveId: number) {
			const index = this.friends.findIndex(friend => friend.id === friendToRemoveId);
			this.friends.splice(index, 1);
		},
		updateUser(userToChange: User) {
			const index = this.users.findIndex(user => user.id === userToChange.id);
			this.users[index] = userToChange
			if (this.isFriend(userToChange.id))
			{
				const index = this.friends.findIndex(friend => friend.id === userToChange.id);
				this.users[index] = userToChange
			}
		}

	}
});
