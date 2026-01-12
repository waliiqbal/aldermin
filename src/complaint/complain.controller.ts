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
import { ComplainService } from './complain.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import  { CreateComplaintDto } from '../complaint/dto/addComplain.dto'


@Controller('complain')
export class ComplainController {
  constructor(
    private readonly complainService: ComplainService,

    

  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('addComplain')
  async addComplain(
    @Body() CreateComplaintDto: CreateComplaintDto,
    @Req() req: any
  ) {
      const { userId, userType } = req.user;
      console.log ('UserID:', userId, 'UserType:', userType);
    return this.complainService.addComplaint(CreateComplaintDto, userId, userType);
  }


 @UseGuards(JwtAuthGuard)
@Post('edit-complaint')
async editComplaint(
  @Req() req: any,
  @Body() body: any,
) {
  const userId = req.user.userId;
  const userType = req.user.userType; 

  const { complaintId, ...updateComplaintDto } = body;

  return this.complainService.editComplaint(
    userId,
    userType,
    complaintId,
    updateComplaintDto,
  );
}

@UseGuards(JwtAuthGuard)
@Get('get-complaint-by-id/:complaintId')
async getComplaintById(
  @Req() req: any,
  @Param('complaintId') complaintId: string,
) {

   const {userId, userType} = req.user;

  return this.complainService.getComplaintById(
    userId,
    userType,
    complaintId,
  );
}

@UseGuards(JwtAuthGuard)
@Get('getAllComplaintsByAdmin')
async getAllComplaints(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('source') source?: string,
  @Query('status') status?: string,
  @Query('date') date?: string,
) {
  const adminId = req.user.userId;

  return this.complainService.getAllComplaintsByAdmin(
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
    source,
    status,
    date,
  );
}






}