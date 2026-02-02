import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {

  @Prop()
  name?: string;

  @Prop({ unique: true })
  email?: string;

  @Prop()
  password?: string;

  @Prop()
  schoolId?: string;

  @Prop()
  userType: string;

  @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: "active" })
  status?: string;

  @Prop()
  staff_no?: string;

  @Prop()
  role?: string;

  @Prop()
  department?: string;

   @Prop()
  image?: string;


  @Prop()
  designation?: string;


  @Prop()
  father_name?: string;

  @Prop()
  mother_name?: string;

  @Prop()
  gender?: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  refreshTokenExpiresAt?: Date;

  @Prop({ type: Object })
  payroll_details?: {
    epf_no?: string;
    basic_salary?: number;
    contract_type?: string;
    location?: string;
  };

  @Prop({ type: Object })
  bank_info?: {
    account_name?: string;
    account_no?: string;
    bank_name?: string;
    branch_name?: string;
  };

  @Prop({ type: Object })
  social_links?: {
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
  };

}

export const AdminSchema = SchemaFactory.createForClass(Admin);
