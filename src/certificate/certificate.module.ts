/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { AuthModule } from 'src/auth/auth.module';  
import { RedisModule } from 'src/redis/redis.module';  




@Module({
 
   imports: [AuthModule, RedisModule], 
  controllers: [CertificateController],
  providers: [CertificateService], 
  exports: [CertificateService], 

})

export class CertificateModule {}