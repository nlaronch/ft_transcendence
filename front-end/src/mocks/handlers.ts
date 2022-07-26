import { rest } from 'msw';
import users from "@/data/users";
import matchs from "@/data/matchs";
import friends from "@/data/friends";

export default [

	rest.get('/users', (req, res, ctx) => {
		return res(
			ctx.json(users)
		);
	}),

	rest.get('/user/:username', (req, res, ctx) => {
		return res(
			ctx.json(users.find(user => user.username === req.params.username))
		);
	}),
	rest.get('/matchs', (req, res, ctx) => {
		return res(
			ctx.json(matchs)
		);
	}),
	rest.get('/user/friends/:username', (req, res, ctx) => {
		return res(
			ctx.json(friends.get(req.params.username as string))
	)}),
];
