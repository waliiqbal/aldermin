import { Body, Controller, Post, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
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
}
