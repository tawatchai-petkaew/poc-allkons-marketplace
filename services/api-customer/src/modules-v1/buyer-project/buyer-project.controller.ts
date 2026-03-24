import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuyerProjectService } from './buyer-project.service';
import { CreateBuyerProjectDto } from './dto/create-buyer-project.dto';

@Controller('v2/buyer-project')
@ApiTags('Buyer Project')
export class BuyerProjectController {
  constructor(private readonly buyerProjectService: BuyerProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBuyerProjectDto: CreateBuyerProjectDto,
    @Request() req,
  ) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    // check userId from token match with DTO
    if (createBuyerProjectDto.userId !== userId) {
      throw new UnauthorizedException(
        'User ID does not match the authenticated user.',
      );
    }

    // check if project name already exists
    const isDuplicate = await this.buyerProjectService.existsByName(
      userId,
      createBuyerProjectDto.name,
    );

    if (isDuplicate) {
      throw new BadRequestException('Project name already exists.');
    }

    return this.buyerProjectService.create(createBuyerProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all project' })
  @ApiResponse({
    status: 200,
    description: 'List of projects returned successfully',
  })
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req, @Query('name') name?: string) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return await this.buyerProjectService.findAll(userId, name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    await this.buyerProjectService.remove(userId, +id);
    return { message: 'Project deleted successfully.' };
  }
}
