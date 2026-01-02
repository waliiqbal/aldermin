
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

 
    const school = await this.databaseService.repositories.schoolModel.findOne({ admin: adminObjectId });
    if (!school) {
      throw new NotFoundException('School not found for this admin');
    }

    const schoolId = school._id;  

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
  page = 1,
  limit = 10,
  classId?: string,
  sectionId?: string,
  incidentType?: string,  
) {
  const adminObjectId = new Types.ObjectId(adminId);

  const school = await this.databaseService.repositories.schoolModel.findOne({ admin: adminObjectId });
  if (!school) throw new NotFoundException("School not found for this admin");

  const schoolId = school._id.toString();  

  const match: any = { schoolId };

  if (classId) match.classId = classId;  
  if (sectionId) match.sectionId = sectionId;  
  if (incidentType) match.incident = { $regex: incidentType, $options: "i" };

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: match },


    {
      $lookup: {
        from: "students",
        let: { rid: "$reportingId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: "$$rid" }] 
              }
            }
          },
          { $project: { firstName: 1, lastName: 1, gender: 1 } } 
        ],
        as: "student",
      },
    },
    { $unwind: "$student" },

   
    {
      $lookup: {
        from: "classes", 
        let: { classId: "$classId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: "$$classId" }]  
              }
            }
          },
          { $project: { className: 1 } }  
        ],
        as: "class",
      },
    },
    { $unwind: "$class" },  

  
    {
      $lookup: {
        from: "sections",  
        let: { sectionId: "$sectionId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: "$$sectionId" }]  
              }
            }
          },
          { $project: { sectionName: 1 } } 
        ],
        as: "section",
      },
    },
    { $unwind: "$section" },  

  
    {
      $lookup: {
        from: "reports",
        let: { studentId: "$reportingId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$reportingId", "$$studentId"] }
            }
          },
          { $count: "count" }
        ],
        as: "incidentCount",
      },
    },

    {
      $addFields: {
        totalIncidents: {
          $ifNull: [{ $arrayElemAt: ["$incidentCount.count", 0] }, 0]
        }
      }
    },

 
    {
      $project: {
        _id: 0, 
        firstName: "$student.firstName",
        lastName: "$student.lastName",
        gender: "$student.gender",
        totalIncidents: 1,
        className: "$class.className",
        sectionName: "$section.sectionName",
        incidentType: "$incident",
        description: "$description",
      }
    },

    { $sort: { date: -1 } },

    { $skip: skip },
    { $limit: limit },
  ];

  const data = await this.databaseService.repositories.reportModel.aggregate(pipeline);

  const totalCount = await this.databaseService.repositories.reportModel.countDocuments(match);

  return {
    message: "Reports fetched successfully",
    page,
    limit,
    totalCount,
    data,
  };
}


}













