import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from "src/database/databaseservice";
import { OtpService } from 'src/otp/otp.service';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';

import { Types } from 'mongoose';


import mongoose from 'mongoose';



@Injectable()
export class AdminService {
  
  constructor(
   
    private databaseService: DatabaseService,
    private readonly otpService: OtpService, 

    private readonly jwtService: JwtService,
    private readonly redisService: RedisService

  ) {}
  
   async createSuperadmin(body: any) {
    const { adminInfo } = body;

   
    const existingAdmin = await this.databaseService.repositories.adminModel.findOne({ email: adminInfo.email });
    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }
 


    const superadmin = await this.databaseService.repositories.adminModel.create({
      ...adminInfo,
      role: 'superAdmin',  
    });


    const cleanAdmin = await this.databaseService.repositories.adminModel
      .findById(superadmin._id)
      .select('-password -createdAt -updatedAt -__v');

    return {
      message: 'Superadmin created successfully.',
      data: cleanAdmin,
    };
  }
async createAdminAndSchool(body: any) {
  const { adminInfo, schoolInfo } = body;

  const existingAdmin = await this.databaseService.repositories.adminModel.findOne({
    email: adminInfo.email,
  });

  if (existingAdmin) {
    throw new BadRequestException("Admin with this email already exists");
  }

  const randomPassword = crypto.randomBytes(6).toString('hex'); 
  const hashedPassword = await bcrypt.hash(randomPassword, 10);


  const admin = await this.databaseService.repositories.adminModel.create({
    ...adminInfo,
    password: hashedPassword,
  });


  const school = await this.databaseService.repositories.schoolModel.create({
    ...schoolInfo,
    admin: admin._id,
  });


  const token = this.jwtService.sign(
    {
      sub: admin._id,
      email: admin.email,
      role: admin.role,
    },
    { expiresIn: '30d' }
  );


  const cleanAdmin = await this.databaseService.repositories.adminModel
    .findById(admin._id)
    .select('-password -createdAt -updatedAt -__v');

  const cleanSchool = await this.databaseService.repositories.schoolModel
    .findById(school._id)
    .select('-createdAt -updatedAt -__v');

    await this.otpService.sendPassword(adminInfo.email, randomPassword);

  return {
    message: 'Admin and school created successfully.',
    data: {
      token,
      admin: cleanAdmin,
      school: cleanSchool,
    },


  };

  
}

async loginAdmin(loginData: any) {
  try {
    const { email, password } = loginData;

    console.log(email)

    const admin = await this.databaseService.repositories.adminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log (admin)
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const accessToken = this.jwtService.sign(
      {
        sub: admin._id,
        email: admin.email,
        role: admin.role,
      },
      { expiresIn: '30m' } 
    );

    


    const refreshToken = this.jwtService.sign(
      {
        sub: admin._id,
        email: admin.email,
        role: admin.role,
      },
      { expiresIn: '30d' } 
    );

    await this.redisService.set(
  accessToken,
  admin._id.toString(),
  15 * 60, 
);


  
    admin.refreshToken = refreshToken;
    admin.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 din aage
    await admin.save();

    return {
      message: 'Login successful',
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Login failed');
  }
}

async loginSuperAdmin(loginData: any) {
  try {
    const { email, password } = loginData;

    // 🔍 Superadmin find
    const admin = await this.databaseService.repositories.adminModel.findOne({
      email,
      role: 'superAdmin', // only superadmin allowed
    });

    if (!admin) {
      throw new UnauthorizedException('Superadmin not found');
    }

    console.log(admin.email)
 




    const accessToken = this.jwtService.sign(
      {
        sub: admin._id,
        email: admin.email,
        role: admin.role,
      },
      { expiresIn: '30m' }
    );

   
    const refreshToken = this.jwtService.sign(
      {
        sub: admin._id,
        email: admin.email,
        role: admin.role,
      },
      { expiresIn: '30d' }
    );

   
    admin.refreshToken = refreshToken;
    admin.refreshTokenExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );
    await admin.save();

    console.log(admin.email)

    return {
      message: 'Superadmin login successful',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Login failed');
  }
}


async getProfile(userId: string) {
  console.log(userId)
  try {
    if (!userId ) {
      throw new UnauthorizedException('Invalid user credentials');
    }
     const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new mongoose.Types.ObjectId(userId) // admin field match kar raha hai
    });
    if (!school) {
      throw new UnauthorizedException('school not found');
    }

    return {
      message: 'school profile fetched successfully',
      data: school,
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Failed to fetch school profile');
  }
}


async refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token is required');
  }


  const admin = await this.databaseService.repositories.adminModel.findOne({ refreshToken });
  if (!admin) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  if (new Date() > admin.refreshTokenExpiresAt) {
  throw new UnauthorizedException('Refresh token expired');
}

  try {
    this.jwtService.verify(refreshToken);
  } catch (err) {
    throw new UnauthorizedException('Refresh token expired or invalid');
  }


  const newAccessToken = this.jwtService.sign(
    {
      sub: admin._id,
      email: admin.email,
      role: admin.role,
    },
    { expiresIn: '30m' } 
  );


  return {
    message: 'New access token generated successfully',
    data: {
      token: newAccessToken
    }
  };
}

async forgotPasswordService(email: string) {

  const admin = await this.databaseService.repositories.adminModel.findOne({ email });

  if (!admin) {
    return { message: 'User not found' };
  }


  const otp = crypto.randomInt(100000, 999999).toString();


  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);


  admin.otp = otp;
  admin.otpExpiresAt = otpExpiresAt;
  await admin.save();


  await this.otpService.sendOtp(admin.email, otp);

    const newToken = this.jwtService.sign(
    {
      sub: admin._id,
      email: admin.email,
      role: admin.role,
    },
    { expiresIn: '30d' }
  );

  return {
    message: 'OTP sent on email for password reset.',
    data: {
      otp,
      token: newToken, 
    },
  };
}

async resendOtpForResetPassword(email: string) {
  try {
 
    const admin = await this.databaseService.repositories.adminModel.findOne({ email });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }


   
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

   
    admin.otp = newOtp;
    admin.otpExpiresAt = otpExpiresAt;
    await admin.save();

 
    await this.otpService.sendOtp(admin.email, newOtp);

    return {
      message: 'OTP sent successfully to your email for password reset',
      data: {
        adminId: admin._id,
        otp: admin.otp, 
      },
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Resend OTP for password reset failed');
  }
}

async resetPassword(email: string, otp: string, newPassword: string) {
  try {
    
    const admin = await this.databaseService.repositories.adminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    console.log ("wali", email, otp, newPassword)

    
   if (admin.otp !== otp.toString()) {
  console.log("DB OTP:", admin.otp, " Provided OTP:", otp); 
  throw new UnauthorizedException('Invalid OTP');
}

   
    const now = new Date();
    if (!admin.otpExpiresAt || now > admin.otpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    
    admin.password = hashedPassword;
    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    return {
      message: 'Your password has been changed successfully',
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Password reset failed');
  }
}

async logoutAdmin(adminId: string) {
  try {

    const admin = await this.databaseService.repositories.adminModel.findById(adminId);
    
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    admin.refreshToken = null;
    admin.refreshTokenExpiresAt = null;


    await admin.save();

    

    return {
      message: 'Logout successful',
    };
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Logout failed');
  }
}


}