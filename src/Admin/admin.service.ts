import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from "src/database/databaseservice";
import { OtpService } from 'src/otp/otp.service';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { CreateAdminDto } from './dto/addStaff.dto';

import { Types } from 'mongoose';


import mongoose from 'mongoose';
import { School } from 'src/school/school.schema';



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
    userType: 'admin',
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
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


async createCampusAndCampusAdmin(adminId: string , body: any) {
  const { campusAdminInfo, campusInfo } = body;


  

  const admin = await this.databaseService.repositories.adminModel.findById(adminId);

  if (!admin) {
    throw new NotFoundException('Admin not found');
  }

  const schoolId = admin.schoolId;


  const school = await this.databaseService.repositories.schoolModel.findById( schoolId);
  if (!school) {
    throw new NotFoundException('School not found');
  }


  const existingCampusAdmin =
    await this.databaseService.repositories.adminModel.findOne({
      email: campusAdminInfo.email,
    });

  if (existingCampusAdmin) {
    throw new BadRequestException('Campus admin with this email already exists');
  }

  
  const randomPassword = crypto.randomBytes(6).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);


  const campusAdmin =
    await this.databaseService.repositories.adminModel.create({
      ...campusAdminInfo,
      password: hashedPassword,
      role: 'campusAdmin',
      userType: 'campusAdmin',
      schoolId: schoolId,
      isVerified: true,
    });

const campus =
    await this.databaseService.repositories.campusModel.create({
      ...campusInfo,
      schoolId: schoolId,
      campusAdminId: campusAdmin._id.toString(),
    });



  const token = this.jwtService.sign(
    {
      sub: campusAdmin._id,
      email: campusAdmin.email,
      role: campusAdmin.role,
    },
    { expiresIn: '30d' },
  );


  const cleanCampusAdmin =
    await this.databaseService.repositories.adminModel
      .findById(campusAdmin._id)
      .select('-password -createdAt -updatedAt -__v');

  const cleanCampus =
    await this.databaseService.repositories.campusModel
      .findById(campus._id)
      .select('-createdAt -updatedAt -__v');


  await this.otpService.sendPassword(campusAdmin.email, randomPassword);

  return {
    message: 'Campus and campus admin created successfully',
    data: {
      token,
      campusAdmin: cleanCampusAdmin,
      campus: cleanCampus,
    },
  }

}

async getallschool() {

  const schools = await this.databaseService.repositories.schoolModel
      .find()
      .sort({ _id: -1 }) 
      .lean();

      
    return {
      message: 'All school fetched successfully',
      data: schools,
    }; 
  }

  async getAllCampusesBySchool(schoolId: string) {

  const campuses =
    await this.databaseService.repositories.campusModel
      .find({ schoolId: schoolId })
      .sort({ _id: -1 })
      .lean();

  return {
    message: 'All campuses fetched successfully',
    data: campuses,
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
          userType: admin.userType,
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
      role: 'superAdmin', 
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
    admin: new mongoose.Types.ObjectId(userId) 
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

 async addStaff(CreateAdminDto: CreateAdminDto, adminId: string) {
    const { role, email } = CreateAdminDto;

    if (!role) {
      throw new BadRequestException('Role is required');
    }

const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

    let Model;
    if (role === 'teacher') {
      Model = this.databaseService.repositories.teacherModel;
    } else {
      Model = this.databaseService.repositories.adminModel;
    }


    const existingUser = await Model.findOne({ email, schoolId });
    if (existingUser) {
      throw new BadRequestException(`${role} with this email already exists`);
    }

    const randomPassword = crypto.randomBytes(6).toString('hex'); 
     const hashedPassword = await bcrypt.hash(randomPassword, 10);



    const newUser = await Model.create({
      ...CreateAdminDto,
      schoolId,      
      isVerified: true,
      password: hashedPassword,
      userType: role,
 
    });

    await this.otpService.sendPassword(email, randomPassword);


    const cleanUser = await Model.findById(newUser._id)
      .select('-__v -createdAt -updatedAt -password');

    return {
      message: `${role} created successfully`,
      data: cleanUser,
    };
  }

  async editStaff(
  adminId: string,
  staffId: string,
  updateDto: CreateAdminDto,
) {
  const { role, email, ...updateData } = updateDto;

  if (!staffId) {
    throw new BadRequestException('Staff ID is required');
  }

  const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

  let Model;
  if (role === 'teacher') {
    Model = this.databaseService.repositories.teacherModel;
  } else {
    Model = this.databaseService.repositories.adminModel;
  }

  const staffObjectId = new Types.ObjectId(staffId);

  const staff = await Model.findOne({ _id: staffObjectId, schoolId });
  if (!staff) {
    throw new NotFoundException('Staff not found');
  }

  if (email && email !== staff.email) {
    const existingUser = await Model.findOne({ email, schoolId });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    updateDto.email = email;
  }

  const updatedStaff = await Model.findByIdAndUpdate(
    staffObjectId,
    { $set: updateData },
    { new: true },
  ).select('-password -__v -createdAt -updatedAt');

  return {
    message: 'Staff updated successfully',
    data: updatedStaff,
  };
}

async getAllStaffByAdmin(
  adminId: string,
  page: number,
  limit: number,
  name?: string,
) {
  const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

  const skip = (page - 1) * limit;


  const filter: any = {
    schoolId,
    status: 'active',
  };

  
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  const staff = await this.databaseService.repositories.adminModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select('-password -__v -createdAt -updatedAt');

  const total =
    await this.databaseService.repositories.adminModel.countDocuments(filter);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: staff,
  };
}

async getStaffById(
  adminId: string,
  staffId: string,
) {

  const staffObjectId = new Types.ObjectId(staffId);

const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }



  const staff =
    await this.databaseService.repositories.adminModel
      .findOne({
        _id: staffObjectId,
        schoolId: school._id.toString(),
        status: 'active',
      })
      .select('-password -__v -createdAt -updatedAt');

  if (!staff) {
    throw new BadRequestException('Staff not found');
  }

  return {
    message: 'Staff fetched successfully',
    data: staff,
  };
}



}