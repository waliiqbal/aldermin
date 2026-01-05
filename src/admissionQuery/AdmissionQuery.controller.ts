import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Body,
  Req,
  UnauthorizedException,
  NotFoundException,
  BadRequestException

} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { AdmissionQueryService } from './AdmissionQuery.service';


@Controller('AdmissionQuery')
export class AdmissionQueryController {
  constructor(
    private readonly AdmissionQueryService: AdmissionQueryService,


  ) {}
  
  
  @UseGuards(AuthGuard('jwt'))
 @Post('addAdmissionQuery')
 async addAdmissionQuery(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.AdmissionQueryService.addAdmissionQuery(body, adminId);

}

}