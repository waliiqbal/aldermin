import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateHomeworkDto } from './homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly databaseService: DatabaseService) {}
   
  async addHomework(
  createHomeworkDto: CreateHomeworkDto,
  userId: string,
  userType: string,
) {
  const {
    classId,
    sectionId,
    subjectId,
    homeworkDate,
    submissionDate,
    marks,
    description,
    fileUrl,
    academicYear
  } = createHomeworkDto;

  let userModel;

 
  if (userType === 'admin' || userType === 'adminStaff') {
    userModel = this.databaseService.repositories.adminModel;
  } else if (userType === 'teacher') {
    userModel = this.databaseService.repositories.teacherModel;
  } else {
    throw new BadRequestException('Invalid user type');
  }

  const userObjectId = new Types.ObjectId(userId);

 
  const userData = await userModel.findById(userObjectId);

  if (!userData) {
    throw new NotFoundException('User not found');
  }

  const schoolId = userData.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School ID not found for this user');
  }

  const school = await this.databaseService.repositories.schoolModel.findById(
    schoolId,
  );

  if (!school) {
    throw new NotFoundException('School not found');
  }

  const classData = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId: school._id,
  });

  if (!classData) {
    throw new BadRequestException('Class not found for this school');
  }

  const sectionData =
    await this.databaseService.repositories.sectionModel.findOne({
      _id: sectionId,
      classId: classId,
      schoolId: school._id,
    });

  if (!sectionData) {
    throw new BadRequestException('Section not found for this class');
  }

  const students = await this.databaseService.repositories.studentModel.find({
    schoolId: school._id,
    classId: classId,
    sectionId: sectionId,
    academicYear: academicYear,
    status: 'active',
  });

  if (!students.length) {
    throw new BadRequestException(
      'No active students found for this class/section',
    );
  }

  const studentsStatus = students.map(student => ({
    studentId: student._id.toString(),
    status: 'PENDING',
  }));

  const homework =
    await this.databaseService.repositories.homeworkModel.create({
      schoolId: school._id,
      classId,
      sectionId,
      subjectId,
      homeworkDate,
      submissionDate,
      marks,
      description,
      fileUrl,
      creatorId: userId,
      type: userType,
      studentsStatus,
    });

  const cleanHomework =
    await this.databaseService.repositories.homeworkModel
      .findById(homework._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Homework added successfully',
    data: cleanHomework,
  };
}


async getHomeworksByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  subjectId?: string,
  academicYear?: string,
) {
  const adminObjectId = new Types.ObjectId(adminId);

  const adminData =
    await this.databaseService.repositories.adminModel.findById(adminObjectId);

  if (!adminData) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = adminData.schoolId;

  if (!schoolId) {
    throw new BadRequestException(
      'School ID not found for this admin/admin_staff',
    );
  }

  const school =
    await this.databaseService.repositories.schoolModel.findById(schoolId);

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  // 🔹 MATCH FILTER
  const match: any = { schoolId};
  if (classId) match.classId = classId;
  if (sectionId) match.sectionId = sectionId;
  if (subjectId) match.subjectId = subjectId;
  if (academicYear) match.academicYear = academicYear;

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: match },

  
    {
      $lookup: {
        from: 'classes',
        let: { classIdStr: '$classId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$classIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'class',
      },
    },
    {
      $unwind: {
        path: '$class',
        preserveNullAndEmptyArrays: true,
      },
    },


    {
      $lookup: {
        from: 'sections',
        let: { sectionIdStr: '$sectionId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$sectionIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'section',
      },
    },
    {
      $unwind: {
        path: '$section',
        preserveNullAndEmptyArrays: true,
      },
    },

    // ---------- SUBJECT ----------
    {
      $lookup: {
        from: 'subjects',
        let: { subjectIdStr: '$subjectId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$subjectIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'subject',
      },
    },
    {
      $unwind: {
        path: '$subject',
        preserveNullAndEmptyArrays: true,
      },
    },

    // ---------- FINAL RESPONSE ----------
    {
      $project: {
        _id: 1,
        className: { $ifNull: ['$class.name', ''] },
        sectionName: { $ifNull: ['$section.name', ''] },
        subjectName: { $ifNull: ['$subject.name', ''] },
        homeworkDate: 1,
        submissionDate: 1,
        fileUrl: 1,
        type: 1,
        description: 1,
        marks: 1,
      },
    },

    { $sort: { homeworkDate: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.homeworkModel.aggregate(pipeline);

  const totalCount =
    await this.databaseService.repositories.homeworkModel.countDocuments(match);

  return {
    message: 'Homeworks fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}

async getHomeworksByTeacher(
  teacherId: string,
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  subjectId?: string,
  homeworkDate?: Date,
  academicYear?: string,
) {
  const teacherObjectId = new Types.ObjectId(teacherId);

  const teacherData =
    await this.databaseService.repositories.teacherModel.findById(
      teacherObjectId,
    );

  if (!teacherData) {
    throw new NotFoundException('Teacher not found');
  }

  const schoolId = teacherData.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School ID not found for this teacher');
  }

  const school =
    await this.databaseService.repositories.schoolModel.findById(schoolId);

  if (!school) {
    throw new NotFoundException('School not found for this teacher');
  }

  const match: any = {
    schoolId,
    creatorId: teacherId,
    type: 'teacher',
  };

  if (classId) match.classId = classId;
  if (sectionId) match.sectionId = sectionId;
  if (subjectId) match.subjectId = subjectId;
  if (homeworkDate) match.homeworkDate = homeworkDate;
  if (academicYear) match.academicYear = academicYear;


  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: match },

    {
      $lookup: {
        from: 'classes',
        let: { classIdStr: '$classId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$classIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'class',
      },
    },
    {
      $unwind: {
        path: '$class',
        preserveNullAndEmptyArrays: true,
      },
    },


    {
      $lookup: {
        from: 'sections',
        let: { sectionIdStr: '$sectionId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$sectionIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'section',
      },
    },
   {
      $unwind: {
        path: '$section',
        preserveNullAndEmptyArrays: true,
      },
    },


    {
      $lookup: {
        from: 'subjects',
        let: { subjectIdStr: '$subjectId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$subjectIdStr'],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'subject',
      },
    },
    {
      $unwind: {
        path: '$subject',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 1,
        className: '$class.name',
        sectionName: '$section.name',
        subjectName: '$subject.name',
        homeworkDate: 1,
        submissionDate: 1,
        fileUrl: 1,
        type: 1,
        description: 1,
        marks: 1,
      },
    },

    { $sort: { homeworkDate: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.homeworkModel.aggregate(pipeline);

  const totalCount =
    await this.databaseService.repositories.homeworkModel.countDocuments(
      match,
    );

  return {
    message: 'Homeworks fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}



}

