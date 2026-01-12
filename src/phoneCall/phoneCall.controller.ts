
import { Body, Controller, Post, Req, UseGuards , Get, Query, Param} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PhoneCallService } from './phoneCall.service';
import { CreatePhoneCallDto } from './dto/addPhoneCall.dto';

@Controller('phoneCall')
export class phoneCallController {
  constructor(private readonly PhoneCallService: PhoneCallService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Post('addPhoneCall')
  async addPhoneCall(
    @Body() createPostalDto: CreatePhoneCallDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;

    return this.PhoneCallService.addPhoneCall(createPostalDto, adminId);
  }

@UseGuards(JwtAuthGuard)
@Get('getAllPhoneCallsByAdmin')
async getAllPhoneCalls(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('callType') callType?: string, // INCOMING | OUTGOING
  @Query('date') date?: string,
) {
  const adminId = req.user.userId;

  return this.PhoneCallService.getAllPhoneCallsByAdmin(
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
    callType,
    date,
  );
}


}