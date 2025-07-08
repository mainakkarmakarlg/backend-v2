import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { CheckAuthGuard } from 'src/auth/guards/checkauth.guard';
import { QuizGetDto } from './dto/quiz-get.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AddQuizReportDto } from './dto/add-quiz-report.dto';
import { AddQuizFlagDto } from './dto/add-quiz-flag.dto';
import { GetQuizAnswersDto } from './dto/get-quiz-answers.dto';
import { AddQuizQuestionDto } from './dto/add-quiz-question.dto';
import { QuizUserRegisterDto } from './dto/quiz-user-register.dto';
import { GetQuizOptionDto } from './dto/get-quiz-option.dto';
import { AddQuizFeedbackDto } from './dto/add-quiz-feedback.dto';
import { CreateQuizDto } from './dto/add-quiz-dto';
import { QuizLinkCourseDto } from './dto/quiz-link-course.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(CheckAuthGuard)
  @Get()
  getQuiz(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true })) getQuizDto: QuizGetDto,
  ) {
    return this.quizService.findAll(req.userid, req.platformid, getQuizDto);
  }

  // new just create quiz only
  // needs to add here also
  @UseGuards(CheckAuthGuard)
  @Post()
  addQuiz(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    createQuizDto: CreateQuizDto,
  ) {
    return this.quizService.createQuiz(createQuizDto);
  }

  // create QuizToPlatformNdCourse

  @UseGuards(CheckAuthGuard)
  @Post('platform')
  addQuizPlatform(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    quizLinkCourseDto: QuizLinkCourseDto,
  ) {
    return this.quizService.quizToPlatForm(req.platformid, quizLinkCourseDto);
  }

  @Get('allanswers')
  getAllQuizAnswers() {
    return this.quizService.getAllAnswer();
  }

  @UseGuards(AuthGuard)
  @Post('register')
  registerQuiz(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    quizUserRegisterDto: QuizUserRegisterDto,
  ) {
    return this.quizService.quizStudentRegister(
      req.userid,
      quizUserRegisterDto,
    );
  }

  @Get('options')
  getQuizRegisterForm(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    quizOption: GetQuizOptionDto,
  ) {
    return this.quizService.getQuizOption(req.platformid, quizOption);
  }

  @UseGuards(AuthGuard)
  @Post('report')
  reportQuestion(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) addQuizReportDto: AddQuizReportDto,
  ) {
    return this.quizService.reportQuestion(req.userid, addQuizReportDto);
  }

  @UseGuards(AuthGuard)
  @Post('flag')
  flagQuestion(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) addQuizFlagDto: AddQuizFlagDto,
  ) {
    return this.quizService.flagQuestion(req.userid, addQuizFlagDto);
  }

  @UseGuards(AuthGuard)
  @Get('quizattemptanswer')
  findAttemptAnswer(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getQuizAnswersDto: GetQuizAnswersDto,
  ) {
    return this.quizService.getAttemptWithAnswers(
      req.userid,
      getQuizAnswersDto,
      req.platformid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('quizfeedback')
  addQuizFeedback(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    addQuizFeedbackDto: AddQuizFeedbackDto,
  ) {
    return this.quizService.addQuizFeedback(
      req.userid,
      addQuizFeedbackDto.quizId,
      addQuizFeedbackDto.feedback,
    );
  }
  @UseGuards(AuthGuard)
  @Get('quiz-user-stats')
  getUserQuizStats(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getQuizAnswersDto: GetQuizAnswersDto,
  ) {
    return this.quizService.getUserQuizStats(req.userid);
  }

  @Post('addquestion')
  addQuizQuestion(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    addQuizQuestionDto: AddQuizQuestionDto,
  ) {
    return this.quizService.addQuiz(addQuizQuestionDto);
  }
}
