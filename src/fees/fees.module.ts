/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FeesTypeController } from './fees.controller';
import { FeesTypeService } from './fees.service';




@Module({
 
  controllers: [FeesTypeController],
  providers: [FeesTypeService], 
  exports: [FeesTypeService], 

})

export class FeesModule {}