import { Controller, Post, Body, Req, UseGuards, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './homework.dto';

@Controller('homework') 
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('addHomework')
  async addHomework(
    @Req() req: any,
    @Body() createHomeworkDto: CreateHomeworkDto, 
  ) {
     const { userId, userType } = req.user;
    return this.homeworkService.addHomework(createHomeworkDto, userId, userType);
  }

 @UseGuards(AuthGuard('jwt'))
  @Get('getHomeworksByAdmin')
  async getHomeworksByAdmin(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const adminId = req.user.userId;

    if (!adminId) {
      throw new BadRequestException('Invalid admin token');
    }

    return this.homeworkService.getHomeworksByAdmin(
      adminId,
      Number(page) || 1,
      Number(limit) || 10,
      classId,
      sectionId,
      subjectId
    );
  }

   @UseGuards(AuthGuard('jwt'))
  @Get('getHomeworksByTeacher')
async getHomeworksByTeacher(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('classId') classId?: string,
  @Query('sectionId') sectionId?: string,
  @Query('subjectId') subjectId?: string,
  @Query('homeworkDate') homeworkDate?: Date,
) {
  const teacherId = req.user.userId;

  if (!teacherId) {
    throw new BadRequestException('Invalid teacher token');
  }

  return this.homeworkService.getHomeworksByTeacher(
    teacherId,
    Number(page) || 1,
    Number(limit) || 10,
    classId,
    sectionId,
    subjectId,
    homeworkDate,
  );
}



}
