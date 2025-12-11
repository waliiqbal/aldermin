import { IsOptional, IsString, IsNumber } from 'class-validator';

export class AddBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  publisherName?: string;

  @IsOptional()
  @IsString()
  rackName?: string;

  @IsOptional()
  @IsString()
  desciption?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @IsOptional()
  @IsNumber()
  bookPrice?: number;


}
