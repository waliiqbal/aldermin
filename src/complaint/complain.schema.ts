import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComplaintDocument = Complaint & Document;

@Schema({ timestamps: true })
export class Complaint {

  @Prop()
  schoolId: string;

  @Prop()
  complaintBy: string;

  @Prop()
  complaintType: string;

  @Prop()
  Source: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  actionTaken: string;

  @Prop()
  assigned: string;

  @Prop()
  description: string;

  @Prop()
  file: string;

  @Prop({ default: "pending" })
  status: string;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
