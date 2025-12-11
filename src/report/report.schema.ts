import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {

   @Prop({ type: String})
  reportingId: string;  

   @Prop({ type: String})
  reportedBy: string;

    @Prop({ type: String})
  schoolId: string;

    @Prop({ type: String})
  classId: string;

    @Prop({ type: String})
  sectionId: string;

  @Prop({ required: true })
  incident: string; 

  @Prop()
  description: string;  

  @Prop()
  date: Date;  

  @Prop()
  type: string;  

  @Prop()
  points: number;  
}

export const ReportSchema = SchemaFactory.createForClass(Report);
