import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class CertificateService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addCertificateTemplate(
  body: any,
  adminId: string,
) {

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


  const template =
    await this.databaseService.repositories.certificateTemplateModel.create({
      ...body,
      schoolId: school._id.toString(),
    });


  const cleanTemplate =
    await this.databaseService.repositories.certificateTemplateModel
      .findById(template._id)
      .select('-__v -createdAt -updatedAt');

  return {
    message: 'Certificate template added successfully',
    data: cleanTemplate,
  };
}


}
  