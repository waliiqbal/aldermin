/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PostalController } from './postal.controller';
import { PostalService } from './postal.service';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [PostalController],
  providers: [PostalService], 
  exports: [PostalService], 

})

export class PostalModule {}