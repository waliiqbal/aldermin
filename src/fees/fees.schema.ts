import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeesDocument = Fees & Document;

@Schema({ timestamps: true })
export class Fees {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: string;
 
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: string;


  @Prop({ type: Types.ObjectId, ref: 'FeesGroup', required: false })
  feesGroupId: string;

 
  @Prop({ required: true })
  issueDate: Date;


  @Prop({ required: true })
  dueDate: Date;

 
  @Prop()
  month?: string; 

  @Prop({
    type: [
      {
        feesTypeId: { type: Types.ObjectId, ref: 'FeesType', required: true },
        amount: { type: Number, required: true },
      }
    ]
  })
  items: { feesTypeId: string; amount: number; paid: boolean }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' })
  status: string;
}

export const FeesSchema = SchemaFactory.createForClass(Fees);
