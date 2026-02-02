import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class CreateIdCardTemplateDto {


  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(['student', 'teacher'])
  applicableUser?: string;

  @IsOptional()
  @IsString()
  cardLayout?: string;

 
  @IsOptional()
  @IsNumber()
  pageWidth?: number;

  @IsOptional()
  @IsNumber()
  pageHeight?: number;


  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  signature?: string;

 
  @IsOptional()
  @IsEnum(['circle', 'square'])
  photoStyle?: string;

  @IsOptional()
  @IsNumber()
  photoWidth?: number;

  @IsOptional()
  @IsNumber()
  photoHeight?: number;

 
  @IsOptional()
  @IsNumber()
  topSpace?: number;

  @IsOptional()
  @IsNumber()
  bottomSpace?: number;

  @IsOptional()
  @IsNumber()
  leftSpace?: number;

  @IsOptional()
  @IsNumber()
  rightSpace?: number;

 
  @IsOptional()
  @IsBoolean()
  showAdmissionNo?: boolean;

  @IsOptional()
  @IsBoolean()
  showName?: boolean;

  @IsOptional()
  @IsBoolean()
  showClass?: boolean;

  @IsOptional()
  @IsBoolean()
  showFatherName?: boolean;
}
