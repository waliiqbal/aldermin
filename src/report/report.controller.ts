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
  BadRequestException

} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { AddReportDto } from './dto/addReport.dto';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';  


@Controller('report')
export class ReportController {
  constructor(
    private readonly ReportService: ReportService,




  ) {}


@Get('getIncidentTypes')
async getIncidentTypes(@Req() req: any) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }


  const incidentTypes = [
    'Misbehave',          
    'Late',              
    'Fighting',           
    'School Violence',    
    'Homework Not Completed', 
    'Disrespect to Teacher', 
    'Breaking School Laws', 
    'Use of Drugs',        
    'Bullying',           
    'Vandalism',           
  ];

  return {
    message: 'Incident types fetched successfully',
    data: incidentTypes,
  };
}

 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('admin', 'adminStaff')
@Post('addReport')
async addReport(
  @Req() req: any,
  @Body() addReportDto: AddReportDto,  
) {
  const adminId = req.user.userId;  

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }


  return this.ReportService.addReportByAdmin(addReportDto, adminId);
}

 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('admin', 'adminStaff')
@Get('getReportsByAdmin')
async getReportsByAdmin(
  @Req() req: any,
  
  @Query('academicYear') academicYear?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('classId') classId?: string,
  @Query('sectionId') sectionId?: string,
  @Query('incidentType') incidentType?: string, // new
) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }

  return this.ReportService.getReportsByAdmin(
    adminId,
    academicYear,
    Number(page) || 1,
    Number(limit) || 10,
    classId,
    sectionId,
    incidentType
  );
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Get('getReportsByTeacher')
async getReportsByTeacher(
  @Req() req: any,
  @Query('academicYear') academicYear?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('classId') classId?: string,
  @Query('sectionId') sectionId?: string,
  @Query('incidentType') incidentType?: string, 
) {
  
  const teacherId = req.user.userId;

  if (!teacherId) {
    throw new BadRequestException('Invalid teacher token');
  }

  return this.ReportService.getReportsByTeacher(
    teacherId,
    Number(page) || 1,
    Number(limit) || 10,
    classId,
    sectionId,
    incidentType,
    academicYear, 
  );
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Post('addReportByTeacher')
async addReportByTeacher(
  @Req() req: any,
  @Body() addReportDto: AddReportDto,  
) {
  const adminId = req.user.userId;  

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }


  return this.ReportService.addReportByTeacher(addReportDto, adminId);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Post('editReportByTeacher')
async editReportByTeacher(
  @Req() req: any,
  @Body() body: any,
) {
  const teacherId = req.user.userId;

  if (!teacherId) {
    throw new BadRequestException('Invalid teacher token');
  }

  const { reportId, ...updateData } = body;

  if (!reportId) {
    throw new BadRequestException('Report ID is required');
  }

  return this.ReportService.editReportByTeacher(reportId, teacherId, updateData);
}


}