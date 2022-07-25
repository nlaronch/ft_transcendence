import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config: ConfigService = app.get(ConfigService);
	const port: number = config.get<number>('PORT');

	// setting localhost:3000 to localhost:3000/api
	// app.setGlobalPrefix('api');

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
	await app.listen(port, () => {
	  console.log('[WEB]', 'http://localhost:' + port);
	});
}
bootstrap();
