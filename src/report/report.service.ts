
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { AddReportDto } from './dto/addReport.dto';

@Injectable()
export class ReportService {
  constructor(private readonly databaseService: DatabaseService) {}



   async addReportByAdmin(addReportDto: AddReportDto, adminId: string) {
    const { reportingId, classId, sectionId, incident, description, type } = addReportDto;
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



    const currentDate = new Date();  
 
    const newIncident = new this.databaseService.repositories.reportModel({
      reportingId,
      reportedBy: adminId,
      classId,
      sectionId,
      incident,
      description,
      date: currentDate,
      type,
      schoolId,  
    });


    await newIncident.save();

    return {
      message: 'Incident reported successfully',
      data: newIncident,
    };
  }
async getReportsByAdmin(
  adminId: string,
  academicYear?: string, // 👈 PARAMETER
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  incidentType?: string,
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

  /* ---------------- MATCH CONDITIONS (REPORTS) ---------------- */
  const match: any = { schoolId };

  if (classId) match.classId = classId;
  if (sectionId) match.sectionId = sectionId;
  if (incidentType)
    match.incident = { $regex: incidentType, $options: 'i' };

  const skip = (page - 1) * limit;

 
  const pipeline: any[] = [
    { $match: match },

 
    {
      $lookup: {
        from: 'students',
        let: { rid: '$reportingId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', { $toObjectId: '$$rid' }] },
                  { $eq: ['$academicYear', academicYear] }, // 👈 FILTER
                ],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              gender: 1,
              academicYear: 1,
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
        let: { classId: '$classId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', { $toObjectId: '$$classId' }],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'class',
      },
    },
    { $unwind: '$class' },


    {
      $lookup: {
        from: 'sections',
        let: { sectionId: '$sectionId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', { $toObjectId: '$$sectionId' }],
              },
            },
          },
          { $project: { name: 1 } },
        ],
        as: 'section',
      },
    },
    { $unwind: '$section' },

    /* -------- INCIDENT COUNT (PER STUDENT) -------- */
    {
      $lookup: {
        from: 'reports',
        let: { studentId: '$reportingId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$reportingId', '$$studentId'] },
            },
          },
          { $count: 'count' },
        ],
        as: 'incidentCount',
      },
    },

    {
      $addFields: {
        totalIncidents: {
          $ifNull: [{ $arrayElemAt: ['$incidentCount.count', 0] }, 0],
        },
      },
    },

    /* -------- FINAL RESPONSE SHAPE -------- */
    {
      $project: {
        _id: 0,
        firstName: '$student.firstName',
        lastName: '$student.lastName',
        gender: '$student.gender',
        academicYear: '$student.academicYear',
        className: '$class.name',
        sectionName: '$section.name',
        incidentType: '$incident',
        description: '$description',
        totalIncidents: 1,
        date: 1,
      },
    },

    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.reportModel.aggregate(pipeline);

  /* -------- TOTAL COUNT -------- */
  const totalCount =
    await this.databaseService.repositories.reportModel.countDocuments(match);

  return {
    message: 'Reports fetched successfully',
    academicYear,
    page,
    limit,
    totalCount,
    data,
  };
}


   async addReportByTeacher(addReportDto: AddReportDto, teacherId: string) {
    const { reportingId, classId, sectionId, incident, description, type } = addReportDto;
    const teacherObjectId = new Types.ObjectId(teacherId);

    const teacherData = await this.databaseService.repositories.teacherModel.findById(teacherObjectId);



    if (!teacherData) {
      throw new NotFoundException('Teacher not found');
    }

    const schoolId = teacherData.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School ID not found for this teacher');
    }
    const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
    if (!school) {
      throw new NotFoundException('School not found for this teacher');
    } 

    const currentDate = new Date();

    
  


 
    const newIncident = new this.databaseService.repositories.reportModel({
      reportingId,
      reportedBy: teacherId,
      classId,
      sectionId,
      incident,
      description,
      date: currentDate,
      type,
      schoolId,  
    });


    await newIncident.save();

    return {
      message: 'Incident reported successfully',
      data: newIncident,
    };
  }
