import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FormulaService } from './formula.service';
import { CreateFormulaDto } from './dto/create-formula.dto';
import { UpdateFormulaDto } from './dto/update-formula.dto';

@Controller('formula')
export class FormulaController {
  constructor(private readonly formulaService: FormulaService) {}

  @Post()
  create(@Body() createFormulaDto: CreateFormulaDto) {
    return this.formulaService.create(createFormulaDto);
  }

  @Get()
  findAll() {
    return this.formulaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formulaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormulaDto: UpdateFormulaDto) {
    return this.formulaService.update(+id, updateFormulaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formulaService.remove(+id);
  }
}
