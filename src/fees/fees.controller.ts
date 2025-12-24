import { Controller, Post, Body, Req, UseGuards, BadRequestException, Get, NotFoundException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeesTypeService } from './fees.service'
import { CreateFeesDto } from './createfees.dto';

@Controller('fees')
export class FeesTypeController {
  constructor(private readonly feesTypeService: FeesTypeService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('addFeesType')
  async addFeesType(
    @Req() req: any,
    @Body() body: { name: string; description?: string },
  ) {
    const adminId = req.user.userId;

    if (!adminId) {
      throw new BadRequestException('Admin not found in token');
    }

    return this.feesTypeService.addFeesType(adminId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getAllFeesType')
  async getAllFeesType() {
    return this.feesTypeService.getAllFeesType();
  }
  
   @UseGuards(AuthGuard('jwt'))
@Post('createInvoice')
async createFees(
  @Req() req: any,
  @Body() body: CreateFeesDto,
) {
  const adminId = req.user?.userId;

  if (!adminId) {
    throw new BadRequestException('Admin not found in token');
  }

  return this.feesTypeService.createFees(adminId, body);
}

 @UseGuards(AuthGuard('jwt'))
  @Get('Getinvoice')
  async getFeesInvoice(@Req() req: any, @Query() query: any) {
    const adminId = req.user.userId;
    if (!adminId) throw new NotFoundException('Admin not found in token');
    return this.feesTypeService.getFeesInvoice(adminId, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment')
  async payFees(@Req() req: any, @Body() body: any) {
    const adminId = req.user.userId;
    if (!adminId) throw new NotFoundException('Admin not found in token');

    return this.feesTypeService.payFees(adminId, body);
  }
}


