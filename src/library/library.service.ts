import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { AddBookDto } from './dto/addBook.dto';
import { first } from 'rxjs';

@Injectable()
export class LibraryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addBook(body: AddBookDto, adminId: string) {

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


  const newBook = await this.databaseService.repositories.bookModel.create(body);


  let library = await this.databaseService.repositories.libraryModel.findOne({
    schoolId: school._id,
  });


  if (!library) {
    library = await this.databaseService.repositories.libraryModel.create({
      schoolId: school._id,
      books: [],
      members: [],
    });
  }


  library.books.push(newBook._id.toString());
  await library.save();


  const cleanBook = await this.databaseService.repositories.bookModel
    .findById(newBook._id)
    .select('-__v -createdAt -updatedAt');

  return {
    message: 'Book added successfully',
    data: cleanBook,
  };
}


async addMember(body: any, adminId: string) {
  const { memberId, memberType } = body;

  if (!memberId || !memberType) {
    throw new BadRequestException('memberId and memberType are required');
  }

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


  let library = await this.databaseService.repositories.libraryModel.findOne({
    schoolId: school._id.toString(),
  });

  if (!library) {
    library = await this.databaseService.repositories.libraryModel.create({
      schoolId: school._id.toString(),
      books: [],
      members: [],
    });
  }

  const alreadyExists = library.members.some(
    (m) =>
      m.memberId.toString() === memberId &&
      m.memberType === memberType
  );

  if (alreadyExists) {
    throw new BadRequestException('Member already exists in library');
  }


  library.members.push({
    memberId: memberId,
    memberType,
  });

  await library.save();

  return {
    message: 'Member added successfully',
    data: {
      memberId,
      memberType,
    },
  };
}

async getBooks(
  adminId: string,
  page = 1,
  limit = 10,
  category?: string,
  search?: string,
) {
  const skip = (page - 1) * limit;

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



  const filter: any = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }


  const books = await this.databaseService.repositories.bookModel
    .find(filter)
    .skip(skip)
    .limit(limit);


  const total = await this.databaseService.repositories.bookModel.countDocuments(filter);

  const mappedBooks = books.map((book) => ({
    authorName: book.authorName,
    bookTitle: book.title,
    category: book.category,
    isbn: book.isbn,
    publisherName: book.publisherName,
    quantity: book.Quantity,
    price: book.bookPrice,
  }));

  
  return {
    message: 'Books fetched successfully',
    data: mappedBooks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async getLibraryMembersByAdmin(
  adminId: string,
  page = 1,
  limit = 10,
  memberType?: string, 
) {
  const skip = (page - 1) * limit;
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


  const matchStage: any = { schoolId: schoolId };
  if (memberType) {
    matchStage['members.memberType'] = memberType; 
  }

  const members = await this.databaseService.repositories.libraryModel.aggregate([
    { $match: matchStage },
    { $unwind: '$members' },

    
    {
      $lookup: {
        from: 'students',
        let: { memberId: '$members.memberId', memberType: '$members.memberType' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$$memberType', 'student'] },
                  { $eq: ['$_id', '$$memberId'] },
                ],
              },
            },
          },
          { $project: { firstName: 1,  email: 1, phone: 1, _id: 0 } },
        ],
        as: 'studentInfo',
      },
    },


    {
      $lookup: {
        from: 'teachers',
        let: { memberId: '$members.memberId', memberType: '$members.memberType' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$$memberType', 'teacher'] },
                  { $eq: ['$_id', '$$memberId'] },
                ],
              },
            },
          },
          { $project: { name: 1, email: 1, phone: 1, _id: 0 } },
        ],
        as: 'teacherInfo',
      },
    },


    {
      $addFields: {
        memberData: {
          $cond: [
            { $eq: ['$members.memberType', 'student'] },
            { $arrayElemAt: ['$studentInfo', 0] },
            { $arrayElemAt: ['$teacherInfo', 0] },
          ],
        },
      },
    },

    {
      $project: {
    memberType: '$members.memberType',
    name: { $ifNull: ['$memberData.firstName', '$memberData.name'] },
    email: '$memberData.email',
    phone: '$memberData.phone',
  },
    },

    { $skip: skip },
    { $limit: limit },
  ]);


  const totalResult = await this.databaseService.repositories.libraryModel.aggregate([
    { $match: matchStage },
    { $project: { count: { $size: '$members' } } },
  ]);
  const total = totalResult[0]?.count || 0;

  return {
    message: 'Library members fetched successfully',
    data: members,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async issueBookByAdmin(
  adminId: string,
  body: { memberId: string; bookId: string; memberType: string },
) {
  const { memberId, bookId, memberType } = body;

 
  if (!memberId || !bookId || !memberType) {
    throw new BadRequestException('memberId, bookId, and memberType are required');
  }


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


 
  const newIssuance = await this.databaseService.repositories.issuanceModel.create({
    memberId,
    bookId,
    memberType,
    issueDate: new Date(),
    isReturned: false,
  });


const book = await this.databaseService.repositories.bookModel.findById(bookId);
if (!book || book.Quantity <= 0) {
  throw new BadRequestException('Book not available');
}
await this.databaseService.repositories.bookModel.findByIdAndUpdate(bookId, {
  $inc: { Quantity: -1 },
});


  return {
    message: 'Book issued successfully',
    data: newIssuance,
  };
}

async getAllIssuedBooks(adminId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
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



  const issuedBooks = await this.databaseService.repositories.issuanceModel.aggregate([
    { $match: { isReturned: false } },

    {
      $lookup: {
        from: 'books',
        let: { bookIdStr: '$bookId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$bookIdStr' }] } } }
        ],
        as: 'bookInfo'
      }
    },
    { $unwind: '$bookInfo' },


    {
      $lookup: {
        from: 'students',
        let: { memberIdStr: '$memberId', memberType: '$memberType' },
        pipeline: [
          { $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$_id', { $toObjectId: '$$memberIdStr' }] },
                  { $eq: ['$$memberType', 'student'] }
                ]
              } 
          }},
          { $project: { firstName: 1, _id: 0 } }
        ],
        as: 'studentInfo'
      }
    },


    {
      $lookup: {
        from: 'teachers',
        let: { memberIdStr: '$memberId', memberType: '$memberType' },
        pipeline: [
          { $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$_id', { $toObjectId: '$$memberIdStr' }] },
                  { $eq: ['$$memberType', 'teacher'] }
                ]
              } 
          }},
          { $project: { name: 1, _id: 0 } }
        ],
        as: 'teacherInfo'
      }
    },


    {
      $addFields: {
        memberData: {
          $ifNull: [
            { $arrayElemAt: ['$studentInfo', 0] },
            { $arrayElemAt: ['$teacherInfo', 0] }
          ]
        }
      }
    },

    {
      $project: {
        memberType: 1,
        memberName: { $ifNull: ['$memberData.firstName', '$memberData.name'] },
        bookTitle: '$bookInfo.title',
        authorName: '$bookInfo.authorName',
        isbn: '$bookInfo.isbn',
        publisherName: '$bookInfo.publisherName',
        price: '$bookInfo.bookPrice',
        quantity: '$bookInfo.Quantity',
        issueDate: 1,
      }
    },

    { $skip: skip },
    { $limit: limit }
  ]);


  const total = await this.databaseService.repositories.issuanceModel.countDocuments({ isReturned: false });


  return {
    message: 'Issued books fetched successfully',
    data: issuedBooks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}




}