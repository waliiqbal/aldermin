import { IsString, IsDateString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class AddReportDto {
  
  @IsString()
  @IsNotEmpty()
  reportingId: string; 

    @IsString()
  @IsNotEmpty()
  classId: string; 

    @IsString()
  @IsNotEmpty()
  sectionId: string; 

  @IsString()
  @IsNotEmpty()
  incident: string; 

  @IsString()
  description?: string; 


   @IsString()
  @IsOptional()  
  type?: string; 

}
