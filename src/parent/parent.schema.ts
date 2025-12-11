import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParentDocument = Parent & Document;

@Schema({ timestamps: true })
export class Parent {
  

  @Prop({ type: String, required: true })
  schoolId: string;


  @Prop()
  fatherName: string;

    @Prop()
  fatherEmail: string;

  @Prop()
  fatherOccupation: string;

  @Prop()
  fatherMobile: string;

  @Prop()
  fatherPhoto: string;


  @Prop()
  motherName: string;

  @Prop()
  motherOccupation: string;

  @Prop()
  motherMobile: string;

  @Prop()
  motherPhoto: string;

    @Prop()
  motherEmail: string;


  // Guardian Info
  @Prop()
  guardianName: string;

  @Prop()
  relationWithGuardian: string;

  @Prop()
  guardianEmail: string;

  @Prop()
  guardianMobile: string;

  @Prop()
  guardianOccupation: string;

  @Prop()
  guardianAddress: string;

  @Prop()
  guardianPhoto: string;

  // Document Information
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
  document1File: string;

  @Prop()
  document2Title: string;

  @Prop()
  document2File: string;

  @Prop()
  document3Title: string;

  @Prop()
  document3File: string;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
