import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type ExamScheduleDocument = ExamSchedule & Document;

@Schema({ timestamps: true })
export class ExamSchedule {

  @Prop({ type: String })
  examId: string;

  @Prop({ type: String })
  teacherId: string;

  @Prop({ type: String })
  room_number: string;

  @Prop({ type: String })
  duration: string;  

  @Prop({ type: Date })
  examDate: Date;  

  @Prop({ type: String })
  examTime: string;  

  @Prop({ type: String })
  day: string;  
}



export const ExamScheduleSchema = SchemaFactory.createForClass(ExamSchedule);
