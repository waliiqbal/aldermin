import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateVisitorDto } from './dto/addVisitor.dto';

@Injectable()
export class VisitorService {
  constructor(private readonly databaseService: DatabaseService) {}
    
  async addVisitor(CreateVisitorDto: CreateVisitorDto, adminId: string) {
  const {
    name,
    phone,
    idCardNumber,
    noOfPersons,
    purpose,
    visitDate,
    timeIn,
    email,
    attachment,
    remarks,
  } = CreateVisitorDto;

  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const existingVisitor =
    await this.databaseService.repositories.visitorModel.findOne({
      phone,
      visitDate: new Date(visitDate),
      schoolId: school._id,
    });

  if (existingVisitor) {
    throw new BadRequestException(
      'Visitor already checked in for today',
    );
  }


  const newVisitor =
    await this.databaseService.repositories.visitorModel.create({
      name,
      phone,
      idCardNumber,
      noOfPersons,
      purpose,
      visitDate: new Date(visitDate),
      timeIn,
      email,
      attachment,
      remarks,
      schoolId: school._id.toString(),
    });

  const cleanVisitor =
    await this.databaseService.repositories.visitorModel
      .findById(newVisitor._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Visitor added successfully',
    data: cleanVisitor,
  };
}

async editVisitorByAdmin(
  adminId: string,
  visitorId: string,
  CreateVisitorDto: CreateVisitorDto,
) {
  const adminObjectId = new Types.ObjectId(adminId);



  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const schoolId = school._id.toString();

console.log ('Editing Visitor:', visitorId, 'for School:', schoolId);


  const visitor =
    await this.databaseService.repositories.visitorModel.findOne({
      _id: visitorId,
      schoolId,
    });

  if (!visitor) {
    throw new BadRequestException('Visitor not found');
  }


  const updatedVisitor =
    await this.databaseService.repositories.visitorModel.findByIdAndUpdate(
      visitorId,
      { $set: { ...CreateVisitorDto } },
      { new: true },
    ).select('-__v -createdAt -updatedAt');

  return {
    message: 'Visitor updated successfully',
    data: updatedVisitor,
  };
}

async getVisitorById(visitorId: string, adminId: string) {
  const visitorObjectId = new Types.ObjectId(visitorId);

  const adminObjectId = new Types.ObjectId(adminId);



  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const schoolId = school._id.toString();

  const visitor =
    await this.databaseService.repositories.visitorModel.findOne({
      _id: visitorObjectId,
      schoolId,
    }).select('-__v -createdAt -updatedAt');

  if (!visitor) {
    throw new NotFoundException('Visitor not found');
  }

  return {
    message: 'Visitor details fetched successfully',
    data: visitor,
  };
}

async getAllVisitorsByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  idCardNumber?: string,
  visitDate?: string,
) {
  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const schoolId = school._id;

 
  const filter: any = {
    schoolId,
  };

 
  if (idCardNumber) {
    filter.idCardNumber = idCardNumber.trim();
  }

  if (visitDate) {
    const start = new Date(visitDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(visitDate);
    end.setHours(23, 59, 59, 999);

    filter.visitDate = {
      $gte: start,
      $lte: end,
    };
  }


  const skip = (page - 1) * limit;

  const [visitors, total] = await Promise.all([
    this.databaseService.repositories.visitorModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v -updatedAt')
      .lean(),

    this.databaseService.repositories.visitorModel.countDocuments(filter),
  ]);

   return {
    message: 'Visitors fetched successfully',
    data: visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}





}

