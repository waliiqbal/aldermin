/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { AdminModule } from './Admin/admin.module';
import { ClassModule } from './class/class.module';
import { SectionModule } from './section/section.module';
import { StudentModule } from './student/student.module';
import { ReportModule } from './report/report.module';
import { LibraryModule } from './library/library.module';


@Module({
  imports: [
    // ✅ Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    OtpModule,
    AdminModule,
    ClassModule,
    SectionModule,
    StudentModule,
    ReportModule,
    LibraryModule,


   

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
