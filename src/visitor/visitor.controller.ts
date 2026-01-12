


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

} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import  { CreateVisitorDto } from '../visitor/dto/addVisitor.dto'


@Controller('visitor')
export class VisitorController {
  constructor(
    private readonly VisitorService: VisitorService,
    ) {}

      @UseGuards(JwtAuthGuard)
      @Post('addVisitor')
      async addComplain(
        @Body()  CreateVisitorDto:  CreateVisitorDto,
        @Req() req: any
      ) {
       const adminId = req.user.userId;
     
        return this.VisitorService.addVisitor( CreateVisitorDto, adminId );
      }
    
      
 @UseGuards(JwtAuthGuard)
@Post('editVisitor')
async editVisitor(
  @Req() req: any,
  @Body() body: any,
) {
  const adminId = req.user.userId;


  const { visitorId, ...CreateVisitorDto } = body;

  return this.VisitorService.editVisitorByAdmin(
    adminId,
    visitorId,
    CreateVisitorDto,
  );
}

@UseGuards(JwtAuthGuard)
@Get('get-visitor/:id')
async getVisitorById(
  @Param('id') visitorId: string,
  @Req() req: any,

  
) {

 const AdminId = req.user.userId;
  return this.VisitorService.getVisitorById(visitorId, AdminId);
}

@UseGuards(JwtAuthGuard)
@Get('getAllVisitorsByAdmin')
async getAllVisitorsByAdmin(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('idCardNumber') idCardNumber?: string,
  @Query('visitDate') visitDate?: string,
) {
  const adminId = req.user.userId;

  return this.VisitorService.getAllVisitorsByAdmin(
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
    idCardNumber,
    visitDate,
  );
}

  }