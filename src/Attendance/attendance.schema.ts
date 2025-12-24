import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {

  @Prop({ type: String, required: true })
  studentId: string;

  @Prop({ type: String, required: true })
  schoolId: string;

  @Prop({ type: String, required: true })
  classId: string;

  @Prop({ type: String, required: true })
  sectionId: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({
    type: String,
    enum: ['present', 'absent'],
    required: true,
  })
  status: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);


AttendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

AttendanceSchema.index({
  classId: 1,
  sectionId: 1,
  date: 1,
});

AttendanceSchema.index({
  schoolId: 1,
  date: 1,
});

