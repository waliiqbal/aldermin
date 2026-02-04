import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampusDocument = Campus & Document;

@Schema({ timestamps: true })
export class Campus {

  @Prop({ required: true })
  campusName: string;

  @Prop({ required: true })
  address: string;


  @Prop({ required: true })
  schoolId: string;


  @Prop({ required: true })
  AdminId: string;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
