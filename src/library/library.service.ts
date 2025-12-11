import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/databaseservice';
import { Types } from 'mongoose';
import { AddBookDto } from './dto/addBook.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addBook(body: AddBookDto, adminId: string) {

  const adminObjectId = new Types.ObjectId(adminId);

 
  const school = await this.databaseService.repositories.schoolModel.findOne({
    admin: adminObjectId,
  });

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


}