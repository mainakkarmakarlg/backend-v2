import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetSubjectDto } from './dto/get-subject.dto';
import { GetPracticeStatDto } from './dto/get-practice-stat.dto';
import { AddPracticeQuestionDto } from './dto/add-practice-questions.dto';
import { GetPracticeAttemptDto } from './dto/get-practice-attempt.dto';
import { GetPracticeDto } from './dto/get-practice.dto';
import { AddPracticeFlagDto } from './dto/add-practice-flag.dto';
import { PracticeAttemptCreateDto } from './dto/practice-attempt-create.dto';
import { AddPracticeReportDto } from './dto/add-practice-report.dto';
import { GetSubjectResultDto } from './dto/get-subject-result.dto';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @UseGuards(AuthGuard)
  @Get(':courseid/:subjectid')
  findAll(
    @Request() req: CustomRequest,
    @Param('courseid') courseid: string,
    @Param('subjectid') subjectid: string,
  ) {
    return this.practiceService.findAll(req.userid, +subjectid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Get('practice-time')
  findPracticeTime(@Request() req: CustomRequest) {
    return this.practiceService.getTotalTime(req.userid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Get('practice-stat')
  findPracticeStat(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getPracticeStatDto: GetPracticeStatDto,
  ) {
    return this.practiceService.getPracticeStat(
      req.userid,
      getPracticeStatDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('subject-result')
  findSubjectResult(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getSubjectResultDto: GetSubjectResultDto,
  ) {
    return this.practiceService.subjectResult(
      req.userid,
      getSubjectResultDto,
      req.platformid,
    );
  }
  @UseGuards(AuthGuard)
  @Get('get-practice-parent-question')
  getPracticeParentQuestions(
    @Request() req: CustomRequest,
    @Query('questionId') questionId: string,
  ) {
    return this.practiceService.getPracticeParentQuestions(
      req.userid,
      questionId,
    );
  }

  @Post('addquestion')
  addPracticeQuestion(
    @Body(new ValidationPipe()) AddPracticeQuestionDto: AddPracticeQuestionDto,
  ) {
    return this.practiceService.addPractice(AddPracticeQuestionDto);
  }

  @Post('fixquestion')
  fixPracticeQuestion(
    @Body(new ValidationPipe({ transform: true }))
    FixQuestionDto: AddPracticeQuestionDto,
  ) {
    return this.practiceService.updateQuestion(FixQuestionDto);
  }

  @UseGuards(AuthGuard)
  @Get('answer')
  getPacticeAnswer(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    PracticeAttemptCreateDto: PracticeAttemptCreateDto,
  ) {
    return this.practiceService.viewAnswers(
      PracticeAttemptCreateDto,
      req.userid,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('flagcount')
  findFlagCount(@Request() req: CustomRequest) {
    return this.practiceService.findAllFlagged(req.userid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Get('attemptanswer')
  findAttemptAnswer(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getPracticeDto: GetPracticeDto,
  ) {
    return this.practiceService.getAttemptWithAnswers(
      req.userid,
      getPracticeDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('searchsubject')
  searchSubject(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getSubjectDto: GetSubjectDto,
  ) {
    return this.practiceService.searchSubject(
      req.userid,
      getSubjectDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('attempt')
  findAttempt(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getPracticeAttemptDto: GetPracticeAttemptDto,
  ) {
    return this.practiceService.getPracticeAttempt(
      req.userid,
      getPracticeAttemptDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('customizequestioncount')
  findCustomizeQuestionCount(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe())
    practiceAttemptCreateDto: PracticeAttemptCreateDto,
  ) {
    return this.practiceService.getPracticeQuestionDifficulty(
      req.userid,
      practiceAttemptCreateDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('subject')
  findSubject(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getSubjectDto: GetSubjectDto,
  ) {
    return this.practiceService.findSubject(
      req.userid,
      getSubjectDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('report')
  reportQuestion(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) addPracticeReportDto: AddPracticeReportDto,
  ) {
    return this.practiceService.reportQuestion(
      req.userid,
      addPracticeReportDto,
    );
  }

  @UseGuards(AuthGuard)
  @Post('flag')
  flagQuestion(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) addPracticeFlagDto: AddPracticeFlagDto,
  ) {
    return this.practiceService.flagQuestion(req.userid, addPracticeFlagDto);
  }
}
