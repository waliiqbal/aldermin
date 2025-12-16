import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import * as mongoose from 'mongoose'

export type IssuanceDocument = Issuance & Document;

@Schema({ timestamps: true })
export class Issuance {

  @Prop({ type: String })
  memberId: string;  

  
  @Prop({ type: String })
  memberType: string;  

  @Prop({ type: String })
  bookId: string;  

  @Prop({ required: true, type: Date, default: Date.now })
  issueDate: Date;  

  @Prop({ type: Date })
  returnDate: Date;  

  @Prop({ type: Boolean, default: false })
  isReturned: boolean;  

}



export const IssuanceSchema = SchemaFactory.createForClass(Issuance);