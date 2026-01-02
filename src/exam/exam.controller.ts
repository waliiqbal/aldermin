


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
import { ExamService } from './exam.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { CreateExamDto } from './dto/createexam.dto';
import { CreateExamScheduleDto } from './dto/createExamSchedule.dto';


@Controller('Exam')
export class ExamController {
  constructor(
    private readonly ExamService: ExamService,


  ) {}


  @UseGuards(AuthGuard('jwt'))
@Get('getExamTypes')
async getExamTypes(@Req() req: any) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }

  // Define exam types
  const examTypes = [
    'Midterm',
    'Final',
    'Preliminary',
  ];

  return {
    message: 'Exam types fetched successfully',
    data: examTypes,
  };
}

 @UseGuards(AuthGuard('jwt'))
 @Post('addExam')
  async addExam(@Body() createExamDto: CreateExamDto, @Req() req: any) {
    const adminId = req.user.userId; 


    return this.ExamService.addExam(createExamDto, adminId);
  }

  
 @UseGuards(AuthGuard('jwt'))
 @Post('addExamSchedule')
  async addExamSchedule(@Body() CreateExamScheduleDto: CreateExamScheduleDto, @Req() req: any) {
    const adminId = req.user.userId; 


    return this.ExamService.addExamSchedule(CreateExamScheduleDto, adminId);
  }
@UseGuards(AuthGuard('jwt'))
@Get('getExams')
async getExams(@Req() req: any, @Query() query: any) {
  const adminId = req.user.userId;  
  return this.ExamService.getExamsByAdmin(adminId, query);  
}


@UseGuards(AuthGuard('jwt'))
@Get('getExamScedule')
async getExamSchedule(@Req() req: any,
 @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
     @Query('examId') examId?: string,

) {
  const adminId = req.user.userId;  
  return this.ExamService.getExamSchedule(
      adminId,
      Number(page) || 1,
      Number(limit) || 10,
      classId,
      sectionId,
      subjectId,
      examId

  );
}



@UseGuards(AuthGuard('jwt'))
@Get('getResultsByYear')
async getResultsByYear(@Req() req: any,
 @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
     @Query('examType') examType?: string,
      @Query('year') year?: number,

) {
  const adminId = req.user.userId;  
  return this.ExamService.getResultsByYear(
      adminId,
      Number(page) || 1,
      Number(limit) || 10,
      classId,
      sectionId,
      examType,
      year


  );
  


  
}

@UseGuards(AuthGuard('jwt'))
@Post('addStudentMarks')
async addStudentMarks(@Req() req: any, @Body() body: any) {
  return this.ExamService.addStudentMarks(body);
}

@UseGuards(AuthGuard('jwt'))
@Get('getResultsByStudent')
async getResultsByStudent(@Req() req: any,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
     @Query('studentId') studentId?: string,
     @Query('examType') examType?: string,
      @Query('year') year?: number,

) {
  const adminId = req.user.userId;  
  return this.ExamService.getResultsByStudent(
      adminId,
      classId,
      sectionId,
      studentId,
      examType,
      year,


  );
  


  
}



}

