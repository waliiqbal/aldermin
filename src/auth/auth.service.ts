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
import { DatabaseService } from "src/database/databaseservice";
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class AuthService {
   private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // 👈 Google Client
  constructor(
   
    private databaseService: DatabaseService,

    private readonly jwtService: JwtService
  ) {}


async signup(signupDto: SignupDto) {
  try {
    const { name, email, password, userType } = signupDto;

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
    else {
      throw new UnauthorizedException('Invalid user type');
    }

  
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    await user.save();

    
    const payload = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        token,
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

   
    const payload = {
      sub: user._id,
      email: user.email,
      userType: user.userType,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        token,
      },
    };

  } catch (error) {
    throw new UnauthorizedException(error.message || 'Login failed');
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



