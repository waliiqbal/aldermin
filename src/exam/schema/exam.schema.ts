import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {


   @Prop({ type: String })
  schoolId: string;


  @Prop({ type: String })
  classId: string;

    @Prop({ type: String })
  sectionId: string;


  @Prop({ type: String })
  subjectId: string;

  @Prop({ type: String })
  examType: string;  

  @Prop({ type: Number })
  totalMarks: number;

  @Prop({ type: Number })
  passingMarks: number;

    @Prop({ type: String, default: "active"  })
  status: string;


  @Prop({ type: String })
  examMode: string;  
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
