import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type IdCardTemplateDocument = IdCardTemplate & Document;

@Schema({ timestamps: true })
export class IdCardTemplate {


  @Prop({ required: true })
  schoolId: string;


  @Prop({ required: true })
  title: string; // e.g Student ID Card 2025

  @Prop({ required: true, enum: ['student', 'teacher'] })
  applicableUser: string;

  @Prop({ required: true })
  cardLayout: string; // vertical / horizontal

  
  @Prop({ default: 57 })
  pageWidth: number;

  @Prop({ default: 89 })
  pageHeight: number;

 
  @Prop()
  backgroundImage?: string;

  @Prop()
  logo?: string;

  @Prop()
  signature?: string;


  @Prop({ enum: ['circle', 'square'], default: 'square' })
  photoStyle: string;

  @Prop({ default: 21 })
  photoWidth: number;

  @Prop({ default: 21 })
  photoHeight: number;


  @Prop({ default: 2.5 })
  topSpace: number;

  @Prop({ default: 2.5 })
  bottomSpace: number;

  @Prop({ default: 3 })
  leftSpace: number;

  @Prop({ default: 3 })
  rightSpace: number;

 
  @Prop({ default: true })
  showAdmissionNo: boolean;

  @Prop({ default: true })
  showName: boolean;

  @Prop({ default: true })
  showClass: boolean;

  @Prop({ default: false })
  showFatherName: boolean;


  @Prop({ default: true })
  isActive: boolean;
}

export const IdCardTemplateSchema =
  SchemaFactory.createForClass(IdCardTemplate);
