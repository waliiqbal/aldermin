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
import { AdminService } from './admin.service'
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RedisService } from 'src/redis/redis.service';


@Controller('Admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly redisService: RedisService

  ) {}


@Post('create-superadmin')
  async createSuperadmin(@Body() body: any) {
    return this.adminService.createSuperadmin(body);
  }



@UseGuards(AuthGuard('jwt'))
@Post('create-admin-school')
async createAdminAndSchool(@Req() req, @Body() body: any) {

  const role = req.user.role; 
  console.log(role)
   if (req.user.role !== 'superAdmin') {
    throw new UnauthorizedException('Only superadmins can access this API');
  }

  return this.adminService.createAdminAndSchool(body);
}


    @Post('login')
  async login(@Body() loginData: any) {
    return this.adminService.loginAdmin(loginData);
  }

      @Post('loginSuperAdmin')
  async superAdminLogin(@Body() loginData: any) {
    return this.adminService.loginSuperAdmin(loginData);
  }

 @UseGuards(AuthGuard('jwt'))
      @Get('getProfile')
    async getKids(@Req() req: any) {
      const  userId  = req.user.userId; 
      return this.adminService.getProfile(userId);
    }

    @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return this.adminService.refreshAccessToken(refreshToken);
  }

    @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.adminService.forgotPasswordService(email);
  }
  
@UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  async resendotp(@Req() req) {
    const email = req.user.email;

    return this.adminService.resendOtpForResetPassword(email);
  }
  @Post('reset-password')
  async resetPassword(@Req() req, @Body() body: any) {
 
    const { email, otp, newPassword } = body;

    return this.adminService.resetPassword(email, otp, newPassword);
  }

@UseGuards(JwtAuthGuard)
@Post('logout')
async logout(@Req() req) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    await this.redisService.del(token);
  }

  return this.adminService.logoutAdmin(req.user.userId);
}

}