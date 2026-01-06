import { BadRequestException, Injectable, NotFoundException,  } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class AdmissionQueryService {
  constructor(private readonly databaseService: DatabaseService) {}

async addAdmissionQuery(body: any, adminId: string) {
  const {
    classId,
    name,
    email,
    phone,
    adress,
    description,
    date,
    folloWDate,
    numberOfChild,
  } = body;

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


  const existingQuery =
    await this.databaseService.repositories.admissionQueryModel.findOne({
      email,
      phone,
      date: new Date(date),
      schoolId: school._id.toString(),
    });

  if (existingQuery) {
    throw new BadRequestException(
      'Admission query already exists for this date',
    );
  }

  const admissionQuery =
    await this.databaseService.repositories.admissionQueryModel.create({
      schoolId: school._id.toString(),
      classId,
      name,
      email,
      phone,
      adress,
      description,
      date,
      folloWDate,
      numberOfChild,
      status: 'pending',
    });

 
  return {
    message: 'Admission query added successfully',
    data: admissionQuery,
  };
}


async getAdmissionQueries(
  filters: { date?: string; classId?: string; status?: string },
  adminId: string,
  page: number,
  limit: number,
) {
  const { date, classId, status } = filters;

  const adminObjectId = new Types.ObjectId(adminId);

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const queryFilter: any = { schoolId: school._id.toString() };
  if (date) queryFilter.date = new Date(date);
  if (classId) queryFilter.classId = classId;
  if (status) queryFilter.status = status;


  const skip = (page - 1) * limit;

  const admissionQueries =
    await this.databaseService.repositories.admissionQueryModel
      .find(queryFilter)
      .skip(skip)
      .limit(limit);

  const total = await this.databaseService.repositories.admissionQueryModel.countDocuments(queryFilter);

  return {
    message: 'Admission queries fetched successfully',
    data: admissionQueries,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async editAdmissionQuery(id: string, body: any, adminId: string) {
  const adminObjectId = new Types.ObjectId(adminId);

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const allowedFields = [
    'classId',
    'name',
    'email',
    'phone',
    'adress',
    'description',
    'date',
    'folloWDate',
    'numberOfChild',
    'status'
  ];

  const filteredBody: any = {};
  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      filteredBody[field] = body[field];
    }
  });

  const updatedAdmissionQuery = await this.databaseService.repositories.admissionQueryModel.findOneAndUpdate(
    { _id: id, schoolId: school._id.toString() },
    { $set: filteredBody },         
    { new: true, select: '-__v -createdAt -updatedAt' } 
  );

  if (!updatedAdmissionQuery) {
    throw new NotFoundException('Admission query not found');
  }

  return {
    message: 'Admission query updated successfully',
    data: updatedAdmissionQuery,
  };
}

async deleteAdmissionQuery(id: string, adminId: string) {
  const adminObjectId = new Types.ObjectId(adminId);

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const deletedAdmissionQuery = await this.databaseService.repositories.admissionQueryModel.findOneAndDelete({
    _id: id,
    schoolId: school._id.toString(),
  });

  if (!deletedAdmissionQuery) {
    throw new NotFoundException('Admission query not found');
  }

  return {
    message: 'Admission query deleted successfully',
  };
}




}