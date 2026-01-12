import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PostalType } from '../postal.schema';

export class CreatePostalDto {

  @IsEnum(PostalType)
  type: PostalType; 

  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
 @IsOptional()
  referenceNo?: string;

  @IsString()
 @IsOptional()
  fromTitle?: string;

  @IsString()
 @IsOptional()
  toTitle?: string;

  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
