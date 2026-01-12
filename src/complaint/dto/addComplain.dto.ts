import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateComplaintDto {

  @IsString()
  @IsNotEmpty()
  complaintBy?: string;

  @IsString()
  @IsNotEmpty()
  complaintType?: string;


  @IsString()
  @IsOptional()
  Source?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsNotEmpty()
  date?: string;

  @IsString()
  @IsOptional()
  actionTaken?: string;

  @IsString()
  @IsOptional()
  assigned?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  file?: string;
}
