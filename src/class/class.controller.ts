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
import { ClassService } from './class.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';  


@Controller('Class')
export class ClassController {
  constructor(
    private readonly classService: ClassService,


  ) {}

  
 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('campusAdmin', 'adminStaff', 'admin')
@Post('addClass')
async addClass(@Req() req: any, @Body() body: any) {
  const adminId = req.user.userId;

  return this.classService.addClass(body, adminId);
}


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('campusAdmin', 'adminStaff', 'admin')
@Post('editClass/:classId')
async editClass(
  @Req() req: any,
  @Param('classId') classId: string,
  @Body() body: any,
) {
  const adminId = req.user.userId;
  return this.classService.editClass(classId, body, adminId);
}


// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin', 'adminStaff')
// @Get('getClassesByCampusAdmin')
// async getClassesByCampusAdmin(@Req() req: any, body: any) {
//   const adminId = req.user.userId;
//   return this.classService.getClassesByCampusAdmin(adminId);
// }

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin', 'adminStaff')
// @Get('getCampusClassesBySchoolAdmin/:campusId')
// async getCampusClassesBySchoolAdmin(
//   @Req() req: any,
//   @Param('campusId') campusId: string,
// ) {
//   const adminId = req.user.userId;
//   return this.classService.getCampusClassesBySchoolAdmin(adminId, campusId);
// }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'campusAdmin', 'adminStaff')
@Get('getClassesByAdmin')
async getClasses(
  @Req() req: any,
  @Query('campusId') campusId?: string,
) {
  const adminId = req.user.userId;

  return this.classService.getClassesByAdmin(adminId, campusId);
}






}