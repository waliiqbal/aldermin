


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
import { SectionService } from '../section/section.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';


@Controller('section')
export class SectionController {
  constructor(
    private readonly sectionService: SectionService,


  ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'adminStaff')
 @Post('addSection')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.sectionService.addSection(body, adminId);

}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'adminStaff')
@Get('getAllSections')
async getAllSections(@Req() req: any, @Query('classId') classId?: string) {
  const adminId = req.user.userId;
  return this.sectionService.getAllSectionsByAdmin(adminId, classId);
}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'adminStaff')
  @Post('assignClassTeacher')
  async assignClassTeacher(
    @Req() req: any, 
    @Body() body: any
  ) {
    const adminId = req.user.userId;
    return this.sectionService.assignClassTeacher(body, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'adminStaff')
  @Post('editSection')
  async editSection(@Req() req: any, @Body() body: any) {
    const adminId = req.user.userId; 

 
    return this.sectionService.editSection(body, adminId);
  }

  

}