import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {


  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  schoolId: string;

  @Prop({ required: true })
  userType: string;

  @Prop()
  otp: string;

  @Prop()
  otpExpiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: "active" })
  status: string;

  @Prop({ required: true })
  staff_no: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true })
  father_name: string;

  @Prop({ required: true })
  mother_name: string;

  @Prop({ required: true })
  gender: string;


  @Prop({ type: Object })
  payroll_details: {
    epf_no: string;
    basic_salary: number;
    contract_type: string;
    location: string;
  };

  @Prop({ type: Object })
  bank_info: {
    account_name: string;
    account_no: string;
    bank_name: string;
    branch_name: string;
  };

  @Prop({ type: Object })
  social_links: {
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
  };

}

export const StaffSchema = SchemaFactory.createForClass(Staff);