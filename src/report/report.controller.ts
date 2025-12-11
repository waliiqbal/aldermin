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
import { SectionService } from '../section/section.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { AddReportDto } from './dto/addReport.dto';
import { ReportService } from './report.service';


@Controller('report')
export class ReportController {
  constructor(
    private readonly ReportService: ReportService,




  ) {}

  @UseGuards(AuthGuard('jwt'))
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

@UseGuards(AuthGuard('jwt')) 
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

@UseGuards(AuthGuard('jwt'))
@Get('getReportsByAdmin')
async getReportsByAdmin(
  @Req() req: any,
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
    Number(page) || 1,
    Number(limit) || 10,
    classId,
    sectionId,
    incidentType
  );
}



}