import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class ClassService {
  constructor(private readonly databaseService: DatabaseService) {}

   async addClass(body: any, adminId: string) {
    const { name, description} = body;
    const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);



    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    const campusId = adminData.campusId
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

   
    const existingClass = await this.databaseService.repositories.classModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      schoolId: schoolId,
      isActive: true
    });

    if (existingClass) {
      throw new BadRequestException('Class already exists for this school');
    }

 
    const newClass = await this.databaseService.repositories.classModel.create({
      name,
      description,
      schoolId: schoolId,
      campusId: campusId,  
 
    });

    const cleanClass = await this.databaseService.repositories.classModel
      .findById(newClass._id)
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Class created successfully',
      data: cleanClass,
    };
  }


  async getClassesByCampusAdmin(adminId: string) {
  const adminObjectId = new Types.ObjectId(adminId);

    const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


    if (!adminData) {
      throw new NotFoundException('Admin/Admin Staff not found');
    }

    const schoolId = adminData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this admin/admin_staff');
    }
   
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);


    
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

 const campusId = adminData.campusId;

 const campus = await this.databaseService.repositories.campusModel.findById(campusId);

    if (!campus) {
      throw new NotFoundException('Campus not found for this admin/admin_staff');
    }
 
  const classes = await this.databaseService.repositories.classModel
    .find({ schoolId: schoolId, isActive: true, campusId: campusId })
    
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Classes fetched successfully',
    data: classes,
  };
}

async getCampusClassesBySchoolAdmin(adminId: string, campusId: string) {
  const adminObjectId = new Types.ObjectId(adminId);

 
  const adminData =
    await this.databaseService.repositories.adminModel.findById(adminObjectId);

  if (!adminData) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }


  const campus =
    await this.databaseService.repositories.schoolModel.findById(campusId);

  if (!campus) {
    throw new NotFoundException('Campus not found');
  }

  const schoolId = adminData.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School ID not found for this admin/admin_staff');
  } 

  const school = await this.databaseService.repositories.schoolModel.findById(schoolId);

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  } 

  const classes =
    await this.databaseService.repositories.classModel
      .find({
        schoolId: schoolId,
        campusId: campusId,
        isActive: true,
      })
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Campus classes fetched successfully',
    data: classes,
  };
}




}


