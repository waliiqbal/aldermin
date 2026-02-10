


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
  @Roles('schoolAdmin', 'campusAdmin', 'adminStaff')
  @Get('getSections')
  async getSections(
    @Req() req: any,
    @Query('classId') classId?: string,
    @Query('campusId') campusId?: string,
  ) {
    const adminId = req.user.userId;
    return this.sectionService.getAllSectionsByAdmin(adminId, classId, campusId);
  }

  // 🔹 Add Section
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('schoolAdmin', 'campusAdmin', 'adminStaff')
  @Post('addSection')
  async addSection(
    @Req() req: any,
    @Body() body: any,
  ) {
    const adminId = req.user.userId;
    return this.sectionService.addSection(body, adminId);
  }

  // 🔹 Edit Section
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('schoolAdmin', 'campusAdmin', 'adminStaff')
  @Post('editSection/:sectionId')
  async editSection(
    @Req() req: any,
    @Param('sectionId') sectionId: string,
    @Body() body: any,
  ) {
    const adminId = req.user.userId;
    return this.sectionService.editSection(sectionId, body, adminId);
  }
}
  

