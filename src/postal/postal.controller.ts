import { Body, Controller, Post, Req, UseGuards , Get, Query, Param} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PostalService } from './postal.service';
import { CreatePostalDto } from 'src/postal/dto/addPostal.dto';

@Controller('postal')
export class PostalController {
  constructor(private readonly postalService: PostalService) {}

  @UseGuards(JwtAuthGuard)
  @Post('addPostal')
  async addPostal(
    @Body() createPostalDto: CreatePostalDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;

    return this.postalService.addPostal(createPostalDto, adminId);
  }

  @UseGuards(JwtAuthGuard)
@Get('getAllPostalsByAdmin')
async getAllPostals(
  @Req() req: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('type') type?: string,     
  @Query('status') status?: string, 
  @Query('date') date?: string,
) {
  const adminId = req.user.userId;

  return this.postalService.getAllPostalsByAdmin(
    adminId,
    Number(page) || 1,
    Number(limit) || 10,
    type,
    status,
    date,
  );
}

@UseGuards(JwtAuthGuard)
@Get('getPostalById/:id')
async getPostalById(
  @Req() req: any,
  @Param('id') id: string,
) {
  const adminId = req.user.userId;

  return this.postalService.getPostalById(adminId, id);
}

@UseGuards(JwtAuthGuard)
@Post('editPostal')
async editPostal(
  @Req() req: any,
  @Body() body: any,
) {
  const adminId = req.user.userId;

  const { postalId, ...updatePostalDto } = body;

  return this.postalService.editPostalByAdmin(
    adminId,
    postalId,
    updatePostalDto,
  );
}



}
