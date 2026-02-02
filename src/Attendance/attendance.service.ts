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

async addBulkAttendanceByTeacher(
  teacherId: string,
  body: {
    date: string;
    presentStudentIds: string[];
  },
) {
  const { date, presentStudentIds } = body;


  const teacher =
    await this.databaseService.repositories.teacherModel.findOne({
      _id: teacherId,
    });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const schoolId = teacher.schoolId;
  
  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      _id: schoolId,
    });

  if (!school) {  
    throw new NotFoundException('School not found for this teacher');
  } 



  const section =
    await this.databaseService.repositories.sectionModel.findOne({
      teacherId,
      schoolId,
      isActive: true,
    });

  if (!section) {
    throw new NotFoundException('No active section assigned');
  }

  const classId = section.classId;

  /* --------------------------------------------------
     3️⃣ Fetch Section Students
  -------------------------------------------------- */
  const students =
    await this.databaseService.repositories.studentModel.find({
      sectionId: section._id.toString(),
      schoolId,
      classId,
      status: 'active',
    });

  if (!students.length) {
    throw new NotFoundException('No students found');
  }

  /* --------------------------------------------------
     4️⃣ Prevent Duplicate Attendance (Same Date)
  -------------------------------------------------- */
  const attendanceDate = new Date(date);

  const alreadyMarked =
    await this.databaseService.repositories.attendanceModel.findOne({
      sectionId: section._id.toString(),
      schoolId,
      date: attendanceDate,
    });

  if (alreadyMarked) {
    throw new BadRequestException(
      'Attendance already marked for this date',
    );
  }

  /* --------------------------------------------------
     5️⃣ Prepare Bulk Attendance
  -------------------------------------------------- */
  const attendanceDocs = students.map((student) => ({
    studentId: student._id.toString(),
    classId: student.classId,
    sectionId: section._id.toString(),
    schoolId,
    date: attendanceDate,
    status: presentStudentIds.includes(student._id.toString())
      ? 'present'
      : 'absent',
  }));

  /* --------------------------------------------------
     6️⃣ Bulk Insert
  -------------------------------------------------- */
  await this.databaseService.repositories.attendanceModel.insertMany(
    attendanceDocs,
  );

  return {
    message: 'Attendance marked successfully',
    date: attendanceDate,
    totalStudents: students.length,
    presentCount: attendanceDocs.filter(
      (a) => a.status === 'present',
    ).length,
    absentCount: attendanceDocs.filter(
      (a) => a.status === 'absent',
    ).length,
  };
}


async getAttendance(
  adminId: string,
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  studentId?: string,
  date?: string
) {
  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: new Types.ObjectId(adminId),
    });

  if (!school)
    throw new NotFoundException('School not found for this admin');

  
  const matchFilter: any = { schoolId: school._id.toString() };

  if (classId) matchFilter.classId = classId;
  if (sectionId) matchFilter.sectionId = sectionId;
  if (studentId) matchFilter.studentId = studentId;
  if (date) matchFilter.date = new Date(date);

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: matchFilter },


    {
      $addFields: {
        studentObjectId: { $toObjectId: '$studentId' },
        classObjectId: { $toObjectId: '$classId' },
        sectionObjectId: { $toObjectId: '$sectionId' },
      },
    },

   
    {
      $lookup: {
        from: 'students',
        localField: 'studentObjectId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },


    {
      $addFields: {
        parentObjectId: { $toObjectId: '$student.parentId' },
      },
    },

    {
      $lookup: {
        from: 'parents',
        localField: 'parentObjectId',
        foreignField: '_id',
        as: 'parent',
      },
    },
    {
      $unwind: {
        path: '$parent',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔹 class lookup
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
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
        localField: 'sectionObjectId',
        foreignField: '_id',
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
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        studentName: { $first: '$student.firstName' },
        parentName: {$first: '$parent.fatherName'},
        className: { $first: '$class.name' },
        sectionName: { $first: '$section.name' },
        date: { $first: '$date' },
        status: { $first: '$status' },
      },
    },

    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.attendanceModel.aggregate(
      pipeline,
    );

  const totalCount =
    await this.databaseService.repositories.attendanceModel.countDocuments(
      matchFilter,
    );

  return {
    message: 'Attendance fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}

async getAttendanceByTeacher(
  teacherId: string,
  page = 1,
  limit = 10,
  date?: string,
) {

  const teacher =
    await this.databaseService.repositories.teacherModel.findOne({
      _id: teacherId,
    });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const schoolId = teacher.schoolId;

  
  const section =
    await this.databaseService.repositories.sectionModel.findOne({
      teacherId,
      schoolId,
      isActive: true,
    });

  if (!section) {
    throw new NotFoundException(
      'No section assigned to this teacher',
    );
  }


  const students =
    await this.databaseService.repositories.studentModel.find(
      {
        sectionId: section._id.toString(),
        schoolId,
        status: 'active',
      },
      { _id: 1 },
    );

  if (!students.length) {
    return {
      message: 'No students found for this section',
      page,
      limit,
      totalCount: 0,
      data: [],
    };
  }

  const studentIds = students.map((s) => s._id.toString());


  const matchFilter: any = {
    studentId: { $in: studentIds },
    sectionId: section._id.toString(),
    schoolId,
  };

  if (date) matchFilter.date = new Date(date);

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: matchFilter },

    {
      $addFields: {
        studentObjectId: { $toObjectId: '$studentId' },
        classObjectId: { $toObjectId: '$classId' },
        sectionObjectId: { $toObjectId: '$sectionId' },
      },
    },

   
    {
      $lookup: {
        from: 'students',
        localField: 'studentObjectId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },

    // 🔹 parent
    {
      $addFields: {
        parentObjectId: { $toObjectId: '$student.parentId' },
      },
    },
    {
      $lookup: {
        from: 'parents',
        localField: 'parentObjectId',
        foreignField: '_id',
        as: 'parent',
      },
    },
    {
      $unwind: {
        path: '$parent',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔹 class
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
        as: 'class',
      },
    },
    {
      $unwind: {
        path: '$class',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔹 section
    {
      $lookup: {
        from: 'sections',
        localField: 'sectionObjectId',
        foreignField: '_id',
        as: 'section',
      },
    },
    {
      $unwind: {
        path: '$section',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔹 final response
    {
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        studentName: { $first: '$student.firstName' },
        parentName: { $first: '$parent.fatherName' },
        className: { $first: '$class.name' },
        sectionName: { $first: '$section.name' },
        date: { $first: '$date' },
        status: { $first: '$status' },
      },
    },

    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.attendanceModel.aggregate(
      pipeline,
    );

  const totalCount =
    await this.databaseService.repositories.attendanceModel.countDocuments(
      matchFilter,
    );

  return {
    message: 'Attendance fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}





}

