import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DatabaseService } from  '../database/databaseservice'

@Injectable()
export class FeesTypeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addFeesType(adminId: string, body: { name: string; description?: string }) {
    const adminObjectId = new Types.ObjectId(adminId);


    const existingAdmin = await this.databaseService.repositories.adminModel.findById(adminObjectId);
    if (!existingAdmin) {
      throw new BadRequestException('Admin not found');
    }

    const existingFeesType = await this.databaseService.repositories.feestypeModel.findOne({
      name: body.name,
    });

    if (existingFeesType) {
      throw new BadRequestException('Fees type already exists');
    }

 
    const newFeesType = await this.databaseService.repositories.feestypeModel.create(body);


    const cleanFeesType = await this.databaseService.repositories.feestypeModel
      .findById(newFeesType._id)
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Fees type added successfully',
      data: cleanFeesType,
    };
  }
   async getAllFeesType() {
    const feesTypes = await this.databaseService.repositories.feestypeModel
      .find()
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Fees types fetched successfully',
      data: feesTypes,
    };
  }

    async createFees(adminId: string, body: any) {
    const adminObjectId = new Types.ObjectId(adminId);

  
    const existingAdmin = await this.databaseService.repositories.adminModel.findById(adminObjectId);
    if (!existingAdmin) {
      throw new BadRequestException('Admin not found');
    }


    const student = await this.databaseService.repositories.studentModel.findById(body.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }




    const items = body.items.map((item: any) => ({
      ...item,
    }));

   
    const totalAmount = items.reduce((acc: number, curr: any) => acc + curr.amount, 0);


    const newFees = await this.databaseService.repositories.feesModel.create({
      studentId: body.studentId,
      schoolId: body.schoolId,
      feesGroupId: body.feesGroupId,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
      month: body.month,
      items,
      totalAmount,
      paidAmount: 0,
      status: 'unpaid'
    });


    const cleanFees = await this.databaseService.repositories.feesModel
      .findById(newFees._id)
      .select('-__v -createdAt -updatedAt');

    return {
      message: 'Fees created successfully',
      data: cleanFees,
    };
  }

}


