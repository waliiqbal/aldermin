import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitorDocument = Visitor & Document;

@Schema({ timestamps: true })
export class Visitor {

  @Prop({ type: String, required: true })
  name: string;

    @Prop({ type: String })
  schoolId: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  idCardNumber: string;

  @Prop({ type: Number, required: true })
  noOfPersons: number;

  @Prop({ type: String, required: true })
  purpose: string; 


  @Prop({ type: Date, required: true })
  visitDate: Date;

  @Prop({ type: String, required: true })
  timeIn: string; 
 

  @Prop({ type: String })
  timeOut: string; 


  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  attachment: string; 
 

  @Prop({ type: String })
  remarks: string;

 
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);
