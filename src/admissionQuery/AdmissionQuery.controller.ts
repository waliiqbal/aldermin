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
  @UseGuards(AuthGuard('jwt'))
@Get('get-admission-queries')
async getAdmissionQueries(
  @Req() req: any,
  @Query('date') date?: string,
  @Query('classId') classId?: string,
  @Query('status') status?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  const adminId = req.user.userId; 

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }

  return this.AdmissionQueryService.getAdmissionQueries(
    { date, classId, status },
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
  );
}

@UseGuards(AuthGuard('jwt'))
@Post('editAdmissionQuery')
async editAdmissionQuery(
  @Req() req: any,
  @Body() body: any
) {
  const adminId = req.user.userId;


  const { id } = body;
  if (!id) {
    throw new BadRequestException('Admission query ID is required');
  }

  return this.AdmissionQueryService.editAdmissionQuery(id, body, adminId);
}

@UseGuards(AuthGuard('jwt'))
@Post('deleteAdmissionQuery')
async deleteAdmissionQuery(
  @Req() req: any,
  @Body() body: any
) {
  const adminId = req.user.userId;

  const { id } = body;
  if (!id) {
    throw new BadRequestException('Admission query ID is required');
  }

  return this.AdmissionQueryService.deleteAdmissionQuery(id, adminId);
}


}