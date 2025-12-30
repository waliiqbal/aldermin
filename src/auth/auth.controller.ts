/* eslint-disable prettier/prettier */
import { Body, Controller, Post,Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Signup
 
  @Post('signup')
  async signup( @Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  // ✅ Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  
   @Post('resend-otp') 
  async resendOtp(@Body() body: { email: string; userType: string }) {
    const { email, userType } = body;
    return this.authService.resendOtp(email, userType);
  }

    @Post('verifyOtp') 
  async verifyOtp(@Body() body: { email: string; userType: string, otp: string }) {
    const { email, userType, otp } = body;
    return this.authService.verifyOtp(email, userType, otp);
  }

   @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
    @Body('userType') userType: string,
  ) {
    return this.authService.forgotPassword(email, userType);
  }

  
  @Post('reset-password')
  async resetPassword(
  @Body('email') email: string,
  @Body('userType') userType: string,
  @Body('otp') otp: string,
  @Body('newPassword') newPassword: string,
) {
  return this.authService.resetPassword(email, userType, otp, newPassword);
}


  @Post('resend-otp-reset-password') 
  async resendOtpForResetPassword(@Body() body: { email: string; userType: string }) {
    const { email, userType } = body;
    return this.authService.resendOtpForResetPassword(email, userType);
  }

    @Post('verifyOtpForgot') 
  async verifyOtpForgot(@Body() body: { email: string; userType: string, otp: string }) {
    const { email, userType, otp } = body;
    return this.authService.verifyOtpForgot(email, userType, otp);
  }



}