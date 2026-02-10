import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';

@Injectable()
export class ClassService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addClass(body: any, adminId: string) {
  const { name, description, campusId: bodyCampusId } = body;

  const admin = await this.databaseService.repositories.adminModel.findById(adminId);
  if (!admin) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = admin.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School ID not found for this admin');
  }

  let finalCampusId: string;

 
  if (admin.role === 'campusAdmin' || admin.role === 'adminStaff') {
    if (!admin.campusId) {
      throw new BadRequestException('Campus not assigned to this admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'admin') {
    if (!bodyCampusId) {
      throw new BadRequestException('Campus ID is required for school admin');
    }

    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: bodyCampusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = bodyCampusId;
  }

  else {
    throw new NotFoundException('You are not allowed to add class');
  }


  const existingClass = await this.databaseService.repositories.classModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    schoolId,
    campusId: finalCampusId,
    isActive: true,
  });

  if (existingClass) {
    throw new BadRequestException('Class already exists for this campus');
  }

  const newClass = await this.databaseService.repositories.classModel.create({
    name,
    description,
    schoolId,
    campusId: finalCampusId,
  });

  const cleanClass = await this.databaseService.repositories.classModel
    .findById(newClass._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Class created successfully',
    data: cleanClass,
  };
}


  async getClassesByAdmin(adminId: string, campusId?: string) {
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
      throw new BadRequestException('Campus not assigned to campus admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'admin') {
    if (!campusId) {
      throw new BadRequestException('Campus ID is required');
    }


    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: campusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = campusId;
  }

  const classes = await this.databaseService.repositories.classModel.find({
    schoolId,
    campusId: finalCampusId,
    isActive: true,
  }).select('-__v -createdAt -updatedAt');

  return {
    message: 'Classes fetched successfully',
    data: classes,
  };
}

async editClass(classId: string, body: any, adminId: string) {
  const { name, description, campusId: bodyCampusId } = body;

  const admin = await this.databaseService.repositories.adminModel.findById(adminId);
  if (!admin) {
    throw new NotFoundException('Admin/Admin Staff not found');
  }

  const schoolId = admin.schoolId;
  if (!schoolId) {
    throw new BadRequestException('School not assigned to this admin');
  }

  let finalCampusId: string;


  if (admin.role === 'campusAdmin' || admin.role === 'adminStaff') {
    if (!admin.campusId) {
      throw new BadRequestException('Campus not assigned to this admin');
    }
    finalCampusId = admin.campusId;
  }


  else if (admin.role === 'schoolAdmin') {
    if (!bodyCampusId) {
      throw new BadRequestException('Campus ID is required for school admin');
    }

    const campus = await this.databaseService.repositories.campusModel.findOne({
      _id: bodyCampusId,
      schoolId: schoolId,
    });

    if (!campus) {
      throw new NotFoundException('Campus does not belong to this school');
    }

    finalCampusId = bodyCampusId;
  } else {
    throw new NotFoundException('You are not allowed to edit class');
  }

  
  const existingClass = await this.databaseService.repositories.classModel.findOne({
    _id: classId,
    schoolId,
    campusId: finalCampusId,
    isActive: true,
  });

  if (!existingClass) {
    throw new NotFoundException('Class not found for this campus');
  }

  // 🔁 Duplicate name check (optional but recommended)
  if (name) {
    const duplicate = await this.databaseService.repositories.classModel.findOne({
      _id: { $ne: classId },
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      schoolId,
      campusId: finalCampusId,
      isActive: true,
    });

    if (duplicate) {
      throw new BadRequestException('Another class with this name already exists');
    }
  }

  
  if (name !== undefined) existingClass.name = name;
  if (description !== undefined) existingClass.description = description;

  await existingClass.save();

  const cleanClass = await this.databaseService.repositories.classModel
    .findById(existingClass._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Class updated successfully',
    data: cleanClass,
  };
}




//   async getClassesByCampusAdmin(adminId: string) {
//   const adminObjectId = new Types.ObjectId(adminId);

//     const adminData = await this.databaseService.repositories.adminModel.findById(adminObjectId);


//     if (!adminData) {
//       throw new NotFoundException('Admin/Admin Staff not found');
//     }

//     const schoolId = adminData.schoolId;
//     if (!schoolId) {
//       throw new BadRequestException('School ID not found for this admin/admin_staff');
//     }
   
//     const school = await this.databaseService.repositories.schoolModel.findById(schoolId);


    
//     if (!school) {
//       throw new NotFoundException('School not found for this admin');
//     }

//  const campusId = adminData.campusId;

//  const campus = await this.databaseService.repositories.campusModel.findById(campusId);

//     if (!campus) {
//       throw new NotFoundException('Campus not found for this admin/admin_staff');
//     }
 
//   const classes = await this.databaseService.repositories.classModel
//     .find({ schoolId: schoolId, isActive: true, campusId: campusId })
    
//     .select('-__v -createdAt -updatedAt');

//   return {
//     message: 'Classes fetched successfully',
//     data: classes,
//   };
// }

// async getCampusClassesBySchoolAdmin(adminId: string, campusId: string) {
//   const adminObjectId = new Types.ObjectId(adminId);

 
//   const adminData =
//     await this.databaseService.repositories.adminModel.findById(adminObjectId);

//   if (!adminData) {
//     throw new NotFoundException('Admin/Admin Staff not found');
//   }


//   const campus =
//     await this.databaseService.repositories.schoolModel.findById(campusId);

//   if (!campus) {
//     throw new NotFoundException('Campus not found');
//   }

//   const schoolId = adminData.schoolId;
//   if (!schoolId) {
//     throw new BadRequestException('School ID not found for this admin/admin_staff');
//   } 

//   const school = await this.databaseService.repositories.schoolModel.findById(schoolId);

//   if (!school) {
//     throw new NotFoundException('School not found for this admin');
//   } 

//   const classes =
//     await this.databaseService.repositories.classModel
//       .find({
//         schoolId: schoolId,
//         campusId: campusId,
//         isActive: true,
//       })
//       .select('-__v -createdAt -updatedAt');

//   return {
//     message: 'Campus classes fetched successfully',
//     data: classes,
//   };
// }




}


