import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class ClassService {
  constructor(private readonly databaseService: DatabaseService) {}

   async addClass(body: any, adminId: string) {
    const { name, description} = body;
    const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

   
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

   
    const existingClass = await this.databaseService.repositories.classModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      schoolId: school._id
    });

    if (existingClass) {
      throw new BadRequestException('Class already exists for this school');
    }

 
    const newClass = await this.databaseService.repositories.classModel.create({
      name,
      description,
      schoolId: school._id,   
 
    });

    const cleanClass = await this.databaseService.repositories.classModel
      .findById(newClass._id)
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Class created successfully',
      data: cleanClass,
    };
  }


  async getClassesByAdmin(adminId: string) {
  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const classes = await this.databaseService.repositories.classModel
    .find({ schoolId: school._id })
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Classes fetched successfully',
    data: classes,
  };
}

}