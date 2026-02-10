import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {

    @Prop()
  schoolId: string;

   @Prop()
  campusId: string;

  @Prop({ required: true, unique: true })
  name: string; 


  @Prop()
  description: string;


  @Prop({ default: true })
  isActive: boolean;

  }

export const ClassSchema = SchemaFactory.createForClass(Class);