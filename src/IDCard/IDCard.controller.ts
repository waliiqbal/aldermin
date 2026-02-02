import { Body, Controller, Post, Req, UseGuards , Get, Query, Param} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { IDCardService } from './IDCard.service';
import { CreateIdCardTemplateDto } from './dto/createIDCard.dto';



@Controller('IdCardTemplate')
export class IdCardController {
  constructor(private readonly IDCardService: IDCardService) {}


  @UseGuards(JwtAuthGuard)
  @Post('addIdCardTemplate')
  async addIdCardTemplatele(
    @Body()CreateIdCardTemplateDto: CreateIdCardTemplateDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;

    return this.IDCardService.addIdCardTemplate(CreateIdCardTemplateDto, adminId);
  }

  @UseGuards(JwtAuthGuard)
@Get('id-card-templates')
async getAllIdCardTemplates(
  @Req() req: any,
) {
  const adminId = req.user.userId;

  return this.IDCardService.getAllIdCardTemplatesByAdmin(adminId);
}


}