import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService) {}


async addStudentWithParent(body: any, adminId: string) {
  const { studentInfo, parentInfo } = body;
  const adminObjectId = new Types.ObjectId(adminId);


  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });
  if (!school) throw new NotFoundException('School not found for this admin');

 
  let parent = await this.databaseService.repositories.parentModel.findOne({
    $or: [
      { fatherEmail: parentInfo.fatherEmail },
      { motherEmail: parentInfo.motherEmail },
      { guardianEmail: parentInfo.guardianEmail }
    ]
  });

  if (!parent) {
 
    parent = await this.databaseService.repositories.parentModel.create({
      ...parentInfo,
      schoolId: school._id,
    });
  }


  const newStudent = await this.databaseService.repositories.studentModel.create({
    ...studentInfo,
    schoolId: school._id,
    parentId: parent._id,
  });


  const cleanStudent = await this.databaseService.repositories.studentModel
    .findById(newStudent._id)
    .select('-__v -createdAt -updatedAt');

  const cleanParent = await this.databaseService.repositories.parentModel
    .findById(parent._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Student added successfully',
    data: {
      student: cleanStudent,
      parent: cleanParent
    },
  };
}




  async getStudentsByAdmin(adminId: string, query: any) {
    const adminObjectId = new Types.ObjectId(adminId);


    const school = await this.databaseService.repositories.schoolModel.findOne({
      admin: adminObjectId,
    });
    if (!school) throw new UnauthorizedException('School not found');


    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 10);
    const skip = (page - 1) * limit;

   
    const match: any = { schoolId: school._id.toString() };
    if (query.classId) match.classId = query.classId;
    if (query.sectionId) match.sectionId = query.sectionId;


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

   
    const school = await this.databaseService.repositories.schoolModel.findOne({
      admin: adminObjectId,
    });

    if (!school) throw new UnauthorizedException('School not found');

   
    const student = await this.databaseService.repositories.studentModel.findById(studentId);
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
