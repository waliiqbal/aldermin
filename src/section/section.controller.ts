


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


@Controller('section')
export class SectionController {
  constructor(
    private readonly sectionService: SectionService,


  ) {}

  @UseGuards(AuthGuard('jwt'))
 @Post('addSection')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.sectionService.addSection(body, adminId);

}

@UseGuards(AuthGuard('jwt'))
@Get('getAllSections')
async getAllSections(@Req() req: any, @Query('classId') classId?: string) {
  const adminId = req.user.userId;
  return this.sectionService.getAllSectionsByAdmin(adminId, classId);
}

@UseGuards(AuthGuard('jwt'))
  @Post('assignClassTeacher')
  async assignClassTeacher(
    @Req() req: any, 
    @Body() body: any
  ) {
    const adminId = req.user.userId;
    return this.sectionService.assignClassTeacher(body, adminId);
  }

   @UseGuards(AuthGuard('jwt'))
  @Post('editSection')
  async editSection(@Req() req: any, @Body() body: any) {
    const adminId = req.user.userId; 

 
    return this.sectionService.editSection(body, adminId);
  }

  

}