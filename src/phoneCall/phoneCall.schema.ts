import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhoneCallDocument = PhoneCall & Document;

export enum CallType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

@Schema({ timestamps: true })
export class PhoneCall {

 
@Prop({ type: String})
 name: string;


  @Prop({ type: String})
  phone: string;

  // Call date
  @Prop({ type: Date})
  date: Date;


  @Prop({ type: Date })
  followUpDate?: Date;


  @Prop({ type: String })
  callDuration?: string;

  @Prop({ type: String })
  description?: string;


  @Prop({ type: String, enum: CallType, required: true })
  callType: CallType;

  @Prop({ type: String, required: true })
  schoolId: string;


}

export const PhoneCallSchema = SchemaFactory.createForClass(PhoneCall);
