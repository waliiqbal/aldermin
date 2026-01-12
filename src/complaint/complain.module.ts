/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ComplainService } from './complain.service';
import { ComplainController } from './complain.controller';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [ComplainController],
  providers: [ComplainService], 
  exports: [ComplainService], 

})

export class ComplainModule {}