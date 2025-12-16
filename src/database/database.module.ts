/* eslint-disable prettier/prettier */
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
        {name: schema.Parent.name, schema: schema.ParentSchema},
        {name: schema.Report.name, schema: schema.ReportSchema},
        {name: schema.Book.name, schema: schema.BookSchema},
        {name: schema.Library.name, schema: schema.LibrarySchema},
        {name: schema.Issuance.name, schema: schema.IssuanceSchema},
        {name: schema.FeesType.name, schema: schema.FeesTypeSchema},
       { name: schema.Fees.name, schema: schema.FeesSchema}
       

    ]),
  ],
  exports: [MongooseModule, DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}