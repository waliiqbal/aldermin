import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DatabaseService } from  '../database/databaseservice'
import { CreateFeesDto } from './createfees.dto';
import { start } from 'repl';

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


  const isTuition = /tuition/i.test(body.name); // case-insensitive check

 
  const newFeesType = await this.databaseService.repositories.feestypeModel.create({
    ...body,
    isTuition: isTuition,
  });

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

async createFees(
  adminId: string,
  body: CreateFeesDto & { testingDate?: string }
) {


const getPreviousMonth = (currentMonth: string): string | null => {
  // "February-2026"
  const [monthName, yearStr] = currentMonth.split('-');
  const year = Number(yearStr);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const index = months.indexOf(monthName);
  if (index === -1) return null;

  // January ka previous → December last year
  if (index === 0) {
    return `December-${year - 1}`;
  }

  return `${months[index - 1]}-${year}`;
};


  
  if (!body.studentId) {
    throw new BadRequestException('studentId is required');
  }

  if (!body.dueDate) {
    throw new BadRequestException('dueDate is required');
  }

  if (!body.items || body.items.length === 0) {
    throw new BadRequestException('Fees items are required');
  }

  const adminObjectId = new Types.ObjectId(adminId);
  const today = body.testingDate ? new Date(body.testingDate) : new Date();

 
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }


  const student =
    await this.databaseService.repositories.studentModel.findById(
      body.studentId,
    );

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  
  const feeTypes =
    await this.databaseService.repositories.feestypeModel.find({});
  const feesTypeMap = new Map<string, any>();
  feeTypes.forEach(f => feesTypeMap.set(f._id.toString(), f));

  
  const previousMonth = getPreviousMonth(body.month);
  let previousMonthFee = null;

  if (previousMonth) {
    previousMonthFee =
      await this.databaseService.repositories.feesModel.findOne({
        studentId: body.studentId,
        month: previousMonth,
        status: 'unpaid',
      });
  }


  let lateFee = 0;

  if (previousMonthFee && previousMonthFee.dueDate < today) {
    for (const item of previousMonthFee.items) {
      const feeType = feesTypeMap.get(item.feesTypeId.toString());

      if (feeType?.isTuition) {
        lateFee += Number(item.amount) * 0.10; 
      }
    }
  }

 
  const itemsTotal = body.items.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const totalAmount = itemsTotal + lateFee;


  const fees =
    await this.databaseService.repositories.feesModel.create({
      studentId: body.studentId,
      schoolId: school._id.toString(),
      feesGroupId: body.feesGroupId ?? null,
      classId: student.classId,
      sectionId: student.sectionId,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
      month: body.month,
      items: body.items,
      lateFee,        
      totalAmount,
      status: 'unpaid',
    });

  
  const previousUnpaidFees =
    await this.databaseService.repositories.feesModel.find({
      studentId: body.studentId,
      status: 'unpaid',
      _id: { $ne: fees._id },
    });

  const carryForward = previousUnpaidFees.reduce(
    (sum, fee) => sum + fee.totalAmount,
    0,
  );

  // ---------- Clean Response ----------
  const cleanFees =
    await this.databaseService.repositories.feesModel
      .findById(fees._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Fees created successfully',
    data: {
      cleanFees,
      carryForward,
      lateFeeAppliedForMonth: previousMonth,
      currentMonthTotalAmount: totalAmount,
    },
  };
}


async getFeesInvoice(adminId: string, query: any) {
 
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new Types.ObjectId(adminId),
  });
  if (!school) throw new NotFoundException('School not found for this admin');


  let dateFilter: any = {};
  if (query.month) {
    const [monthName, yearStr] = query.month.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));

    dateFilter.issueDate = { $gte: start, $lt: end };
  }


  const matchFilter: any = { schoolId: school._id.toString(), ...dateFilter };
  if (query.classId) matchFilter.classId = query.classId;
  if (query.sectionId) matchFilter.sectionId = query.sectionId;

 
  const feesData = await this.databaseService.repositories.feesModel.aggregate([
    { $match: matchFilter },

    { $addFields: { 
        studentObjectId: { $toObjectId: "$studentId" },
        classObjectId: { $toObjectId: "$classId" },
        sectionObjectId: { $toObjectId: "$sectionId" }
    } },

   
    {
      $lookup: {
        from: 'students',
        localField: 'studentObjectId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },

  
    {
      $lookup: {
        from: 'classes',
        localField: 'classObjectId',
        foreignField: '_id',
        as: 'class'
      }
    },
    { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },

 
    {
      $lookup: {
        from: 'sections',
        localField: 'sectionObjectId',
        foreignField: '_id',
        as: 'section'
      }
    },
    { $unwind: { path: '$section', preserveNullAndEmptyArrays: true } },

   
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'feestypes',
        localField: 'items.feesTypeId',
        foreignField: '_id',
        as: 'feeType'
      }
    },
    { $unwind: { path: '$feeType', preserveNullAndEmptyArrays: true } },

    { $addFields: { 'items.feeTypeName': '$feeType.name' } },

  
    {
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        studentName: { $first: '$student.firstName' },
        className: { $first: '$class.name' },       
        sectionName: { $first: '$section.name' }, 
        issueDate: { $first: '$issueDate' },
        totalAmount: { $first: '$totalAmount' },
        paidAmount: { $first: '$paidAmount' },
        lateFee: { $first: '$lateFee' },
        status: { $first: '$status' },
        items: { $push: '$items' }
      }
    }
  ]);

  return {
    message: 'Fees invoice fetched successfully',
    data: feesData,
  };
}



async payFees(
  adminId: string,
  body: {
    studentId: string;
    month: string; 
    paidAmount: number;
  },
) {
  const { studentId, month, paidAmount } = body;

  if (!studentId || !month || paidAmount <= 0) {
    throw new BadRequestException('Invalid payment data');
  }

  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: new Types.ObjectId(adminId),
  });

  if (!school) {
    throw new NotFoundException('School not found');
  }


  const [monthName, yearStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1));

 
  let unpaidFees = await this.databaseService.repositories.feesModel
    .find({
      studentId,
      schoolId: school._id.toString(),
      status: 'unpaid',
      issueDate: { $lt: endDate },
    })
    .sort({ issueDate: 1 });

  if (!unpaidFees.length) {
    throw new NotFoundException('No unpaid fees found');
  }

  let remaining = paidAmount;
  const breakdown = [];

  for (const fee of unpaidFees) {
    const monthDue = fee.totalAmount - fee.paidAmount;

    if (remaining < monthDue) {
   
      throw new BadRequestException(
        `Payment insufficient for month ${fee.month}. Full month payment required: ${monthDue}`
      );
    }


    fee.paidAmount = Math.round(fee.totalAmount);
    fee.status = 'paid';
    remaining -= monthDue;

    await fee.save();

    breakdown.push({
      month: fee.month,
      principal: fee.totalAmount - (fee.lateFee || 0),
      lateFee: fee.lateFee || 0,
      paid: monthDue,
      status: 'paid',
    });

    if (remaining === 0) break;
  }

  // Agar extra money bacha
  if (remaining > 0) {
    throw new BadRequestException(
      `Extra payment detected: ${remaining}. Pay exact multiples of full months only.`
    );
  }

  return {
    message: 'Payment successful',
    data: {
      totalPaid: paidAmount - remaining,
      breakdown,
    },
  };
}




}
