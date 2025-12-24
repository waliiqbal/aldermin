import {
  IsMongoId,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateFeesDto {

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsMongoId()
  feesGroupId?: string;

    @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsArray()
  items?: {
    feesTypeId: string;
    amount: number;
  }[];
}
