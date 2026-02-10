import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop()
  academicYear: string;

  @Prop()
  classId: string;

  @Prop()
  sectionId: string;

   @Prop({default: false})
  isVerified: boolean;

  
  @Prop({ type: String})
  parentId: string;

  @Prop({ type: String})
  schoolId: string;

  @Prop({ type: String})
  campusId: string; 

   @Prop({type: String})
  userType: string;

  @Prop({type: String})
  role: string;

    @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;


   @Prop()
  image?: string;


  @Prop()
  admissionNo: string;

  @Prop()
  admissionDate: Date;

  @Prop()
  rollNo: number;

  @Prop()
  studentGroup: string;

  @Prop()
  idCard: string;

   @Prop()
  name: string;

 

  @Prop()
  gender: string;

  @Prop()
  dob: Date;

  @Prop()
  religion: string;

  @Prop()
  caste: string;

  @Prop()
  photo: string;


  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  currentAddress: string;

  @Prop()
  permanentAddress: string;

  @Prop()
  bloodGroup: string;

  @Prop()
  category: string;

    @Prop()
  password: string;

  @Prop()
  heightIn: number;

  @Prop()
  weightKg: number;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string;

  @Prop({
  type: [
    {
      academicYear: { type: String, required: true },
      classId: { type: String, required: true },
      sectionId: { type: String, required: true },
      rollNo: { type: Number, required: true },
    },
  ],
  default: [], 
})
previousYears: {
  academicYear: string;
  classId: string;
  sectionId: string;
  rollNo: number;
}[];
}



export const StudentSchema = SchemaFactory.createForClass(Student);
