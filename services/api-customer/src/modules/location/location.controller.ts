import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CreateLocationDto, LocationResponseDto } from './dto/location.dto';
import { LocationService } from './location.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { CurrentUser } from '@/decorators/request.decorator';
import { AuthUser } from '@/types/request.types';

@Controller('locations')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @UseGuards(ActJwtGuard)
  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    const cacheKey = `locations:search:${keyword.trim().toLowerCase()}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.locationService.search(keyword);
    await this.cacheManager.set(cacheKey, results, 300);
    return results;
  }

  @Get()
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  @ApiResponse({
    status: 200,
    description: 'Get user locations',
    type: [LocationResponseDto],
  })
  async getUserLocations(
    @CurrentUser() user: AuthUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.locationService.getUserLocations(user.id, page, limit);
  }

  @Get('default')
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  @ApiResponse({
    status: 200,
    description: 'Get user default location',
    type: LocationResponseDto,
  })
  async getUserDefaultLocation(@CurrentUser() user: AuthUser) {
    return this.locationService.getUserDefaultLocation(user.id);
  }

  @Post()
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  @ApiResponse({
    status: 201,
    description: 'Create user location',
    type: LocationResponseDto,
  })
  async createLocation(
    @CurrentUser() user: AuthUser,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.locationService.createUserLocation(user.id, createLocationDto);
  }

  @Delete(':locationId')
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  @ApiResponse({
    status: 200,
    description: 'Delete user location',
  })
  async deleteLocation(@Param('locationId') locationId: number) {
    return this.locationService.deleteLocation(locationId);
  }

  @Put(':locationId')
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  @ApiResponse({
    status: 200,
    description: 'Update user location',
  })
  async setDefaultLocation(
    @Param('locationId') locationId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.locationService.setDefaultLocation(user.id, locationId);
  }
}
