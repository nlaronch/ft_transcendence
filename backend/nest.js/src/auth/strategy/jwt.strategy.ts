import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from "passport-jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt"){
	constructor(private usersService: UsersService) {
		super({
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  ignoreExpiration: false,
		  secretOrKey: process.env.FT_PASS
		});
	}

	async validate(userId: number) {
		const user = await this.usersService.findOne(userId);
		return user;
	}

}
