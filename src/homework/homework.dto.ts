import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateHomeworkDto {

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsDateString()
  homeworkDate: Date;

  @IsDateString()
  submissionDate: Date;

  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
