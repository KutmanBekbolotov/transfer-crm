import { Body, Controller, Get, Put } from '@nestjs/common';
import { CompanyProfileService } from './company-profile.service';
import { UpsertCompanyProfileDto } from './dto/upsert-company-profile.dto';

@Controller('company-profile')
export class CompanyProfileController {
  constructor(private readonly service: CompanyProfileService) {}

  @Get()
  getOne() {
    return this.service.getOne();
  }

  @Put()
  upsert(@Body() dto: UpsertCompanyProfileDto) {
    return this.service.upsert(dto);
  }
}