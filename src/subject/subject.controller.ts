


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
import { SubjectService } from './subject.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';


@Controller('subject')
export class SubjectController {
  constructor(
    private readonly SubjectService: SubjectService,


  ) {}

  @UseGuards(AuthGuard('jwt'))
 @Post('addSubject')
 async addSubject(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.SubjectService.addSubject(body, adminId);

}

@UseGuards(AuthGuard('jwt'))
@Get('getAllSubjects')
async getAllSections(@Req() req: any, @Query('classId') classId?: string) {
  const adminId = req.user.userId;
  return this.SubjectService.getAllSubjectByAdmin(adminId, classId);
}


}