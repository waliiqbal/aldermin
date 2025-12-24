import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class SubjectService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addSubject(body: any, adminId: string) {
  const { name, description, classId } = body;

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
    throw new BadRequestException('Class not found or does not belong to this admin');
  }

  console.log ("ggggggggggggg", classData)

  const existingSubject = await this.databaseService.repositories.subjectModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    schoolId: school._id,
    classId: classId,
  });

  if (existingSubject) {
    throw new BadRequestException('Subject already exists for this class');
  }


  const newSubject = await this.databaseService.repositories.subjectModel.create({
    name,
    description,
    schoolId: school._id,
    classId: classId,
  });


  const cleanSubject = await this.databaseService.repositories.subjectModel
    .findById(newSubject._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Subject Added Successfully',
    data: cleanSubject,
  };
}

async getAllSubjectByAdmin(adminId: string, classId?: string) {
  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const query: any = {
    schoolId: school._id,
  };

 
  if (classId) {
    query.classId = classId;
  }


  const Subject = await this.databaseService.repositories.subjectModel
    .find(query)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Subject fetched successfully',
    count: Subject.length,
    data: Subject,
  };
}

}