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
    const adminId = req.user.userId;
    return this.homeworkService.addHomework(createHomeworkDto, adminId);
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

}
