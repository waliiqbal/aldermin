/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as schema from "./schema";

@Injectable()
export class DatabaseService {
  constructor(

     @InjectModel(schema.User.name)
    private userModel: Model<schema.UserDocument>,
     @InjectModel(schema.School.name)
    private schoolModel: Model<schema.SchoolDocument>,
     @InjectModel(schema.Admin.name)
    private adminModel: Model<schema.AdminDocument>,
         @InjectModel(schema.Class.name)
    private classModel: Model<schema.ClassDocument>,
        @InjectModel(schema.Student.name)
    private studentModel: Model<schema.StudentDocument>,
     @InjectModel(schema.Section.name)
   private sectionModel: Model<schema.SectionDocument>,

        @InjectModel(schema.Parent.name)
   private parentModel: Model<schema.ParentDocument>,

      @InjectModel(schema.Report.name)
   private reportModel: Model<schema.ParentDocument>,

   
      @InjectModel(schema.Book.name)
   private bookModel: Model<schema.BookDocument>,

     
      @InjectModel(schema.Library.name)
   private libraryModel: Model<schema.LibraryDocument>,

   
      @InjectModel(schema.Issuance.name)
   private issuanceModel: Model<schema.IssuanceDocument>,

 @InjectModel(schema.FeesType.name)
   private feestypeModel: Model<schema.FeesTypeDocument>,

 @InjectModel(schema.Fees.name)
   private feesModel: Model<schema.FeesDocument>,

   
 @InjectModel(schema.Subject.name)
   private subjectModel : Model<schema.SubjectDocument>,

 @InjectModel(schema.Homework.name)
   private homeworkModel : Model<schema.HomeworkDocument>,

   
 @InjectModel(schema.Attendance.name)
   private attendanceModel : Model<schema.AttendanceDocument>,

   @InjectModel(schema.Teacher.name)
   private teacherModel : Model<schema.AttendanceDocument>,

        @InjectModel(schema.Exam.name)
    private examModel: Model<schema.ExamDocument>,


     @InjectModel(schema.ExamSchedule.name)
    private examScheduleModel: Model<schema.ExamScheduleDocument>,

     @InjectModel(schema.StudentMarks.name)
    private studentMarksModel: Model<schema.StudentMarksDocument>,

      @InjectModel(schema.AdmissionQuery.name)
    private admissionQueryModel: Model<schema.AdmissionQueryDocument>,

          @InjectModel(schema.Complaint.name)
    private complainModel: Model<schema.ComplaintDocument>,

        @InjectModel(schema.Visitor.name)     
    private visitorModel: Model<schema.VisitorDocument>,

        @InjectModel(schema.Postal.name)     
    private postalModel: Model<schema.PostalDocument>,
    
        @InjectModel(schema.PhoneCall.name)     
    private phoneCallModel: Model<schema.PhoneCallDocument>,

        @InjectModel(schema.IdCardTemplate.name)     
    private idCardTemplateModel: Model<schema.IdCardTemplateDocument>,

      @InjectModel(schema.CertificateTemplate.name)     
    private certificateTemplateModel: Model<schema.CertificateTemplateDocument>,

    @InjectModel(schema.Campus.name)     
    private campusModel: Model<schema.CampusDocument>,


     ) {}
     get repositories() {
    return {
      userModel: this.userModel,
      schoolModel: this.schoolModel,
      adminModel: this.adminModel,
      campusModel: this.campusModel,
      classModel: this.classModel,
      studentModel: this.studentModel,
      sectionModel: this.sectionModel,
      parentModel: this.parentModel,
      reportModel: this.reportModel,
      bookModel: this.bookModel,
      libraryModel: this.libraryModel,
      issuanceModel: this.issuanceModel,
      feestypeModel: this.feestypeModel,
      feesModel: this.feesModel,
      subjectModel: this.subjectModel,
      homeworkModel: this.homeworkModel,
      attendanceModel: this.attendanceModel,
      teacherModel: this.teacherModel,
      examModel: this.examModel,
      examScheduleModel: this.examScheduleModel,
      studentMarksModel: this.studentMarksModel,
      admissionQueryModel :this.admissionQueryModel,  
      complainModel: this.complainModel,
      visitorModel: this.visitorModel,
      postalModel: this.postalModel,
      phoneCallModel: this.phoneCallModel,
      idCardTemplateModel: this.idCardTemplateModel,
      certificateTemplateModel: this.certificateTemplateModel,

        };
  }
}