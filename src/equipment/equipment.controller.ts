import { Controller, Get } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Get()
  getAll() {
    return this.equipmentService.getAll();
  }
}
