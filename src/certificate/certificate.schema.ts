import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CertificateTemplateDocument = CertificateTemplate & Document;

@Schema({ timestamps: true })
export class CertificateTemplate {



  @Prop()
  schoolId?: string;

  @Prop()
  certificateName?: string; 




  @Prop()
  headerLeftText?: string;




  @Prop()
  certificateDate?: Date;




  @Prop({ maxlength: 500 })
  bodyText1?: string;

  @Prop({ maxlength: 500 })
  bodyText2?: string;

  @Prop()
  bodyFont?: string;

  @Prop()
  fontSize?: number;




  @Prop()
  footerCenterText?: string;

  @Prop()
  footerRightText?: string;




  @Prop()
  pageLayout?: string; 

  @Prop()
  height?: number; // mm

  @Prop()
  width?: number; // mm


 

  @Prop({ default: false })
  showStudentPhoto?: boolean;




  @Prop({ default: true })
  isActive?: boolean;
}

export const CertificateTemplateSchema =
  SchemaFactory.createForClass(CertificateTemplate);
