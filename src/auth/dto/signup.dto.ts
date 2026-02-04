/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

   @IsNotEmpty()
  @IsString()
  campusId: string;

  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

   @IsNotEmpty()
  @IsString()
  userType: string;

   @IsOptional()
  @IsString()
  image: string;
}




