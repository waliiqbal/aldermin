import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {


  @Prop({ required: true })
  name: string;

    @Prop({ required: true, unique: true })
  email: string;

    @Prop({ required: true })
  password: string;


 


}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
