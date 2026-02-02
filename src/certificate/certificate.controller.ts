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
import { CertificateService } from './certificate.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';  


@Controller('Certificate')
export class CertificateController {
  constructor(
    private readonly certificateController: CertificateService,


  ) {}

@UseGuards(JwtAuthGuard)
@Post('addCertificateTemplate')
async addCertificateTemplate(
  @Body() body: any,
  @Req() req: any,
) {
  const adminId = req.user.userId;

  return this.certificateController.addCertificateTemplate(body, adminId);
}



}  