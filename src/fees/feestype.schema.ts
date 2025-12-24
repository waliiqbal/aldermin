import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeesTypeDocument = FeesType & Document;

@Schema({ timestamps: true })
export class FeesType {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string; 

    @Prop({ default: false })
    isTuition: boolean;

  @Prop({ default: true })
  isActive: boolean;
}



export const FeesTypeSchema = SchemaFactory.createForClass(FeesType);
