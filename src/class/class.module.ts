/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController} from '../class/class.controller'
import { AuthModule } from 'src/auth/auth.module';  // JwtAuthGuard export hua hai
import { RedisModule } from 'src/redis/redis.module';  // optional if AuthModule exports Redis




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [ClassController],
  providers: [ClassService], 
  exports: [ClassService], 

})

export class ClassModule {}