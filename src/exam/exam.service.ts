import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateExamDto } from './dto/createexam.dto';
import { CreateExamScheduleDto } from './dto/createExamSchedule.dto';
import e from 'express';
import { ExamSchedule } from './schema/examschedule.schema';

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

  
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
        as: 'class',
      },
    },
    { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },


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


async addExamSchedule(
  createExamScheduleDto: CreateExamScheduleDto,
  adminId: string,
) {
  const {
    examId,
    teacherId,
    room_number,
    duration,
    examDate,
    examTime,
    day,
  } = createExamScheduleDto;

  const adminObjectId = new Types.ObjectId(adminId);

  
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const exam = await this.databaseService.repositories.examModel.findOne({
    _id: examId,
    schoolId: school._id.toString(),
    status: 'active',
  });

  if (!exam) {
    throw new BadRequestException('Exam not found for this school');
  }


  const existingSchedule =
    await this.databaseService.repositories.examScheduleModel.findOne({
      examId,
      examDate,
      examTime,
    });

  if (existingSchedule) {
    throw new BadRequestException('Exam schedule already exists');
  }

  const newSchedule =
    await this.databaseService.repositories.examScheduleModel.create({
      examId,
      teacherId,
      room_number,
      duration,
      examDate,
      examTime,
      day,
    });


  const cleanSchedule =
    await this.databaseService.repositories.examScheduleModel
      .findById(newSchedule._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Exam schedule created successfully',
    data: cleanSchedule,
  };
}

async getExamSchedule(
  adminId: string,
  page: number = 1,
  limit: number = 10,
  classId?: string,
  sectionId?: string,
  subjectId?: string,
  examId?: string,
) {
  const adminObjectId = new Types.ObjectId(adminId);
  const skip = (page - 1) * limit;


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const examMatch: any = {
    schoolId: school._id.toString(),
    status: 'active',
  };

  if (classId) examMatch.classId = classId;
  if (sectionId) examMatch.sectionId = sectionId;
  if (subjectId) examMatch.subjectId = subjectId;
  if (examId) examMatch._id = new Types.ObjectId(examId);

  const schedules =
    await this.databaseService.repositories.examScheduleModel.aggregate([
      // 1️⃣ exam lookup
      {
        $lookup: {
          from: 'exams',
          let: { examId: { $toObjectId: '$examId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$examId'] },
              },
            },
            { $match: examMatch },
          ],
          as: 'exam',
        },
      },
      { $unwind: '$exam' },

   
      {
        $lookup: {
          from: 'classes',
          let: { classId: { $toObjectId: '$exam.classId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$classId'] },
              },
            },
          ],
          as: 'class',
        },
      },
      { $unwind: '$class' },


      {
        $lookup: {
          from: 'sections',
          let: { sectionId: { $toObjectId: '$exam.sectionId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$sectionId'] },
              },
            },
          ],
          as: 'section',
        },
      },
      { $unwind: '$section' },


      {
        $lookup: {
          from: 'subjects',
          let: { subjectId: { $toObjectId: '$exam.subjectId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$subjectId'] },
              },
            },
          ],
          as: 'subject',
        },
      },
      { $unwind: '$subject' },

  
      { $sort: { examDate: -1 } },

   
      { $skip: skip },
      { $limit: limit },

 
      {
        $project: {
          _id: 1,
          examDate: 1,
          examTime: 1,
          day: 1,
          duration: 1,
          room_number: 1,

          examType: '$exam.examType',
          examMode: '$exam.examMode',
          totalMarks: '$exam.totalMarks',
          passingMarks: '$exam.passingMarks',

          classId: '$exam.classId',
          sectionId: '$exam.sectionId',
          subjectId: '$exam.subjectId',

          className: '$class.name',
          sectionName: '$section.name',
          subjectName: '$subject.name',
        },
      },
    ]);

  return {
    message: 'Exam schedules fetched successfully',
    page,
    limit,
    count: schedules.length,
    data: schedules,
  };
}

async addStudentMarks(body: any) {
  const { studentId, examId, teacherId, examScheduleId, examDate, totalMarks, obtainedMarks, resultStatus, isAbsent, remarks } = body;


  const existing = await this.databaseService.repositories.studentMarksModel.findOne({
    studentId,
    examId,
    examScheduleId
  });

  if (existing) {
    throw new Error('Marks for this student in this exam already exist');
  }


  const studentMarks = new this.databaseService.repositories.studentMarksModel({
    studentId,
    examId,
    teacherId,
    examScheduleId,
    examDate,
    obtainedMarks,
    resultStatus,
    isAbsent: isAbsent || false,
    remarks: remarks || '',
    totalMarks
  });

  await studentMarks.save();

  return {
    message: 'Student marks added successfully',
    data: studentMarks
  };
}

