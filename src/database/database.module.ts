
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as schema from './schema';
import { DatabaseService } from './databaseservice'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([
       { name: schema.User.name, schema: schema.UserSchema },
       { name: schema.School.name, schema: schema.SchoolSchema},
       { name: schema.Admin.name, schema: schema.AdminSchema},
       { name: schema.Class.name, schema: schema.ClassSchema},
       { name: schema.Student.name, schema: schema.StudentSchema},
       { name: schema.Section.name, schema: schema.SectionSchema},
       { name: schema.Parent.name, schema: schema.ParentSchema},
       { name: schema.Report.name, schema: schema.ReportSchema},
       { name: schema.Book.name, schema: schema.BookSchema},
       { name: schema.Library.name, schema: schema.LibrarySchema},
       { name: schema.Issuance.name, schema: schema.IssuanceSchema},
       { name: schema.FeesType.name, schema: schema.FeesTypeSchema},
       { name: schema.Fees.name, schema: schema.FeesSchema},
       { name: schema.Subject.name, schema: schema.SubjectSchema},
       { name: schema.Homework.name, schema: schema.HomeworkSchema},
       { name: schema.Attendance.name, schema: schema.AttendanceSchema},
       { name: schema.Teacher.name, schema: schema.TeacherSchema},
       { name: schema.Exam.name, schema: schema.ExamSchema},
       { name: schema.ExamSchedule.name, schema: schema.ExamScheduleSchema},
       { name: schema.StudentMarks.name, schema: schema.StudentMarksSchema},
       { name: schema.StudentMarks.name, schema: schema.StudentMarksSchema},
       { name: schema.AdmissionQuery.name, schema: schema.AdmissionQuerySchema},
       { name: schema.Complaint.name, schema: schema.ComplaintSchema},
       { name: schema.Visitor.name, schema: schema.VisitorSchema},
        { name: schema.Postal.name, schema: schema.PostalSchema},
        { name: schema.PhoneCall.name, schema: schema.PhoneCallSchema},
        { name: schema.IdCardTemplate.name, schema: schema.IdCardTemplateSchema},
        { name: schema.CertificateTemplate.name, schema: schema.CertificateTemplateSchema},

    
       

    ]),
  ],
  exports: [MongooseModule, DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}