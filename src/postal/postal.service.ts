import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

import { CreatePostalDto } from 'src/postal/dto/addPostal.dto';

@Injectable()
export class PostalService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addPostal(createPostalDto: CreatePostalDto, adminId: string) {
  const {
    type,
    title,
    referenceNo,
    fromTitle,
    toTitle,
    address,
    note,
    date,
    attachment,
  
  } = createPostalDto;

  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const existingPostal =
    await this.databaseService.repositories.postalModel.findOne({
      referenceNo,
      date: new Date(date),
      schoolId: school._id,
      type,
    });

  if (existingPostal) {
    throw new BadRequestException(
      'Postal record already exists for this reference and date',
    );
  }

  const newPostal =
    await this.databaseService.repositories.postalModel.create({
      type,
      title,
      referenceNo,
      fromTitle,
      toTitle,
      address,
      note,
      date: new Date(date),
      attachment,
      schoolId: school._id.toString(),
    });


  const cleanPostal =
    await this.databaseService.repositories.postalModel
      .findById(newPostal._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message:
      type === 'DISPATCH'
        ? 'Postal dispatched successfully'
        : 'Postal received successfully',
    data: cleanPostal,
  };
}

async getAllPostalsByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  type?: string,    
  status?: string, 
  date?: string,
) {
 
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new Types.ObjectId(adminId),
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const matchFilter: any = {
    schoolId: school._id.toString(),
  };

  if (type) matchFilter.type = type;
  if (status) matchFilter.status = status;
  if (date) matchFilter.date = new Date(date);

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
    await this.databaseService.repositories.postalModel.aggregate(pipeline);

  const totalCount =
    await this.databaseService.repositories.postalModel.countDocuments(
      matchFilter,
    );

  return {
    message: 'Postal records fetched successfully',
    page,
    limit,
    totalCount,
    data,
  };
}

async getPostalById(
  adminId: string,
  postalId: string,
) {
  const adminObjectId = new Types.ObjectId(adminId);
  const postalObjectId = new Types.ObjectId(postalId);


  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: adminObjectId,
    });

  if (!school) {
    throw new BadRequestException('School not found for this admin');
  }

  const postal =
    await this.databaseService.repositories.postalModel
      .findOne({
        _id: postalObjectId,
        schoolId: school._id.toString(),
      })
      .select('-__v -createdAt -updatedAt');

  if (!postal) {
    throw new BadRequestException('Postal record not found');
  }

  return {
    message: 'Postal record fetched successfully',
    data: postal,
  };
}

async editPostalByAdmin(
  adminId: string,
  postalId: string,
  updatePostalDto: CreatePostalDto,
) {
  const adminObjectId = new Types.ObjectId(adminId);

 
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  const schoolId = school._id.toString();

  console.log('Editing Postal:', postalId, 'for School:', schoolId);

  const postal =
    await this.databaseService.repositories.postalModel.findOne({
      _id: postalId,
      schoolId,
    });

  if (!postal) {
    throw new BadRequestException('Postal record not found');
  }


  const updatedPostal =
    await this.databaseService.repositories.postalModel
      .findByIdAndUpdate(
        postalId,
        { $set: { ...updatePostalDto } },
        { new: true },
      )
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Postal record updated successfully',
    data: updatedPostal,
  };
}




}