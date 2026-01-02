import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentMarksDocument = StudentMarks & Document;

@Schema({ timestamps: true })
export class StudentMarks {


  @Prop({ type: String, required: true })
  examId: string;

  @Prop({ type: String, required: true })
  examScheduleId: string;

   @Prop({ type: String, required: true })
  teacherId: string;

  @Prop({ type: String, required: true })
  studentId: string;

 
  @Prop({ type: Date, required: true })
  examDate: Date;


  @Prop({ type: Number, required: true })
  obtainedMarks: number;

   @Prop({ type: Number, required: false })
  totalMarks: number;

  @Prop({ type: String, enum: ['pass', 'fail'], required: true })
  resultStatus: string;

  @Prop({ type: Boolean, default: false })
  isAbsent: boolean;

  @Prop({ type: String })
  remarks: string;
}

export const StudentMarksSchema =
  SchemaFactory.createForClass(StudentMarks);




