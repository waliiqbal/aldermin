import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateComplaintDto } from './dto/addComplain.dto';

@Injectable()
export class ComplainService {
  constructor(private readonly databaseService: DatabaseService) {}
     
 async addComplaint(
  createComplaintDto: CreateComplaintDto,
  userId: string,
  userType: string,

  
) {
  const {
    complaintBy,
    complaintType,
    phone,
    date,
    actionTaken,
    assigned,
    description,
    file,
  } = createComplaintDto;

  console.log (userId, userType);

  const userObjectId = new Types.ObjectId(userId);

  let schoolId: string | null = null;

  
  if (userType === 'parent') {
    const parent =
      await this.databaseService.repositories.parentModel.findOne({
        _id: userObjectId,
        status: 'active',
      });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    schoolId = parent.schoolId;
    if (!schoolId) {
      throw new NotFoundException('School not found for this parent');
    }   
  }

  if (userType === 'teacher') {
    const teacher =
      await this.databaseService.repositories.teacherModel.findOne({
        _id: userObjectId,
        status: 'active',
      });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }


console.log('Teacher Details:', teacher);


const name = (teacher as any).name;
 console.log('Teacher Name:', name);

 schoolId = teacher.schoolId;

    console.log('Teacher School ID:', schoolId);

    schoolId = teacher.schoolId;
    if (!schoolId) {
      throw new NotFoundException('School not found for this teacher');
    }
  }


 
  const existingComplaint =
    await this.databaseService.repositories.complainModel.findOne({
      schoolId,
      complaintType,
      complaintBy,
      date,
      status: 'pending',
    });

  if (existingComplaint) {
    throw new BadRequestException('Complaint already exists');
  }


  const newComplaint =
    await this.databaseService.repositories.complainModel.create({
      schoolId,
      complaintBy: userId,
      complaintType,
      Source: userType, 
      phone,
      date,
      actionTaken,
      assigned,
      description,
      file,
      status: 'pending',
    });

  const cleanComplaint =
    await this.databaseService.repositories.complainModel
      .findById(newComplaint._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Complaint added successfully',
    data: cleanComplaint,
  };
}

async editComplaint(
  userId: string,
  userType: string,
  complaintId: string,
  updateComplaintDto: any,
) {
  const userObjectId = new Types.ObjectId(userId);

  let schoolId: string | null = null;

 
  if (userType === 'parent') {
    const parent =
      await this.databaseService.repositories.parentModel.findById(userObjectId);

    if (!parent) {
      throw new BadRequestException('Parent not found');
    }

    schoolId = parent.schoolId;

    if (!schoolId) {
      throw new BadRequestException('School not found for this parent');
    }   
  }

  if (userType === 'teacher') {
    const teacher =
      await this.databaseService.repositories.teacherModel.findById(userObjectId);

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

   

    schoolId = teacher.schoolId;

    if (!schoolId) {
      throw new BadRequestException('School not found for this teacher');
    }
  }

 
  
  const complaint =
    await this.databaseService.repositories.complainModel.findOne({
      _id: complaintId,
      schoolId,
    });

  if (!complaint) {
    throw new BadRequestException('Complaint not found');
  }

  
  const updatedComplaint =
    await this.databaseService.repositories.complainModel.findByIdAndUpdate(
      complaintId,
      { $set: { ...updateComplaintDto } },
      { new: true },
    );

  return {
    message: 'Complaint updated successfully',
    data: updatedComplaint,
  };
}

async getComplaintById(
  userId: string,
  userType: string,
  complaintId: string,
) {
  const userObjectId = new Types.ObjectId(userId);
  const complaintObjectId = new Types.ObjectId(complaintId);

  let schoolId: string | null = null;


  if (userType === 'parent') {
    const parent =
      await this.databaseService.repositories.parentModel.findById(userObjectId);

    if (!parent) {
      throw new BadRequestException('Parent not found');
    }

    schoolId = parent.schoolId;
    if (!schoolId) {
      throw new BadRequestException('School not found for this parent');
    }
  }

  if (userType === 'teacher') {
    const teacher =
      await this.databaseService.repositories.teacherModel.findById(userObjectId);

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }


    schoolId = teacher.schoolId;

    if (!schoolId) {
      throw new BadRequestException('School not found for this teacher');
    }   
  }




  const complaint =
    await this.databaseService.repositories.complainModel
      .findOne({
        _id: complaintObjectId,
        schoolId,

      })
      .select('-__v -createdAt -updatedAt');

  if (!complaint) {
    throw new BadRequestException('Complaint not found');
  }

  return {
    message: 'Complaint fetched successfully',
    data: complaint,
  };
}

async getAllComplaintsByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  source?: string,
  status?: string,
  date?: string,
) {

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new Types.ObjectId(adminId),
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  // 🔹 Step 2: Match filter
  const matchFilter: any = {
    schoolId: school._id.toString(),
  };

  if (source) matchFilter.Source = source;     // parent | teacher
  if (status) matchFilter.status = status;
  if (date) matchFilter.date = new Date(date);

  const skip = (page - 1) * limit;

  // 🔹 Step 3: Aggregation pipeline
  const pipeline: any[] = [
    { $match: matchFilter },

    // 👇 convert complaintBy to ObjectId
    {
      $addFields: {
        complaintByObjectId: { $toObjectId: '$complaintBy' },
      },
    },

    // 🔹 Lookup Parent
    {
      $lookup: {
        from: 'parents',
        localField: 'complaintByObjectId',
        foreignField: '_id',
        as: 'parent',
      },
    },

    // 🔹 Lookup Teacher
    {
      $lookup: {
        from: 'teachers',
        localField: 'complaintByObjectId',
        foreignField: '_id',
        as: 'teacher',
      },
    },

  
    {
      $addFields: {
        complainByName: {
          $cond: [
            { $eq: ['$Source', 'parent'] },
            { $arrayElemAt: ['$parent.name', 0] },
            { $arrayElemAt: ['$teacher.name', 0] },
          ],
        },
      },
    },

    // 🔹 Cleanup
    {
      $project: {
        parent: 0,
        teacher: 0,
        complaintByObjectId: 0,
        __v: 0,
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.complainModel.aggregate(pipeline);

  const totalCount =
    await this.databaseService.repositories.complainModel.countDocuments(
      matchFilter,
    );

  return {
    message: 'Complaints fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}



}