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
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';


@Controller('student')
export class StudentController {
  constructor(
    private readonly StudentService: StudentService,


  ) {}

    @UseGuards(AuthGuard('jwt'))
 @Post('addStudentWithParent')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.StudentService.addStudentWithParent(body, adminId);

}

@UseGuards(AuthGuard('jwt'))
  @Get('getStudentsByAdmin')
  async getStudents(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    const adminId = req.user.userId;
    if (!adminId) throw new UnauthorizedException('Admin not found in token');

    return this.StudentService.getStudentsByAdmin(adminId, { page, limit, classId, sectionId });
  }


@UseGuards(AuthGuard('jwt')) 
@Post('promoteStudent')
async promoteStudent(
  @Req() req: any,
  @Body() body: {
    studentId: string;
    newClassId: string;
    newSectionId: string;
    newRollNo: number;
    newAcademicYear: string;
  },
) {
  const adminId = req.user.userId;
  if (!adminId) throw new UnauthorizedException('Admin not found in token');


  return this.StudentService.promoteStudent(
    adminId,
    body.studentId,
    body.newClassId,
    body.newSectionId,
    body.newRollNo,
    body.newAcademicYear,
  );
}


}