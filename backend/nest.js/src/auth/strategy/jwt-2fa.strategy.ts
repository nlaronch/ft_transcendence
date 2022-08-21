import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, Profile } from "passport-42";
import { ExtractJwt } from "passport-jwt";
import { UsersService } from "src/users/users.service";


@Injectable()
export class JwtTFAStrategy extends PassportStrategy(Strategy, "jwt-2fa"){
	constructor(private usersService: UsersService) {
		super({
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  ignoreExpiration: false,
		  secretOrKey: process.env.FT_PASS
		});
	}

	async validate(userId: number, payload: any) {
		const user = await this.usersService.findOne(userId);
		if (!user.twoFactorSecret) {
			return user;
		}
		else if (payload.TFA_auth) {
			return user;
		}
	}
}
