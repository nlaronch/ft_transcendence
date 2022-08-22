import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string) {
		return axios.post('auth/login', { code }).then((response) => {
			if (response.data.auth.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
			}
			return response.data;
		})
	}

	login2FA(otpToken: string) {
		return axios.post('auth/2fa/login', { otpToken }).then((response) => {
			console.log(response.data)
			if (response.data.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
			}
			return response.data;
		});
	}

	registerUser(id: number, username: string, avatar: string) {
		return axios.patch(`users/register/${id}`, { username, avatar });
	}

	enable2FA() {
		return axios.get('auth/2fa/enable');
	}

	disable2FA() {
		return axios.get('auth/2fa/disable');
	}

	getQrCode2FA() {
		return axios.get('auth/2fa/qr-code');
	}
}

export default new AuthService();
