import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {

    @Prop()
  classId: string;

      @Prop()
  teacherId: string;


     @Prop()
  schoolId: string;

  @Prop({ required: true })
  name: string;


  @Prop()
  description: string;


  @Prop({ default: true })
  isActive: boolean;


}

export const SectionSchema = SchemaFactory.createForClass(Section);
