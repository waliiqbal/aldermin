import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamDocument = AdmissionQuery & Document;

@Schema({ timestamps: true })
export class AdmissionQuery {


   @Prop({ type: String })
  schoolId: string;


  @Prop({ type: String })
  classId: string;



  @Prop({ type: String })
  name: string;  

  @Prop({ type: Number })
  email: number;

  @Prop({ type: Number })
  phone: number;

 
  @Prop({ type: String })
  adress: string; 

     @Prop({ type: String })
  description: string; 

   @Prop({ type: Date })
   date: Date; 

   @Prop({ type: Date })
   folloWDate: Date;

  @Prop({ type: Number })
  numberOfChild: number; 


    @Prop({ type: String, default: "active"  })
  status: string;


}
export const AdmissionQuerySchema = SchemaFactory.createForClass(AdmissionQuery);
