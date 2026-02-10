import { IsOptional, IsString, IsNumber, IsDate, IsEmail } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  parentEmail?: string; 

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  admissionNo?: string;

  @IsOptional()
  @IsDate()
  admissionDate?: Date;

  @IsOptional()
  @IsNumber()
  rollNo?: number;

  @IsOptional()
  @IsString()
  studentGroup?: string;

  @IsOptional()
  @IsString()
  idCard?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDate()
  dob?: Date;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  caste?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  heightIn?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @IsOptional()
  previousYears?: {
    academicYear: string;
    classId: string;
    sectionId: string;
    rollNo: number;
  }[];
}
