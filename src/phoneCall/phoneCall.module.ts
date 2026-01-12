/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PhoneCallService } from './phoneCall.service';
import { phoneCallController } from './phoneCall.controller';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [phoneCallController],
  providers: [PhoneCallService], 
  exports: [PhoneCallService], 

})

export class phoneCallModule {}