import { Body, Controller, Query, Post, Get, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddBookDto } from '../library/dto/addBook.dto'
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('addBook')
  async addBookByAdmin(@Req() req: any, @Body() body: AddBookDto) {
    const adminId = req.user.userId;
    return this.libraryService.addBook(body, adminId);
  }

@UseGuards(AuthGuard('jwt'))
@Post('addMember')
async addMemberByAdmin(@Req() req: any, @Body() body: any) {
  const adminId = req.user.userId;
  return this.libraryService.addMember(body, adminId);
}

@UseGuards(AuthGuard('jwt'))
@Get('getBookCategories')
async getBookCategories(@Req() req: any) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Invalid admin token');
  }

  const bookCategories = [
    'Textbook',
    'Story Book',
    'Reference Book',
    'Novel',
    'Science',
    'Mathematics',
    'Computer',
    'History',
    'Geography',
    'Islamic Studies',
    'English Literature',
    'Urdu Literature',
    'General Knowledge',
  ];

  return {
    success: true,
    data: bookCategories,
  };
}

@UseGuards(AuthGuard('jwt'))
@Get('getBooksByAdmin')
async getBooks(
  @Req() req: any,
  @Query('page') page: string,
  @Query('limit') limit: string,
  @Query('category') category?: string,
  @Query('search') search?: string,
) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Admin not found in token');
  }

  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 10;

  return this.libraryService.getBooks(
    adminId,
    pageNumber,
    limitNumber,
    category,
    search,
  );
}
@UseGuards(AuthGuard('jwt'))
@Get('getLibraryMembers')
async getLibraryMembers(
  @Req() req: any,
  @Query('page') page: string,
  @Query('limit') limit: string,
  @Query('memberType') memberType?: string, // student / teacher
) {
  const adminId = req.user.userId;
  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 10;

  return this.libraryService.getLibraryMembersByAdmin(
    adminId,
    pageNumber,
    limitNumber,
    memberType,
  );
}

@UseGuards(AuthGuard('jwt'))
@Post('issueBook')
async issueBook(
  @Req() req: any,
  @Body() body: { memberId: string; bookId: string; memberType: string },
) {
  const adminId = req.user.userId;

  if (!adminId) {
    throw new BadRequestException('Admin not found in token');
  }

  return this.libraryService.issueBookByAdmin(adminId, body);
}

@UseGuards(AuthGuard('jwt'))
@Get('getIssuedBooks')
async getIssuedBooks(
  @Req() req: any,
  @Query('page') page: string,
  @Query('limit') limit: string,
) {
  const adminId = req.user.userId;

  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 10;

  return this.libraryService.getAllIssuedBooks(adminId, pageNumber, limitNumber);
}


}


