import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {

  @Prop({ required: true })
  name: string; 

  @Prop()
  description: string;  

  @Prop({ required: true })
  classId: string;  

  @Prop({ required: true })
  schoolId: string;

  @Prop({
    type: [{
      teacherId: { type: String },  
      sectionId: { type: String },
      academicYear: {type: String},
    }],
    default: []
  })
  subjectAssignments: { teacherId: string, sectionId: string, academicYear: string }[];  

  @Prop({ default: true })
  isActive: boolean;  
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
