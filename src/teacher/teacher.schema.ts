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

   @Prop()
  otp: string;
  
   @Prop()
   otpExpiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: "active" })
  status: string;
 

}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
