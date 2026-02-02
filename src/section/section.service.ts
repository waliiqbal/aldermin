import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class SectionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addSection(body: any, adminId: string) {
  const { name, description, classId } = body;

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


  const classData = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId: schoolId,
    isActive: true,
  });

  if (!classData) {
    throw new BadRequestException('Class not found or does not belong to this admin');
  }

  console.log ("ggggggggggggg", classData)

  const existingSection = await this.databaseService.repositories.sectionModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    schoolId: schoolId,
    classId: classId,
    isActive: true
  });

  if (existingSection) {
    throw new BadRequestException('Section already exists for this class');
  }


  const newSection = await this.databaseService.repositories.sectionModel.create({
    name,
    description,
    schoolId: schoolId,
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

  const query: any = {
    schoolId: schoolId,
    isActive: true,
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

async assignClassTeacher(body: any, adminId: string) {
  const { teacherId, classId, sectionId } = body;

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


  const section = await this.databaseService.repositories.sectionModel.findOne({
    _id: sectionId,
    classId: classId,
    schoolId: schoolId,
    isActive: true,
  });

  if (!section) {
    throw new BadRequestException('Section not found for this class');
  }


  section.teacherId = teacherId;
  await section.save();

  const updatedSection = await this.databaseService.repositories.sectionModel
    .findById(section._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Class teacher assigned successfully',
    data: updatedSection,
  };
}

async editSection(body: any, adminId: string) {
  const { id, name, description, classId, isActive } = body;

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
 
  const classData = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId: schoolId,
    isActive: true,
  });

  if (!classData) {
    throw new BadRequestException('Class not found or does not belong to this admin');
  }


  const section = await this.databaseService.repositories.sectionModel.findOne({
    _id: id,
    schoolId: schoolId,
  });

  if (!section) {
    throw new NotFoundException('Section not found');
  }


  if (name) {
    const existingSection = await this.databaseService.repositories.sectionModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      schoolId: schoolId,
      classId: classId,
    });

    if (existingSection) {
      throw new BadRequestException('Section with this name already exists for this class');
    }
  }

  const updatedSection = await this.databaseService.repositories.sectionModel.findOneAndUpdate(
    { _id: id, schoolId: schoolId },
    { $set: { name, description, classId, isActive } },
    { new: true }
  );

  const cleanSection = await this.databaseService.repositories.sectionModel
    .findById(updatedSection._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Section updated successfully',
    data: cleanSection,
  };
}



}

