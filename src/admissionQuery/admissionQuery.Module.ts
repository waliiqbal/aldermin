/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AdmissionQueryController } from './AdmissionQuery.controller';
import { AdmissionQueryService } from './AdmissionQuery.service';




@Module({
 
  controllers: [  AdmissionQueryController],
  providers: [AdmissionQueryService], 
  exports: [AdmissionQueryService], 

})

export class AdmissionQueryModule {}