import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OtpService } from 'src/otp/otp.service';


@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService
    , private readonly otpService: OtpService
  )
  
   {}


async addStudentWithParent(body: any, adminId: string) {
  const { studentInfo, parentInfo } = body;
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


  let parent = await this.databaseService.repositories.parentModel.findOne({
    $or: [
      { fatherEmail: parentInfo.fatherEmail },
      { motherEmail: parentInfo.motherEmail },
      { guardianEmail: parentInfo.guardianEmail }
    ]
  });

  if (!parent) {

    const parentRandomPassword = crypto.randomBytes(6).toString('hex');
    const parentHashedPassword = await bcrypt.hash(parentRandomPassword, 10);

    parent = await this.databaseService.repositories.parentModel.create({
      ...parentInfo,
      schoolId: schoolId,
      password: parentHashedPassword,
      isVerified: true,
    });


    await this.otpService.sendPassword(parentInfo.fatherEmail, parentRandomPassword);
  }

 
  const studentRandomPassword = crypto.randomBytes(6).toString('hex');
  const studentHashedPassword = await bcrypt.hash(studentRandomPassword, 10);

  const newStudent = await this.databaseService.repositories.studentModel.create({
    ...studentInfo,
    schoolId: schoolId,
    parentId: parent._id,
    password: studentHashedPassword,
    isVerified: true,
  });

  // Send password to student's email
  await this.otpService.sendPassword(studentInfo.email, studentRandomPassword);

  // ---------------- Clean response ----------------
  const cleanStudent = await this.databaseService.repositories.studentModel
    .findById(newStudent._id)
    .select('-__v -createdAt -updatedAt -password');

  const cleanParent = await this.databaseService.repositories.parentModel
    .findById(parent._id)
    .select('-__v -createdAt -updatedAt -password');

  return {
    message: 'Student and parent added successfully',
    data: {
      student: cleanStudent,
      parent: cleanParent
    },
  };
}





  async getStudentsByAdmin(adminId: string, query: any) {
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


    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 10);
    const skip = (page - 1) * limit;

   
    const match: any = {
    schoolId: school._id.toString(),
    status: 'active',
  };

    if (query.classId) match.classId = query.classId;
    if (query.sectionId) match.sectionId = query.sectionId;
    if (query.academicYear) match.academicYear = query.academicYear;


    const students = await this.databaseService.repositories.studentModel.aggregate([
      { $match: match },
      {
        $addFields: {
          parentObjectId: { $toObjectId: '$parentId' }
        }
      },
      {
        $lookup: {
          from: 'parents',
          localField: 'parentObjectId',
          foreignField: '_id',
          as: 'parent',
        },
      },
      { $unwind: { path: '$parent', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          student: {
            id: { $toString: '$_id' },
            schoolId: '$schoolId',
            classId: '$classId',
            sectionId: '$sectionId',
            academicYear: '$academicYear',
            admissionNo: '$admissionNo',
            firstName: '$firstName',
            lastName: '$lastName',
            dob: '$dob',
            gender: '$gender',
            email: '$email',
            phone: '$phone',
            status: '$status',
          },
          parent: {
            id: { $toString: '$parent._id' },
            fatherName: '$parent.fatherName',
            motherName: '$parent.motherName',
            guardianName: '$parent.guardianName',
            fatherEmail: '$parent.fatherEmail',
            motherEmail: '$parent.motherEmail',
            guardianEmail: '$parent.guardianEmail',
            phone: '$parent.fatherMobile',
          },
        },
      },
    ]);


    const total = await this.databaseService.repositories.studentModel.countDocuments(match);

    return {
      message: 'Students fetched successfully',
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


   async promoteStudent(
    adminId: string,
    studentId: string,
    newClassId: string,
    newSectionId: string,
    newRollNo: number,
    newAcademicYear: string,
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


    const student = await this.databaseService.repositories.studentModel.findOne({
  _id: studentId,
  status: 'active',
});

    if (!student) throw new UnauthorizedException('Student not found');

  
    student.previousYears.push({
      academicYear: student.academicYear,
      classId: student.classId,
      sectionId: student.sectionId,
      rollNo: student.rollNo,
 
    });


    student.classId = newClassId;
    student.sectionId = newSectionId;
    student.rollNo = newRollNo;
    student.academicYear = newAcademicYear; 


    await student.save();

     const cleanStudent = await this.databaseService.repositories.studentModel
    .findById(studentId)
    .select('-__v -createdAt -updatedAt');


  return {
    message: 'Student promoted successfully',
    data: {
      student: cleanStudent,
  
    },
  };
}


}
