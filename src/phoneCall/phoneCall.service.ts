import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreatePhoneCallDto } from './dto/addPhoneCall.dto';

import { CreatePostalDto } from 'src/postal/dto/addPostal.dto';

@Injectable()
export class PhoneCallService {
  constructor(private readonly databaseService: DatabaseService) {}
async addPhoneCall(
  createPhoneCallDto: CreatePhoneCallDto,
  adminId: string,
) {

  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: new Types.ObjectId(adminId),
    });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const phoneCall =
    await this.databaseService.repositories.phoneCallModel.create({
      ...createPhoneCallDto,
      schoolId: school._id.toString(),
    });

  const cleanPhoneCall =
    await this.databaseService.repositories.phoneCallModel
      .findById(phoneCall._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Phone call log added successfully',
    data: cleanPhoneCall,
  };
}

async getAllPhoneCallsByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  callType?: string, 
  date?: string,
) {

  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: new Types.ObjectId(adminId),
    });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const schoolId = school._id.toString();


  const matchFilter: any = {
    schoolId,
  };

  if (callType) {
    matchFilter.callType = callType;
  }

  if (date) {
    matchFilter.date = new Date(date);
  }

  const skip = (page - 1) * limit;


  const pipeline: any[] = [
    { $match: matchFilter },
    {
      $project: {
        __v: 0,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data =
    await this.databaseService.repositories.phoneCallModel.aggregate(
      pipeline,
    );

  const totalCount =
    await this.databaseService.repositories.phoneCallModel.countDocuments(
      matchFilter,
    );

  return {
    message: 'Phone call logs fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}



}

