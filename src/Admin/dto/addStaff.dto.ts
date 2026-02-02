import { IsString, IsOptional, IsEmail, IsBoolean, IsDate, IsObject, IsNumber } from 'class-validator';

export class CreateAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;



  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  staff_no?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;


  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  gender?: string;


  @IsOptional()
  @IsObject()
  payroll_details?: {
    epf_no?: string;
    basic_salary?: number;
    contract_type?: string;
    location?: string;
  };

  @IsOptional()
  @IsObject()
  bank_info?: {
    account_name?: string;
    account_no?: string;
    bank_name?: string;
    branch_name?: string;
  };

  @IsOptional()
  @IsObject()
  social_links?: {
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
  };
}
