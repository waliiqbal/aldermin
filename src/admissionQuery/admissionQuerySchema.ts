import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdmissionQueryDocument = AdmissionQuery & Document;

@Schema({ timestamps: true })
export class AdmissionQuery {


   @Prop({ type: String })
  schoolId: string;


  @Prop({ type: String })
  classId: string;



  @Prop({ type: String })
  name: string;  

  @Prop({ type:  String })
  email: string;

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


    @Prop({ type: String, default: "pending"  })
  status: string;


}
export const AdmissionQuerySchema = SchemaFactory.createForClass(AdmissionQuery);
