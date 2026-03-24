import {
  Controller,
  UseFilters,
  Get,
  Post,
  Body,
  UseGuards,
  Query
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaticService } from './static.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { HttpExceptionFilter } from '../filter/http-exception.filter';

@Controller('static')
export class StaticController {
  constructor(private readonly staticService: StaticService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCountryDto) {
    return this.staticService.createCountry(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bank')
  @UseFilters(new HttpExceptionFilter())
  showAllBank() {
    return this.staticService.showAllBank();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/shipmentCompany')
  @UseFilters(new HttpExceptionFilter())
  showAllShipmentCompany() {
    return this.staticService.showAllShipmentCompany();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/country')
  @UseFilters(new HttpExceptionFilter())
  showAllCountry() {
    return this.staticService.showAllCountry();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/province')
  @UseFilters(new HttpExceptionFilter())
  showAllProvince() {
    return this.staticService.showAllProvince();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/district')
  @UseFilters(new HttpExceptionFilter())
  showAllDistrict() {
    return this.staticService.showAllDistrict();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/subDistrict')
  @UseFilters(new HttpExceptionFilter())
  showAllSubDistrict(@Query() query) {
    return this.staticService.showAllSubDistrict(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/location')
  @UseFilters(new HttpExceptionFilter())
  showAllLocation() {
    return this.staticService.showAllLocation();
  }
}
