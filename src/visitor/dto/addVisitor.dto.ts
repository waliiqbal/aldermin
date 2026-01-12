import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateVisitorDto {

  @IsString()
   @IsOptional()
  name: string;

  @IsString()
    @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  idCardNumber?: string;

  @IsNumber()
    @IsOptional()
  noOfPersons: number;

  @IsString()
   @IsOptional()
  purpose: string;

  @IsDateString()
    @IsOptional()
  visitDate: string;

  @IsString()
    @IsOptional()
  timeIn: string;

  @IsString()
    @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
