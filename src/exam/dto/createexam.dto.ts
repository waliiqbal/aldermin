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
  examType: string;  // e.g., Midterm, Final

  @IsNumber()
  @IsNotEmpty()
  totalMarks: number;  // Total marks

  @IsNumber()
  @IsNotEmpty()
  passingMarks: number;  // Passing marks

  @IsString()
  @IsNotEmpty()
  examMode: string;  // "Theory" or "Practical"
}