async getResultsByYear(
  adminId: string,  
  page: number = 1,
  limit: number = 10,
  classId?: string,
  sectionId?: string,
  examType?: string,
  year?: number,
) {
  const adminObjectId = new Types.ObjectId(adminId);
  const skip = (page - 1) * limit;


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  console.log("wali")

  const exams = await this.databaseService.repositories.examModel.find({
    schoolId: school._id.toString(),
    classId,
    sectionId,
    examType, 
  });

  console.log(classId, sectionId, examType)

  console.log(exams)

  if (!exams || exams.length === 0) {
    return [];
  }

  const examIds = [...new Set(exams.map(exam => exam._id.toString()))];




  const studentMarks = await this.databaseService.repositories.studentMarksModel.aggregate([
    {
      $match: {
        examId: { $in: examIds },  
        examDate: { $gte: startDate, $lte: endDate },  
      },
    },
    {
      $group: {
        _id: '$studentId',  
        totalMarksObtained: { $sum: '$obtainedMarks' },  
        totalMarks: { $sum: '$totalMarks' },  
        totalSubjects: { $sum: 1 }, 
      },
    },
    {
      $lookup: {
        from: 'students',  
        let: { studentId: { $toObjectId: '$_id' } },  
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$studentId'] },  
            },
          },
        ],
        as: 'student',
      },
    },
    { $unwind: '$student' },  
    {
      $lookup: {
        from: 'classes', 
        let: { classId: { $toObjectId: classId } }, 
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$classId'] }, 
            },
          },
        ],
        as: 'class',  
      },
    },
    { $unwind: '$class' },  
    {
      $lookup: {
        from: 'sections',  
        let: { sectionId: { $toObjectId: sectionId } },  
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$sectionId'] },  
            },
          },
        ],
        as: 'section', 
      },
    },
    { $unwind: '$section' },  
    {
      $project: {
        studentId: '$_id',  
        studentName: '$student.firstName',  
        className: '$class.name',  
        sectionName: '$section.name',  
        totalMarksObtained: 1,  
        totalMarks: 1,  
        totalSubjects: 1, 
        percentage: {
          $cond: {
            if: { $eq: ['$totalMarks', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$totalMarksObtained', '$totalMarks'] }, 100] },
          },
        },
      },
    },

    { $skip: skip },
    { $limit: limit },
  ]);



  return {
    message: 'Results fetched successfully',
    page,
    limit,
    count: studentMarks.length,
    data: studentMarks,
  };
}

async getResultsByStudent(
  adminId: string,
  classId: string,
  sectionId?: string,
  studentId?: string,
  examType?: string,
  year?: number,
) {
  const adminObjectId = new Types.ObjectId(adminId);

  // 1️⃣ FIND SCHOOL
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  // 2️⃣ DATE RANGE
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  // 3️⃣ FIND EXAMS
  const exams = await this.databaseService.repositories.examModel.find({
    schoolId: school._id.toString(),
    classId,
    sectionId,
    examType,
  });

  if (!exams.length) {
    return {
      message: 'No exams found',
      data: [],
    };
  }

  const examIds = exams.map(exam => exam._id.toString());

  // 4️⃣ AGGREGATION PIPELINE
  const studentMarks =
    await this.databaseService.repositories.studentMarksModel.aggregate([
      // MATCH
      {
        $match: {
          studentId: studentId,
          examId: { $in: examIds },
          examDate: { $gte: startDate, $lte: endDate },
        },
      },

      // CONVERT IDS
      {
        $addFields: {
          studentObjectId: { $toObjectId: '$studentId' },
          examObjectId: { $toObjectId: '$examId' },
          examScheduleObjectId: {
            $cond: [
              { $ifNull: ['$examScheduleId', false] },
              { $toObjectId: '$examScheduleId' },
              null,
            ],
          },
        },
      },

      // STUDENT LOOKUP
      {
        $lookup: {
          from: 'students',
          localField: 'studentObjectId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },

      // EXAM SCHEDULE LOOKUP
      {
        $lookup: {
          from: 'examschedules', // ⚠️ actual collection name
          localField: 'examScheduleObjectId',
          foreignField: '_id',
          as: 'examSchedule',
        },
      },
      {
        $unwind: {
          path: '$examSchedule',
          preserveNullAndEmptyArrays: true,
        },
      },

      // TEACHER OBJECT ID
      {
        $addFields: {
          teacherObjectId: {
            $cond: [
              { $ifNull: ['$examSchedule.teacherId', false] },
              { $toObjectId: '$examSchedule.teacherId' },
              null,
            ],
          },
        },
      },

      // TEACHER LOOKUP
      {
        $lookup: {
          from: 'teachers', // ⚠️ confirm collection name
          localField: 'teacherObjectId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: {
          path: '$teacher',
          preserveNullAndEmptyArrays: true,
        },
      },

      // EXAM LOOKUP
      {
        $lookup: {
          from: 'exams',
          localField: 'examObjectId',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: '$exam' },

      // CLASS LOOKUP
      {
        $lookup: {
          from: 'classes',
          let: { classIdVar: { $toObjectId: '$exam.classId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$classIdVar'] } } },
          ],
          as: 'class',
        },
      },
      { $unwind: '$class' },

      // SECTION LOOKUP
      {
        $lookup: {
          from: 'sections',
          let: { sectionIdVar: { $toObjectId: '$exam.sectionId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$sectionIdVar'] } } },
          ],
          as: 'section',
        },
      },
      { $unwind: '$section' },

      // SUBJECT LOOKUP
      {
        $lookup: {
          from: 'subjects',
          let: { subjectIdVar: { $toObjectId: '$exam.subjectId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$subjectIdVar'] } } },
          ],
          as: 'subject',
        },
      },
      { $unwind: '$subject' },

      // FINAL RESPONSE
      {
        $project: {
          _id: 0,
          studentName: '$student.firstName',
          examType: '$exam.examType',
          className: '$class.name',
          sectionName: '$section.name',
          subjectName: '$subject.name',

          examScheduleRoom: {
            $ifNull: ['$examSchedule.room_number', null],
          },

          teacherName: {
            $ifNull: ['$teacher.name', null],
          },

          obtainedMarks: 1,
          totalMarks: 1,
          examDate: 1,
        },
      },
    ]);

  return {
    message: 'Results fetched successfully',
    data: studentMarks,
  };
}



}