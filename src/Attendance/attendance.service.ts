import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DatabaseService } from  '../database/databaseservice'

@Injectable()
export class AttendanceService {
  constructor(private readonly databaseService: DatabaseService) {}
async addAttendance(body: any, adminId: string) {
  const { studentId, classId, sectionId, date, status } = body;

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


  const sectionData = await this.databaseService.repositories.sectionModel.findOne({
    _id: sectionId,
    classId: classId,
    schoolId: school._id,
  });

  if (!sectionData) {
    throw new BadRequestException('Section not found');
  }

 
  const student = await this.databaseService.repositories.studentModel.findOne({
    _id: studentId,
    schoolId: school._id,
    classId: classId,
    sectionId: sectionId,
  });

  if (!student) {
    throw new BadRequestException('Student not found in this class/section');
  }

  const existingAttendance =
    await this.databaseService.repositories.attendanceModel.findOne({
      studentId,
      date: new Date(date),
    });

  if (existingAttendance) {
    throw new BadRequestException('Attendance already marked for this date');
  }

  
  const attendance =
    await this.databaseService.repositories.attendanceModel.create({
      studentId,
      schoolId: school._id,
      classId,
      sectionId,
      date,
      status,
    });

  return {
    message: 'Attendance marked successfully',
    data: attendance,
  };
}

async getAttendance(
  adminId: string,
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  studentId?: string, 
  date?: string  // Optional filter by date
) {
  // Fetch the school based on adminId (token-based)
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new Types.ObjectId(adminId),
  });
  if (!school) throw new NotFoundException('School not found for this admin');

  // Build the match filter with provided query parameters
  const matchFilter: any = { schoolId: school._id.toString() };

  if (classId) matchFilter.classId = classId;
  if (sectionId) matchFilter.sectionId = sectionId;
  if (studentId) matchFilter.studentId = studentId;
  if (date) matchFilter.date = new Date(date); // Use date directly from frontend

  // Pagination setup
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: matchFilter },

    { $addFields: {
        studentObjectId: { $toObjectId: "$studentId" },
        classObjectId: { $toObjectId: "$classId" },
        sectionObjectId: { $toObjectId: "$sectionId" }
    } },

    // Lookup for student details
    {
      $lookup: {
        from: 'students',
        localField: 'studentObjectId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },

    // Lookup for class details
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
        as: 'class'
      }
    },
    { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },

    // Lookup for section details
    {
      $lookup: {
        from: 'sections',
        localField: 'sectionObjectId',
        foreignField: '_id',
        as: 'section'
      }
    },
    { $unwind: { path: '$section', preserveNullAndEmptyArrays: true } },

    // Group attendance data for final structure
    {
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        studentName: { $first: '$student.firstName' },
        className: { $first: '$class.name' },
        sectionName: { $first: '$section.name' },
        date: { $first: '$date' },
        status: { $first: '$status' }
      }
    },

    { $sort: { date: -1 } },  // Sorting by date (newest first)

    { $skip: skip },  // Pagination: skip the first `skip` records
    { $limit: limit }  // Limit the result to the `limit`
  ];

  const data = await this.databaseService.repositories.attendanceModel.aggregate(pipeline);

  // Calculate total records matching the filter criteria
  const totalCount = await this.databaseService.repositories.attendanceModel.countDocuments(matchFilter);

  return {
    message: 'Attendance fetched successfully',
    page,
    limit,
    totalCount,
    data
  };
}



}

