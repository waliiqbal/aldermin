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
 @Roles('admin', 'adminStaff')
@Post('addClass')
async addClass(@Req() req: any, @Body() body: any) {
  const adminId = req.user.userId;

  return this.classService.addClass(body, adminId);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'adminStaff')
@Get('getClasses')
async getClasses(@Req() req: any) {
  const adminId = req.user.userId;
  return this.classService.getClassesByAdmin(adminId);
}



}