import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class SectionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addSection(body: any, adminId: string) {
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

  const existingSection = await this.databaseService.repositories.sectionModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    schoolId: school._id,
    classId: classId,
  });

  if (existingSection) {
    throw new BadRequestException('Section already exists for this class');
  }


  const newSection = await this.databaseService.repositories.sectionModel.create({
    name,
    description,
    schoolId: school._id,
    classId: classId,
  });


  const cleanSection = await this.databaseService.repositories.sectionModel
    .findById(newSection._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Section created successfully',
    data: cleanSection,
  };
}

async getAllSectionsByAdmin(adminId: string, classId?: string) {
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


  const sections = await this.databaseService.repositories.sectionModel
    .find(query)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Sections fetched successfully',
    count: sections.length,
    data: sections,
  };
}

}