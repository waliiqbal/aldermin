/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  
import { OtpModule } from 'src/otp/otp.module';




@Module({
 
   imports: [AuthModule, RedisModule, OtpModule], 
  controllers: [StudentController],
  providers: [StudentService], 
  exports: [StudentService], 

})

export class StudentModule {}