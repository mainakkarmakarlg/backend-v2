import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LectureService } from './lecture.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CustomRequest } from 'src/common/interface/custom-request.interface';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Post()
  create(@Body() createLectureDto: CreateLectureDto) {
    return this.lectureService.create(createLectureDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: CustomRequest) {
    return this.lectureService.findAll(req.userid, req.platformid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLectureDto: UpdateLectureDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}

  @Post('change-fall-num')
  changeFallNum(
    @Body() body: { oldFallnumber: string; newFallnumber: string },
  ) {
    return this.lectureService.changeFalluNum(
      body.oldFallnumber,
      body.newFallnumber,
    );
  }

  @Post('lecture-guide-add')
  lectureGuideAdd(
    @Body(new ValidationPipe({ transform: true }))
    createLectureDto: CreateLectureDto,
  ) {
    return this.lectureService.addLecture(createLectureDto);
  }
}
