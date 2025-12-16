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




     ) {}
     get repositories() {
    return {
      userModel: this.userModel,
      schoolModel: this.schoolModel,
      adminModel: this.adminModel,
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
  

        };
  }
}