import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class AdmissionQueryService {
  constructor(private readonly databaseService: DatabaseService) {}

async addAdmissionQuery(body: any, adminId: string) {
  const {
    classId,
    name,
    email,
    phone,
    adress,
    description,
    date,
    folloWDate,
    numberOfChild,
  } = body;

  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const classData = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId: school._id,
  });

  if (!classData) {
    throw new BadRequestException('Class not found');
  }


  const existingQuery =
    await this.databaseService.repositories.admissionQueryModel.findOne({
      email,
      phone,
      date: new Date(date),
      schoolId: school._id.toString(),
    });

  if (existingQuery) {
    throw new BadRequestException(
      'Admission query already exists for this date',
    );
  }

  const admissionQuery =
    await this.databaseService.repositories.admissionQueryModel.create({
      schoolId: school._id.toString(),
      classId,
      name,
      email,
      phone,
      adress,
      description,
      date,
      folloWDate,
      numberOfChild,
      status: 'pending',
    });

 
  return {
    message: 'Admission query added successfully',
    data: admissionQuery,
  };
}


 


}