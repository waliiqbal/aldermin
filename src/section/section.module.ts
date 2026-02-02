/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController} from '../section/section.controller'
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';




@Module({
 
   imports: [AuthModule, RedisModule],
  controllers: [SectionController],
  providers: [SectionService], 
  exports: [SectionService], 

})

export class SectionModule {}