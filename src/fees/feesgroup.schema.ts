import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FeesType } from './feestype.schema'; 

export type FeesGroupDocument = FeesGroup & Document;

@Schema({ timestamps: true })
export class FeesGroup {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: string;

  @Prop({
    type: [
      {
        feesTypeId: { type: Types.ObjectId, ref: 'FeesType', required: true },
        amount: { type: Number, required: true }
      }
    ]
  })
  fees: { feesTypeId: string; amount: number }[];

  @Prop({ default: true })
  isActive: boolean;
}

export const FeesGroupSchema = SchemaFactory.createForClass(FeesGroup);
