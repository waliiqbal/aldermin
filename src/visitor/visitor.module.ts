
import { Module } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [VisitorController],
  providers: [ VisitorService], 
  exports: [ VisitorService], 

})

export class VisitorModule {}