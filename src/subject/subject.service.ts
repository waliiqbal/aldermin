import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class SubjectService {
  constructor(private readonly databaseService: DatabaseService) {}

async addSubject(body: any, adminId: string) {
  const { name, description, classId, sectionIds } = body; 
  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const classData = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId: school._id.toString(),
    isActive: true,
  });

  if (!classData) {
    throw new BadRequestException('Class not found or does not belong to this admin');
  }

  console.log("Class Data:", classData);


  const existingSubject = await this.databaseService.repositories.subjectModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    schoolId: school._id,
    classId: classId,
  });

  if (existingSubject) {
    throw new BadRequestException('Subject already exists for this class');
  }


  const validSections = await this.databaseService.repositories.sectionModel.find({
    _id: { $in: sectionIds }, 
    classId: classId,  
    isActive: true,     
  });


  if (validSections.length !== sectionIds.length) {
    throw new BadRequestException('Some section IDs are invalid or do not belong to this class');
  }


  const newSubject = await this.databaseService.repositories.subjectModel.create({
    name,
    description,
    schoolId: school._id.toString(),
    classId: classId,
    subjectAssignments: sectionIds.map(sectionId => ({
      teacherId: null,  
      sectionId: sectionId,
    })),  
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
    schoolId: school._id.toString(),
     isActive: true,
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

 async assignSubjectToTeacher(adminId: string, teacherId: string, subjectId: string, classId: string, sectionId: string, academicYear: string) {
  
  const adminObjectId = new Types.ObjectId(adminId);

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  };

   const Class = await this.databaseService.repositories.classModel.findOne({ 
      _id: classId,
      schoolId: school._id.toString(),
      isActive: true,
    });

    if (!Class) {
      throw new Error('Class not found');
    }

    const Section = await this.databaseService.repositories.sectionModel.findOne({ 
      _id: sectionId,
      classId: classId,
      schoolId: school._id.toString(),
      isActive: true,
    });   

    if (!Section) {
      throw new Error('Section not found for this class');
    }

    const subject = await this.databaseService.repositories.subjectModel.findOne({ 
      _id: subjectId,
      classId: classId, 
      schoolId: school._id.toString(),
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    const existingAssignment = subject.subjectAssignments.find(
    (assignment) => 
      assignment.teacherId === teacherId && 
      assignment.sectionId === sectionId && 
      assignment.academicYear === academicYear
  );

  if (existingAssignment) {
    throw new Error('Teacher already assigned to this section for the given academic year');
  }


  const assignment = subject.subjectAssignments.find(
    (assignment) => assignment.sectionId === sectionId
  );

  if (!assignment) {
    throw new Error('Section not found for this subject');
  }


  assignment.teacherId = teacherId;
  assignment.academicYear = academicYear;


    await subject.save();

    return {
      message: 'Teacher Assigned to Subject Successfully',
      data: subject,
    };
  }
}

