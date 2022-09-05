import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';

class AuthService {
	login(code: string) {
		return axios.post('auth/42/redirect', { code }).then((response) => {
			if (response.data.auth.token_jwt) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		})
	}

	fakeLogin(username: string) {
		return axios.get('auth/fakeLogin/' + username).then((response) => {
			console.log('get request fakelogin')
			if (response.data.auth.token_jwt) {
				console.log('auth token yes')
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		})
	}

	login2FA(otpToken: string) {
		return axios.post('2fa/authenticate', { otpToken }).then((response) => {
			console.log(response.data)
			if (response.data.auth.token_jwt) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		});
	}

	getAuth() {
		return axios.get('auth/me');
	}

	registerUser(username: string, avatar: string) {
		return axios.patch(`users/register`, { username, avatar });
	}

	enable2FA(twoFacode: number) {
		return axios.post('2fa/enable', { twoFacode });
	}

	disable2FA() {
		return axios.get('2fa/disable');
	}

	getQrCode2FA() {
		return axios.get('2fa/generate');
	}
}

export default new AuthService();
