import { defineStore } from 'pinia';
import type { Auth, UserState } from '@/types/UserState';
import { useGlobalStore } from './globalStore';
import { useChatStore } from '@/stores/chatStore';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import router from '@/router/index'
import Status from '@/types/Status';
import socket from '@/plugin/socketInstance';
import defaultImage from '@/assets/anonymize.png';

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userAuth: { token_jwt: AuthService.getJwtToken() },
		userData: {} as User,
	}),
	getters: {
		isLoggedIn: (state) => state.userAuth.islogin === true,
		isRegistered: (state) => state.userData.username !== null,
	},
	actions: {
		logUser() {
			if (this.userAuth.token_jwt)
			{
				sessionStorage.setItem('userAuth', this.userAuth.token_jwt);
				this.userAuth.islogin = true
				this.userData.status = Status.ONLINE
			}
		},
		verifyState(state: string) {
			const randomString = sessionStorage.getItem('state')
			sessionStorage.removeItem('state');
			if (!randomString || randomString && state !== randomString)
				throw new Error('State is not valid')
		},
		async handleLogin(code: string, state: string) {
			try {
				this.verifyState(state);
				const response = await AuthService.login(code);
				this.userAuth = response.data.auth;
				if (!this.userAuth.has_2fa)
				{
					this.userData = response.data.user;
					// 42 image fetch do not work.
					this.userData.avatar = defaultImage;
					if (this.isRegistered && !this.userAuth.has_2fa) this.logUser()
				} 
			} catch (error: any) {
				throw error;
			}
		},
		/*async handleFakeLogin(username: string) {
			try {
				const response = await AuthService.fakeLogin(username);
				this.userAuth = response.data.auth;
				if (!this.userAuth.has_2fa)
				{
					this.userData = response.data.user;
					if (this.isRegistered && !this.userAuth.has_2fa) this.logUser()
				}
			} catch (error: any) {
				throw error;
			}
		},*/
		async handleLogin2Fa(twoFaCode: string) {
			try {
				const response = await AuthService.login2FA(twoFaCode);
				this.userAuth = response.data.auth;
				this.userData = response.data.user;
				this.logUser()
			} catch (error: any) {
				throw error;
			}
		},
		handleLogout() {
			const globalStore = useGlobalStore();
			const chatStore = useChatStore();
			this.userAuth = {} as Auth
			sessionStorage.clear();
			globalStore.$reset();
			chatStore.$reset();
			socket.disconnect()
			router.replace({ path: '/' });
		},
		async registerUser(newUsername: string, newAvatar: string) {
			try {
				if (this.userData.avatar === newAvatar) newAvatar = '';
				await UserService.registerUser(newUsername, newAvatar);
				if (newAvatar) this.userData.avatar = newAvatar;
				this.userData.username = newUsername;
				this.logUser()
			} catch (error: any) {
				throw error;
			}
		},
		async fetchAll() {
			try {
				await Promise.all([this.fetchMe(), this.fetchAuth()])
			} catch (error: any) {
				throw error;
			}
		},
		async fetchMe() {
			try {
				const response = await UserService.getMe();
				this.userData = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchAuth() {
			try {
				const response = await AuthService.getAuth();
				this.userAuth.has_2fa = response.data.has_2fa;
			} catch (error: any) {
				throw error;
			}
		},
		update2FA(value: boolean) {
			this.userAuth.has_2fa = value;
		},
		async updateUsername(newUsername: string) {
			try {
				await UserService.updateUsename(newUsername);
				this.userData.username = newUsername;
			} catch (error: any) {
				throw error;
			}
		},
		async updateAvatar(newAvatar: string) {
			try {
				await UserService.updateAvatar(newAvatar);
				this.userData.avatar = newAvatar;
			} catch (error: any) {
				throw error;
			}
		},
	},
});
