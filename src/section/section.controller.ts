


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
    private readonly classService: SectionService,


  ) {}

  @UseGuards(AuthGuard('jwt'))
 @Post('addSection')
 async addSection(@Req() req: any, @Body() body: any) {
   const adminId = req.user.userId;

   return this.classService.addSection(body, adminId);

}

@UseGuards(AuthGuard('jwt'))
@Get('getAllSections')
async getAllSections(@Req() req: any, @Query('classId') classId?: string) {
  const adminId = req.user.userId;
  return this.classService.getAllSectionsByAdmin(adminId, classId);
}


}