import { Controller, Post, Body, Req, UseGuards, BadRequestException, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeesTypeService } from './fees.service'

@Controller('fees-type')
export class FeesTypeController {
  constructor(private readonly feesTypeService: FeesTypeService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
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
  @Get('getAll')
  async getAllFeesType() {
    return this.feesTypeService.getAllFeesType();
  }
  
   @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createFees(
    @Req() req: any,
    @Body() body: {
      studentId: string;
      schoolId: string;
      feesGroupId: string;
      issueDate: string;
      dueDate: string;
      month?: string;
      items: { feesTypeId: string; amount: number }[];
    },
  ) {
    const adminId = req.user.userId;

    if (!adminId) {
      throw new BadRequestException('Admin not found in token');
    }

    return this.feesTypeService.createFees(adminId, body);
  }
}