async getReportsByTeacher(
  teacherId: string,
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  incidentType?: string,
  academicYear?: string,
) {
  const teacherObjectId = new Types.ObjectId(teacherId);

  // Teacher exists check
  const teacher =
    await this.databaseService.repositories.teacherModel.findById(teacherObjectId);

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const schoolId = teacher.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School ID not found for this teacher');
  }

  // Base match for reports
  const match: any = {
    schoolId,
    reportedBy: teacherId,
  };

  if (classId) match.classId = classId;
  if (sectionId) match.sectionId = sectionId;
  if (incidentType) match.incident = { $regex: incidentType, $options: 'i' };

  const skip = (page - 1) * limit;

  // Aggregation pipeline for data
  const pipeline: any[] = [
    { $match: match },

    // Student lookup with optional academicYear
    {
      $lookup: {
        from: 'students',
        let: { sid: '$reportingId' },
        pipeline: [
          {
            $match: {
              $expr: academicYear
                ? {
                    $and: [
                      { $eq: ['$_id', { $toObjectId: '$$sid' }] },
                      { $eq: ['$academicYear', academicYear] },
                    ],
                  }
                : { $eq: ['$_id', { $toObjectId: '$$sid' }] },
            },
          },
          { $project: { firstName: 1, lastName: 1, gender: 1, academicYear: 1 } },
        ],
        as: 'student',
      },
    },
    { $unwind: '$student' },

    // Class lookup
    {
      $lookup: {
        from: 'classes',
        let: { cid: '$classId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$cid' }] } } },
          { $project: { name: 1 } },
        ],
        as: 'class',
      },
    },
    { $unwind: '$class' },

    // Section lookup
    {
      $lookup: {
        from: 'sections',
        let: { secId: '$sectionId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$secId' }] } } },
          { $project: { name: 1 } },
        ],
        as: 'section',
      },
    },
    { $unwind: '$section' },

    // Project final shape
    {
      $project: {
        _id: 0,
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        gender: '$student.gender',
        academicYear: '$student.academicYear',
        className: '$class.name',
        sectionName: '$section.name',
        incidentType: '$incident',
        description: '$description',
        date: 1,
      },
    },

    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.reportModel.aggregate(pipeline);

  // Aggregation pipeline for total count
  const countPipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: 'students',
        let: { sid: '$reportingId' },
        pipeline: [
          {
            $match: {
              $expr: academicYear
                ? {
                    $and: [
                      { $eq: ['$_id', { $toObjectId: '$$sid' }] },
                      { $eq: ['$academicYear', academicYear] },
                    ],
                  }
                : { $eq: ['$_id', { $toObjectId: '$$sid' }] },
            },
          },
        ],
        as: 'student',
      },
    },
    { $unwind: '$student' },
    { $count: 'total' },
  ];

  const countResult =
    await this.databaseService.repositories.reportModel.aggregate(countPipeline);
  const totalCount = countResult.length > 0 ? countResult[0].total : 0;

  return {
    message: 'Teacher reports fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}


async editReportByTeacher(reportId: string, teacherId: string, body: any) {
  const reportObjectId = new Types.ObjectId(reportId);

  const report = await this.databaseService.repositories.reportModel.findById(reportObjectId);
  

  if (!report) {
    throw new NotFoundException('Report not found');
  }




 
  const allowedFields = ['reportingId', 'classId', 'sectionId', 'incident', 'description', 'type'];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      report[field] = body[field];
    }
  });

  await report.save();

  return {
    message: 'Report updated successfully',
    data: report,
  };
}


  //  async addReportByAdmin(addReportDto: AddReportDto, adminId: string) {
  //   const { reportingId, classId, sectionId, incident, description, type } = addReportDto;
  //   const adminObjectId = new Types.ObjectId(adminId);

  //   const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


  //   if (!adminData) {
  //     throw new NotFoundException('Admin/Admin Staff not found');
  //   }

  //   const schoolId = adminData.schoolId;
  //   if (!schoolId) {
  //     throw new BadRequestException('School ID not found for this admin/admin_staff');
  //   }
   
  //   const school = await this.databaseService.repositories.schoolModel.findById(schoolId);
    
  //   if (!school) {
  //     throw new NotFoundException('School not found for this admin');
  //   }



  //   const currentDate = new Date();  
 
  //   const newIncident = new this.databaseService.repositories.reportModel({
  //     reportingId,
  //     reportedBy: adminId,
  //     classId,
  //     sectionId,
  //     incident,
  //     description,
  //     date: currentDate,
  //     type,
  //     schoolId,  
  //   });


  //   await newIncident.save();

  //   return {
  //     message: 'Incident reported successfully',
  //     data: newIncident,
  //   };
  // }


}













