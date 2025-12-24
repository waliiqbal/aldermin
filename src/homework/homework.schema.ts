import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomeworkDocument = Homework & Document;

@Schema({ timestamps: true })
export class Homework {

  @Prop({ required: true })
  schoolId: string;

  @Prop({ required: true })
  classId: string;

  @Prop({ required: true })
  sectionId: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  homeworkDate: Date; 

  @Prop({ required: true })
  submissionDate: Date; 

  @Prop()
  marks: number;

  @Prop()
  fileUrl: string;

  @Prop()
  description: string;


  @Prop({ required: true })
  creatorId: string;

  @Prop({
    required: true,
    enum: ['ADMIN', 'TEACHER']
  })
  type: string;


  @Prop({
    type: [
      {
        studentId: { type: String, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'COMPLETED'],
          default: 'PENDING'
        },
        submittedAt: Date,
        submissionFile: String
      }
    ],
    default: []
  })
  studentsStatus: {
    studentId: string;
    status: string;
    submittedAt?: Date;
    submissionFile?: string;
  }[];
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);
