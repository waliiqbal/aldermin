import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OtpService } from 'src/otp/otp.service';
import { UpdateStudentDto } from './dto/addStudentHimself.dto';
import { Campus } from 'src/Admin/campus.schema';


@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService
    , private readonly otpService: OtpService
  )
  
   {}


async addStudentWithParent(body: any, adminId: string) {
  const { studentInfo, parentInfo, campusId } = body;
const admin = await this.databaseService.repositories.adminModel.findById(adminId);
 if (!admin) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = admin.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School not assigned');
  }

  let finalCampusId: string;

  
  if (admin.role === 'campusAdmin' || admin.role === 'adminStaff') {
    if (!admin.campusId) {
      throw new BadRequestException('Campus not assigned to this admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'admin') {
    if (!campusId) {
      throw new BadRequestException('Campus ID is required for school admin');
    }

    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: campusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = campusId;
  } else {
    throw new NotFoundException('You are not allowed to add student');
  }


  let parent = await this.databaseService.repositories.parentModel.findOne({

       email: parentInfo.email ,
     
  });

  if (!parent) {

    const parentRandomPassword = crypto.randomBytes(6).toString('hex');
    const parentHashedPassword = await bcrypt.hash(parentRandomPassword, 10);

    parent = await this.databaseService.repositories.parentModel.create({
      ...parentInfo,
      schoolId: schoolId,
      campusId: finalCampusId,
      password: parentHashedPassword,
      isVerified: true,
      
    });


    await this.otpService.sendPassword(parentInfo.email, parentRandomPassword);
  }

 
  const studentRandomPassword = crypto.randomBytes(6).toString('hex');
  const studentHashedPassword = await bcrypt.hash(studentRandomPassword, 10);

  const newStudent = await this.databaseService.repositories.studentModel.create({
    ...studentInfo,
    schoolId: schoolId,
    parentId: parent._id,
    campusId: finalCampusId,
    password: studentHashedPassword,
    isVerified: true,
  });

  
  await this.otpService.sendPassword(studentInfo.email, studentRandomPassword);

  
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



async addStudentDetailsBySelf(studentBody: UpdateStudentDto, studentId: string) {
  const {  parentEmail, ...details } = studentBody;

  const student = await this.databaseService.repositories.studentModel.findOne({
    _id: studentId,
    status: 'active',
  });
  if (parentEmail) {
    const parent = await this.databaseService.repositories.parentModel.findOne({ fatherEmail: parentEmail });
    if (!parent) {
      throw new NotFoundException('Parent not found with this email');
    }
    student.parentId = parent._id.toString();
  }


  for (const key in details) {
    if (details[key] !== undefined && key !== 'parentId') {
      student[key] = details[key];
    }
  }

  
  await student.save();

  
  const cleanStudent = await this.databaseService.repositories.studentModel
    .findById(student._id)
    .select('-password -__v -createdAt -updatedAt');

  return {
    message: 'Student details updated successfully',
    data: cleanStudent,
  };
}

async getStudentBySelf(studentId: string) {

  const student = await this.databaseService.repositories.studentModel
    .findById(studentId)
    .select('-password -__v -createdAt -updatedAt');

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  return {
    message: 'Student fetched successfully',
    data: student,
  };
}


 async addParentDetailsBySelf(body: any, parentId: string) {

  console.log('Received body:', body);

  const parent = await this.databaseService.repositories.parentModel.findOne({
    _id: parentId,
    status: 'active',
  });

  if (!parent) {
    throw new Error('Parent not found');
  }

  for (const key in body) {
    if (body[key] !== undefined) {
      parent[key] = body[key];
    }
  }

  await parent.save();

  const cleanParent = await this.databaseService.repositories.parentModel
    .findById(parent._id)
    .select('-password -__v -createdAt -updatedAt');

  return {
    message: 'Parent details updated successfully',
    data: cleanParent,
  };
}

async getParentBySelf(parentId: string) {

  const parent = await this.databaseService.repositories.parentModel
    .findById(parentId)
    .select('-password -__v -createdAt -updatedAt');

  if (!parent) {
    throw new NotFoundException('Parent not found');
  }

  return {
    message: 'Parent fetched successfully',
    data: parent,
  };
}






  async getStudentsByAdmin(adminId: string, query: any) {
   const admin = await this.databaseService.repositories.adminModel.findById(adminId);
 if (!admin) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = admin.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School not assigned');
  }

  let finalCampusId: string;

  
  if (admin.role === 'campusAdmin' || admin.role === 'adminStaff') {
    if (!admin.campusId) {
      throw new BadRequestException('Campus not assigned to this admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'admin') {
    if (!query.campusId) {
      throw new BadRequestException('Campus ID is required for school admin');
    }

    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: query.campusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = query.campusId;
  } else {
    throw new NotFoundException('You are not allowed to edit section');
  }

    


    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 10);
    const skip = (page - 1) * limit;

   
    const match: any = {
    schoolId: schoolId,
    CampusId: finalCampusId,
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
            name: '$name',
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
    campusId?: string,
  ) {
    const admin = await this.databaseService.repositories.adminModel.findById(adminId);
 if (!admin) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = admin.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School not assigned');
  }

  let finalCampusId: string;

  
  if (admin.role === 'campusAdmin' || admin.role === 'adminStaff') {
    if (!admin.campusId) {
      throw new BadRequestException('Campus not assigned to this admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'admin') {
    if (!campusId) {
      throw new BadRequestException('Campus ID is required for school admin');
    }

    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: campusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = campusId;
  } else {
    throw new NotFoundException('You are not allowed to add student');
  }


    const student = await this.databaseService.repositories.studentModel.findOne({
  _id: studentId,
  status: 'active',
  schoolId: schoolId,
  campusId: finalCampusId,
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
