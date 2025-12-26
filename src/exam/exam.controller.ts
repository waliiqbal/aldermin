


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


@Controller('section')
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
@Get('getExams')
async getExams(@Req() req: any, @Query() query: any) {
  const adminId = req.user.userId;  
  return this.ExamService.getExamsByAdmin(adminId, query);  
}


}

