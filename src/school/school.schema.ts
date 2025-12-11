import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop()
  schoolName: string;

  @Prop()
  schoolImage: string;

  @Prop()
  schoolEmail: string;

  @Prop()
  contactPerson: string;

  @Prop()
  address: string;
  
  @Prop()
  branchName: string;
  
@Prop({ default: 'active' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  admin: Types.ObjectId;
}

export const SchoolSchema = SchemaFactory.createForClass(School);