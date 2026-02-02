/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { IdCardController } from './IDCard.controller';
import { IDCardService } from './IDCard.service';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [IdCardController ],
  providers: [IDCardService], 
  exports: [IDCardService], 

})

export class IdCardModule {}