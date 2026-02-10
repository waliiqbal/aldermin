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
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';  
import { UpdateStudentDto } from './dto/addStudentHimself.dto'; 



@Controller('student')
export class StudentController {
  constructor(
    private readonly StudentService: StudentService,


  ) {}

   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'adminStaff')
 @Post('addStudentWithParent')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.StudentService.addStudentWithParent(body, adminId);

}

@UseGuards(JwtAuthGuard)
  @Post('addStudentDetails')
  async updateStudentDetails(
    @Req() req: any,
    @Body() body: UpdateStudentDto,
  ) {
    const studentId = req.user.userId;
    return this.StudentService.addStudentDetailsBySelf(body, studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addParentDetails')
  async addParentDetailsBySelf(
    @Req() req: any,
    @Body() body: any,
  ) {
    const parentId = req.user.userId;
    
    return this.StudentService.addParentDetailsBySelf(body, parentId);
  }

  @UseGuards(JwtAuthGuard)
@Get('getParentBySelf')
async getParentBySelf(@Req() req: any) {

  const parentId = req.user.userId;

  return this.StudentService.getParentBySelf(parentId);
}


  @UseGuards(JwtAuthGuard)
@Get('getStudentBySelf')
async getStudentBySelf(@Req() req: any) {

  const studentId = req.user.userId; 

  return this.StudentService.getStudentBySelf(studentId);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  


    @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'adminStaff')
@Post('promoteStudent')
async promoteStudent(
  @Req() req: any,
  @Body() body: {
    studentId: string;
    newClassId: string;
    newSectionId: string;
    newRollNo: number;
    newAcademicYear: string;
    campusId?: string; 
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
    body.campusId,
  );
}


}