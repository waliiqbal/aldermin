import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostalDocument = Postal & Document;

export enum PostalType {
  RECEIVE = 'RECEIVE',
  DISPATCH = 'DISPATCH',
}

@Schema({ timestamps: true })
export class Postal {


  @Prop({ type: String, enum: PostalType, required: true })
  type: PostalType;


  @Prop({ type: String })
  title: string;


  @Prop({ type: String })
  referenceNo: string;


  @Prop({ type: String })
  fromTitle: string;


  @Prop({ type: String})
  toTitle: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  note: string;

  @Prop({ type: Date })
  date: Date;


  @Prop({ type: String })
  attachment: string;


  @Prop({ type: String })
  schoolId: string;

   @Prop({
    type: String,
    enum: ['PENDING', 'RECEIVED'],
    default: 'PENDING',
  })
  status: string;

}

export const PostalSchema = SchemaFactory.createForClass(Postal);
