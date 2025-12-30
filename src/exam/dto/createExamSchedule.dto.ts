import { IsString, IsDateString } from 'class-validator';

export class CreateExamScheduleDto {

  @IsString()
  examId: string;

  @IsString()
  teacherId: string;

  @IsString()
  room_number: string;

  @IsString()
  duration: string;

  @IsDateString()
  examDate: Date;

  @IsString()
  examTime: string;

  @IsString()
  day: string;
}
