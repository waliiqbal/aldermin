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
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateAdminDto } from './dto/addStaff.dto';


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

@UseGuards(AuthGuard('jwt'))
@Post('createCampusAndCampusAdmin')
async createCampusAndCampusAdmin(@Req() req, @Body() body: any) {

  const role = req.user.role; 
  console.log(role)
   if (req.user.role !== 'admin') {
    throw new UnauthorizedException('Only superadmins can access this API');
  }

  return this.adminService.createCampusAndCampusAdmin(body);
}

@Get('getAllSchools')
async getAllSchools() {
  return this.adminService.getallschool(); 
}

@Get('getAllCampusesBySchool/:schoolId')
async getAllCampusesBySchool(
  @Param('schoolId') schoolId: string,
) {
  return this.adminService.getAllCampusesBySchool(schoolId);
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'adminStaff')
  @Post('addStaff')
  async addStaff(@Req() req: any, @Body() CreateAdminDto: CreateAdminDto) {
    const userId = req.user.userId; 
    return this.adminService.addStaff(CreateAdminDto, userId);
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'adminStaff')
@Post('editStaff')
async editStaff(
  @Req() req: any,
  @Body() body: CreateAdminDto & { staffId: string },
) {
  const adminId = req.user.userId;

  const { staffId, ...createAdminDto } = body;

  return this.adminService.editStaff(
    adminId,
    staffId,
    createAdminDto,
  );
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('getAllStaffByAdmin')
async getAllStaffByAdmin(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('name') name?: string,
) {
  const adminId = req.user.userId;

  return this.adminService.getAllStaffByAdmin(
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
    name,
  );
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'adminStaff')
@Get('getStaffById/:id')
async getStaffById(
  @Req() req: any,
  @Param('id') id: string,
) {
  const adminId = req.user.userId;

  return this.adminService.getStaffById(adminId, id);
}



}