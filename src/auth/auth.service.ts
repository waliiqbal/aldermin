/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { SocialLoginDto  } from './dto/social-login.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from 'src/otp/otp.service';
import { DatabaseService } from "src/database/databaseservice";
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { stat } from 'fs';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
   private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // 👈 Google Client
  constructor(
   
    private databaseService: DatabaseService,
      private readonly otpService: OtpService, 
      private readonly redisService: RedisService,

    private readonly jwtService: JwtService
  ) {}


async signup(signupDto: SignupDto) {
  try {
    const { name, email, password, userType, image, schoolId, campusId } = signupDto;

    let userModel;

    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
 
    }
      else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    } else {
      throw new UnauthorizedException('Invalid user type');
    }
    

    


    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); 

 
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      userType,
      role: userType,
      schoolId,
      campusId,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'active',
    });

    await user.save();

    // 5️⃣ Send OTP
    await this.otpService.sendOtp(email, otp);

    return {
      message: 'OTP sent successfully',
      data: {
        userId: user._id,
        otp: user.otp, 
      },
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Signup failed');
  }
}



async login(loginDto: LoginDto) {
  try {
    const { email, password, userType } = loginDto;

    let userModel;


    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } 
    else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } 
    else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 

    else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
    else {
      throw new UnauthorizedException('Invalid user type');
    }

 
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

  
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
  throw new UnauthorizedException('Account not verified. Please verify OTP first');
}

   
    const payload = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);


    await this.redisService.set(
      token,
      user._id.toString(),
      30 * 60
    );
    

    return {
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        token,
      },
    };

  } catch (error) {
    throw new UnauthorizedException(error.message || 'Login failed');
  }
}

async resendOtp(email: string, userType: string) {
  try {

    let userModel;

    
    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } 
    else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } 
    else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 

     else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
    else {
      throw new UnauthorizedException('Invalid user type');
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

 
    if (user.isVerified) {
      throw new UnauthorizedException('User already verified');
    }

  
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    
    await this.otpService.sendOtp(user.email, newOtp);

    return {
      message: 'New OTP sent successfully to your email',
      data: {
        userId: user._id,
        otp: user.otp,
      },
    };

  } catch (error) {
    throw new UnauthorizedException(error.message || 'Resend OTP failed');
  }
}

async verifyOtp(email: string, userType: string, otp: string) {
  try {

    let userModel;

 
    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } 
    else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } 
    else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 

     else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
    else {
      throw new UnauthorizedException('Invalid user type');
    }

 
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

 
    if (user.isVerified) {
      throw new UnauthorizedException('User already verified');
    }


    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

  
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

   
    const payload = { sub: user._id, email: user.email, userType: user.userType, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          userType: user.userType,
          phoneNo: user.phoneNo,
          address: user.address,
        },
      },
    };

  } catch (error) {
    throw new UnauthorizedException(error.message || 'OTP verification failed');
  }
}



async forgotPassword(email: string, userType: string) {
  try {
    let userModel;

    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 
    else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    } 
    else {
      throw new UnauthorizedException('Invalid user type');
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found with this email');
    }

 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

   
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();


    await this.otpService.sendOtp(user.email, otp);

   
    return {
      message: 'OTP sent successfully to your email for password reset',
      data: {
        userId: user._id,
        otp: user.otp,
      },
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Forgot password failed');
  }
}

async resetPassword(email: string, userType: string, otp: string, newPassword: string) {
  try {
    let userModel;

    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 

     else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
    
    else {
      throw new UnauthorizedException('Invalid user type');
    }


    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

 
    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }


    const now = new Date();
    if (!user.otpExpiresAt || now > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return {
      message: 'Your password has been changed successfully',
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Password reset failed');
  }
}

async resendOtpForResetPassword(email: string, userType: string) {
  try {

    let userModel;


    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } 
    else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } 
    else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    } 

     else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
    else {
      throw new UnauthorizedException('Invalid user type');
    }

 
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

  
    if (!user.isVerified) {
      throw new UnauthorizedException('User is not verified yet');
    }


    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    user.otp = newOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();


    await this.otpService.sendOtp(user.email, newOtp);

    return {
      message: 'OTP sent successfully to your email for password reset',
      data: {
        userId: user._id,
        otp: user.otp, 
      },
    };

  } catch (error) {
    throw new UnauthorizedException(error.message || 'Resend OTP for password reset failed');
  }
}

async verifyOtpForgot(email: string, userType: string, otp: string) {
  try {
    let userModel;

    if (userType === 'teacher') {
      userModel = this.databaseService.repositories.teacherModel;
    } else if (userType === 'student') {
      userModel = this.databaseService.repositories.studentModel;
    } else if (userType === 'parent') {
      userModel = this.databaseService.repositories.parentModel;
    }

     else if (userType === 'adminStaff') {
      userModel = this.databaseService.repositories.adminModel;
    }
     else {
      throw new UnauthorizedException('Invalid user type');
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

  
    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const now = new Date();
    if (!user.otpExpiresAt || now > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

    return {
      message: 'OTP verified successfully',
      data: null,
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'OTP verification failed');
  }
}



// async socialLogin(
//   authProvider: string,
//   name: string,
//   email: string,
//   socialId: string,
//   displayPic: string
// ) {
//   try {

//     if (!socialId) {
//       throw new UnauthorizedException("socialId must be provided");
//     }
//     if (!email) {
//       throw new UnauthorizedException("email must be provided");
//     }


//     let user = await this.databaseService.repositories.userModel.findOne({ email });

//     if (user) {
//       // 👉 Case A: User already exists with password but no socialId
//       if (user.password && !user.providerId) {
//         user.providerId = socialId;
//         user.authProvider = authProvider;
//         user.displayPic = displayPic;
//         await user.save();
//       }

//       // 👉 Case B: User already exists with socialId
//       else if (user.providerId && user.providerId !== socialId) {
//         throw new UnauthorizedException(
//           "This email is linked with another social account."
//         );
//       }
//     } else {
      
//     user = new this.databaseService.repositories.userModel({
//         name,
//         email,
//         providerId: socialId,
//         authProvider,
//         displayPic,
//       });
//       await user.save();
//     }

//     // ✅ Step 3: Generate token
//     const payload = {
//       sub: user._id,
//       email: user.email,
//     };

//     const jwtToken = this.jwtService.sign(payload, { expiresIn: "1h" });

//     return {
//       message: "Social login successful",
//       data: {
//         token: jwtToken,
//         user,
//       },
//     };
//   } catch (error) {
//     throw new UnauthorizedException(error.message || "Social login failed");
//   }
// }

}



