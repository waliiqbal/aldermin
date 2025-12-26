import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateExamDto } from './dto/createexam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly databaseService: DatabaseService) {}

 async addExam(createExamDto: CreateExamDto, adminId: string) {
    const { classId, sectionId, subjectId, examType, totalMarks, passingMarks, examMode } = createExamDto;
    const adminObjectId = new Types.ObjectId(adminId);

  
    const school = await this.databaseService.repositories.schoolModel.findOne({
      admin: adminObjectId,
    });

    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }


    const existingExam = await this.databaseService.repositories.examModel.findOne({
      subjectId,
      schoolId: school._id.toString(),
      classId,
      sectionId,
      status: "active"  
    });

    if (existingExam) {
      throw new BadRequestException('Exam already exists for this school and class');
    }


    const newExam = await this.databaseService.repositories.examModel.create({
      schoolId: school._id.toString(),
      classId,
      sectionId,
      subjectId,
      examType,
      totalMarks,
      passingMarks,
      examMode,
    });


    const cleanExam = await this.databaseService.repositories.examModel
      .findById(newExam._id)
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Exam created successfully',
      data: cleanExam,
    };
  }
async getExamsByAdmin(adminId: string, query: any) {
  const adminObjectId = new Types.ObjectId(adminId);
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const matchFilter: any = {
    schoolId: school._id.toString(),
    status: 'active',
  };

  if (query.classId) {
    matchFilter.classId = query.classId;
  }


  if (query.subjectId) {
    matchFilter.subjectId = query.subjectId;
  }

  const exams = await this.databaseService.repositories.examModel.aggregate([
    { $match: matchFilter },

 
    {
      $addFields: {
        classObjectId: { $toObjectId: '$classId' },
        sectionObjectId: { $toObjectId: '$sectionId' },
        subjectObjectId: { $toObjectId: '$subjectId' },
      },
    },

    // Lookup for class details
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
        as: 'class',
      },
    },
    { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },

    // Lookup for section details
    {
      $lookup: {
        from: 'sections',
        localField: 'sectionObjectId',
        foreignField: '_id',
        as: 'section',
      },
    },
    { $unwind: { path: '$section', preserveNullAndEmptyArrays: true } },

 
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectObjectId',
        foreignField: '_id',
        as: 'subject',
      },
    },
    { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },

  
    {
      $project: {
        _id: 1,
        className: '$class.name',
        sectionName: '$section.name',
        subjectName: '$subject.name',
        examType: 1,
        examMode: 1,
        status: 1,
      },
    },
  ]);

  return {
    message: 'Exams fetched successfully',
    data: exams,
  };
}


  
  }