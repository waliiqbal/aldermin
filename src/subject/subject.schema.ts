import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {

     @Prop()
  classId: string;

      @Prop()
  schoolId: string;

  @Prop({ required: true, unique: true })
  name: string; 


  @Prop()
  description: string;

  }

export const SubjectSchema = SchemaFactory.createForClass(Subject);