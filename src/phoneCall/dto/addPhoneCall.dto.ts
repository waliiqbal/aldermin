import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CallType } from '../phoneCall.schema';

export class CreatePhoneCallDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  callDuration?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CallType)
  callType?: CallType;
}
