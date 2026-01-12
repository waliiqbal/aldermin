/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';

import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { AdminModule } from './Admin/admin.module';
import { ClassModule } from './class/class.module';
import { SectionModule } from './section/section.module';
import { StudentModule } from './student/student.module';
import { ReportModule } from './report/report.module';
import { LibraryModule } from './library/library.module';
import { FeesModule } from './fees/fees.module';
import { SubjectModule } from './subject/subject.module';
import { HomeworkModule } from './homework/homework.module';
import { attendanceModule } from './Attendance/attendance.module';
import { ExamModule } from './exam/exam.module';
import { AdmissionQueryModule } from './admissionQuery/admissionQuery.Module';
import { ComplainModule } from './complaint/complain.module';
import { VisitorModule } from './visitor/visitor.module';
import { PostalModule } from './postal/postal.module';
import { phoneCallModule } from './phoneCall/phoneCall.module';


@Module({
  imports: [
    // ✅ Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    // UsersModule,
    AuthModule,
    OtpModule,
    AdminModule,
    ClassModule,
    SectionModule,
    StudentModule,
    ReportModule,
    LibraryModule,
    FeesModule,
    SubjectModule,
    HomeworkModule,
    attendanceModule,
    ExamModule,
    AdmissionQueryModule,
    RedisModule,
    ComplainModule,
    VisitorModule,
    PostalModule,
    phoneCallModule,

    



   

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
