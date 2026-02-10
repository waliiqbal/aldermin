import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParentDocument = Parent & Document;

@Schema({ timestamps: true })
export class Parent {
  

  @Prop({ type: String, required: true })
  schoolId: string;

   @Prop({ type: String})
  campusId: string;

  @Prop()
  name: string;

    @Prop()
  email: string;

  @Prop({ default: "active" })
  status: string;

   @Prop({ default: false })
  isVerified: boolean

      @Prop()
    otp?: string;
  
    @Prop()
    otpExpiresAt?: Date;
  
    @Prop()
  password: string;

   @Prop({type: String})
  role: string;


  @Prop({ required: String })
  userType: string;

   @Prop()
  image?: string;

  

  @Prop()
  Occupation: string;

  @Prop()
  phoneNumber: string;



  @Prop()
  nationalIdNumber: string;

  @Prop()
  birthCertificateNumber: string;

  @Prop()
  additionalNotes: string;

 
  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountTitle: string;


  @Prop()
  document1Title: string;


  @Prop()
  document2Title: string;


  @Prop()
  document3File: string;



}



export const ParentSchema = SchemaFactory.createForClass(Parent);
