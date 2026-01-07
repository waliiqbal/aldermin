/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'
import { OtpModule } from 'src/otp/otp.module';

import { User, UserSchema } from '../user/schema/user.schema';
import { RedisModule } from 'src/redis/redis.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
   
    ConfigModule,
     OtpModule,
    RedisModule,
    PassportModule,

  
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    // ✅ User schema inject for MongoDB
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard], 
})
export class AuthModule {}
