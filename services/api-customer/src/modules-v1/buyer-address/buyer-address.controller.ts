import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuyerAddressService } from './buyer-address.service';
import { CreateBuyerAddressDto } from './dto/create-buyer-address.dto';
import { UpdateBuyerAddressDto } from './dto/update-buyer-address.dto';

@Controller('v2/buyer-address')
@ApiTags('Buyer Address')
@UseGuards(JwtAuthGuard)
@UseFilters(new HttpExceptionFilter())
export class BuyerAddressController {
  constructor(private readonly buyerAddressService: BuyerAddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new buyer address' })
  @ApiResponse({
    status: 201,
    description: 'Buyer address created successfully',
  })
  async create(
    @Body() createBuyerAddressDto: CreateBuyerAddressDto,
    @Request() req,
  ) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    // check userId from token match with DTO
    if (createBuyerAddressDto.userId !== userId) {
      throw new UnauthorizedException(
        'User ID does not match the authenticated user.',
      );
    }

    //check duplicate address
    // const isDuplicate = await this.buyerAddressService.existsByAddress(
    //   userId,
    //   createBuyerAddressDto,
    // );

    // if (isDuplicate) {
    //   throw new BadRequestException('Address already exists.');
    // }

    return this.buyerAddressService.createAddress(
      userId,
      createBuyerAddressDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all buyer addresses' })
  @ApiResponse({
    status: 200,
    description: 'List of buyer addresses retrieved successfully',
  })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('pageLimit') pageLimit: number = 10,
    @Query('addressTypes') addressTypes?: string | string[],
  ) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    if (!page || page < 1) {
      throw new BadRequestException('Page number must be a positive integer.');
    }

    if (!pageLimit || pageLimit < 1) {
      throw new BadRequestException('Page limit must be a positive integer.');
    }

    // Parse addressTypes - handle both array and comma-separated string
    let addressTypesArray: string[] | undefined;
    if (addressTypes) {
      if (Array.isArray(addressTypes)) {
        addressTypesArray = addressTypes;
      } else {
        addressTypesArray = addressTypes.split(',').map((type) => type.trim());
      }
    }

    return this.buyerAddressService.findAllAddress(userId, {
      page: +page,
      pageLimit: +pageLimit,
      addressTypes: addressTypesArray,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a buyer address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Buyer address retrieved successfully',
  })
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.buyerAddressService.findOneAddress(userId, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a buyer address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Buyer address updated successfully',
  })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBuyerAddressDto: UpdateBuyerAddressDto,
  ) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    //check duplicate address
    // const isDuplicate = await this.buyerAddressService.existsByAddress(
    //   userId,
    //   updateBuyerAddressDto,
    // );

    // If address already exists, throw an error
    // if (isDuplicate) {
    //   throw new BadRequestException('Address already exists.');
    // }

    return this.buyerAddressService.updateAddress(
      userId,
      +id,
      updateBuyerAddressDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a buyer address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Buyer address deleted successfully',
  })
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req?.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return this.buyerAddressService.removeAddress(userId, +id);
  }
}
