import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { CreateIdCardTemplateDto } from './dto/createIDCard.dto';


@Injectable()
export class IDCardService {
  constructor(private readonly databaseService: DatabaseService) {}

async addIdCardTemplate(
  createIdCardTemplateDto: CreateIdCardTemplateDto,
  adminId: string,
) {

  // 1️⃣ Admin se school nikaalo
  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: new Types.ObjectId(adminId),
    });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  // 2️⃣ ID Card Template create karo
  const template =
    await this.databaseService.repositories.idCardTemplateModel.create({
      ...createIdCardTemplateDto,
      schoolId: school._id.toString(),
    });

  // 3️⃣ Clean response (extra fields hata do)
  const cleanTemplate =
    await this.databaseService.repositories.idCardTemplateModel
      .findById(template._id)
      .select('-__v -createdAt -updatedAt');


  return {
    message: 'ID card template added successfully',
    data: cleanTemplate,
  };
}

async getAllIdCardTemplatesByAdmin(adminId: string) {

  // 1️⃣ Admin se school nikaalo
  const school =
    await this.databaseService.repositories.schoolModel.findOne({
      admin: new Types.ObjectId(adminId),
    });

  if (!school) {
    throw new NotFoundException('School not found for this admin');
  }

  // 2️⃣ Sab templates lao (no pagination)
  const templates =
    await this.databaseService.repositories.idCardTemplateModel
      .find({ schoolId: school._id.toString() })
      .sort({ createdAt: -1 })
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'ID card templates fetched successfully',
    data: templates,
  };
}



}