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
import { SectionService } from '../section/section.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';


@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly AttendanceService: AttendanceService,


  ) {}
  
  
  @UseGuards(AuthGuard('jwt'))
 @Post('addAttendance')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.AttendanceService.addAttendance(body, adminId);

}

@UseGuards(AuthGuard('jwt'))
@Post('addBulkAttendance')
async addAttendance(@Req() req: any, @Body() body: any) {
  const teacherId = req.user.userId; // JWT se teacherId

  return this.AttendanceService.addBulkAttendanceByTeacher(
    teacherId,
    body,
  );
}


@UseGuards(AuthGuard('jwt'))
@Get('getAttendance')
async getAttendance(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('classId') classId?: string,
  @Query('sectionId') sectionId?: string,
  @Query('studentId') studentId?: string,
  @Query('date') date?: string  
) {
  const adminId = req.user.userId; 

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }

  return this.AttendanceService.getAttendance(
    adminId,
    Number(page) || 1,  
    Number(limit) || 10,  
    classId,
    sectionId,
    studentId,
    date
  );
}

@UseGuards(AuthGuard('jwt'))
@Get('getAttendanceByTeacher')
async getAttendanceByTeacher(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('date') date?: string,
) {
  const teacherId = req.user.userId;

  if (!teacherId) {
    throw new BadRequestException('Invalid teacher token');
  }

  return this.AttendanceService.getAttendanceByTeacher(
    teacherId,
    Number(page) || 1,
    Number(limit) || 10,
    date,
  );
}



}

