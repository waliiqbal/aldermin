import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateExamDto {
  

  @IsString()
  @IsNotEmpty()
  classId: string;  

   @IsString()
  @IsNotEmpty()
  sectionId: string;  

  @IsString()
  @IsNotEmpty()
  subjectId: string; 


  @IsString()
  @IsNotEmpty()
  examType: string;  

  @IsNumber()
  @IsNotEmpty()
  totalMarks: number;  

  @IsNumber()
  @IsNotEmpty()
  passingMarks: number;  

  @IsString()
  @IsNotEmpty()
  examMode: string;  
}
