import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetDoubtForumQuestionsDto } from './dto/get-questions.dto';
import { DoubtforumService } from './doubtforum.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostQuestionDto } from './dto/post-question.dto';
import { PostAnswerDto } from './dto/post-answer.dto';
import { PatchQuestionDto } from './dto/patch-question.dto';
import { PatchAnswerDto } from './dto/patch-answer.dto';

@Controller('doubtforum')
@UseGuards(AuthGuard)
export class DoubtforumController {
  constructor(private readonly doubtforumService: DoubtforumService) {}

  @Get()
  findAll(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getDoubtForumQuestionsDto: GetDoubtForumQuestionsDto,
  ) {
    return this.doubtforumService.findAll(
      req.userid,
      req.platformid,
      getDoubtForumQuestionsDto,
    );
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'uploadedFiles', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  create(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    postQuestionDto: PostQuestionDto,
    @UploadedFiles() files: { uploadedFiles: Express.Multer.File[] },
  ) {
    let uploadedFiles: Express.Multer.File[] = [];
    uploadedFiles = files.uploadedFiles;
    if (uploadedFiles) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'application/pdf',
      ];
      let hasPdf = false;
      let imageCount = 0;
      for (const file of uploadedFiles) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new ForbiddenException('Invalid file type');
        }
        if (file.mimetype === 'application/pdf') {
          hasPdf = true;
        } else {
          imageCount++;
        }
      }
      if (hasPdf && imageCount > 0) {
        throw new ForbiddenException(
          'You can upload either one PDF or up to five images, not both',
        );
      }
      if (hasPdf && uploadedFiles.length > 1) {
        throw new ForbiddenException('Only one PDF can be uploaded');
      }
      if (imageCount > 5) {
        throw new ForbiddenException('You can upload up to five images');
      }
    }
    return this.doubtforumService.postQuestion(
      req.userid,
      req.platformid,
      postQuestionDto,
      uploadedFiles,
    );
  }

  @Get('count')
  countAll(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getDoubtForumQuestionsDto: GetDoubtForumQuestionsDto,
  ) {
    return this.doubtforumService.count(
      req.userid,
      req.platformid,
      getDoubtForumQuestionsDto,
    );
  }

  @Get('answer/like/:answerId')
  likeAnswer(
    @Request() req: CustomRequest,
    @Param('answerId') answerId: string,
    @Query('type') type: string,
  ) {
    return this.doubtforumService.likeAnswer(
      req.userid,
      +answerId,
      req.platformid,
      type,
    );
  }

  @Post('answer/report/:answerId')
  reportAnswer(
    @Request() req: CustomRequest,
    @Param('answerId') answerId: string,
    @Body('reason') reason: string,
  ) {
    if (!reason) {
      throw new ForbiddenException('Reason is required');
    }
    return this.doubtforumService.reportAnswer(
      req.userid,
      +answerId,
      req.platformid,
      reason,
    );
  }

  @Delete('answer/:answerId')
  deleteAnswer(
    @Request() req: CustomRequest,
    @Param('answerId') answerId: string,
  ) {
    return this.doubtforumService.deleteAnswer(
      req.userid,
      +answerId,
      req.platformid,
    );
  }

  @Patch('answer/:answerId')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'uploadedFiles', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  patchAnswer(
    @Request() req: CustomRequest,
    @Param('answerId') answerId: string,
    @Body(new ValidationPipe({ transform: true }))
    patchAnswerDto: PatchAnswerDto,
    @UploadedFiles() files: { uploadedFiles: Express.Multer.File[] },
  ) {
    let uploadedFiles: Express.Multer.File[] = [];
    uploadedFiles = files.uploadedFiles;
    if (uploadedFiles) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'application/pdf',
      ];
      let hasPdf = false;
      let imageCount = 0;
      for (const file of uploadedFiles) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new ForbiddenException('Invalid file type');
        }
        if (file.mimetype === 'application/pdf') {
          hasPdf = true;
        } else {
          imageCount++;
        }
      }
      if (hasPdf && imageCount > 0) {
        throw new ForbiddenException(
          'You can upload either one PDF or up to five images, not both',
        );
      }
      if (hasPdf && uploadedFiles.length > 1) {
        throw new ForbiddenException('Only one PDF can be uploaded');
      }
      if (imageCount > 5) {
        throw new ForbiddenException('You can upload up to five images');
      }
    }
    return this.doubtforumService.patchAnswer(
      req.userid,
      +answerId,
      req.platformid,
      patchAnswerDto,
      uploadedFiles,
    );
  }

  @Get('like/:questionId')
  likeQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
    @Query('type') type: string,
  ) {
    return this.doubtforumService.likeQuestion(
      req.userid,
      +questionId,
      req.platformid,
      type,
    );
  }

  @Post('report/:questionId')
  reportQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
    @Body('reason') reason: string,
  ) {
    if (!reason) {
      throw new ForbiddenException('Reason is required');
    }
    return this.doubtforumService.reportQuestion(
      req.userid,
      +questionId,
      req.platformid,
      reason,
    );
  }

  @Get('view/:questionId')
  viewQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
  ) {
    return this.doubtforumService.viewQuestion(
      req.userid,
      +questionId,
      req.platformid,
    );
  }

  @Get('pin/:questionId')
  pinQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
  ) {
    return this.doubtforumService.pinQuestion(
      req.userid,
      +questionId,
      req.platformid,
    );
  }

  @Delete(':questionId')
  deleteQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
  ) {
    return this.doubtforumService.deleteQuestion(
      req.userid,
      +questionId,
      req.platformid,
    );
  }

  @Post(':questionId')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'uploadedFiles', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  postAnswer(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
    @Body(new ValidationPipe({ transform: true })) postAnswerDto: PostAnswerDto,
    @UploadedFiles() files: { uploadedFiles: Express.Multer.File[] },
  ) {
    let uploadedFiles: Express.Multer.File[] = [];
    uploadedFiles = files.uploadedFiles;
    if (uploadedFiles) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'application/pdf',
      ];
      let hasPdf = false;
      let imageCount = 0;
      for (const file of uploadedFiles) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new ForbiddenException('Invalid file type');
        }
        if (file.mimetype === 'application/pdf') {
          hasPdf = true;
        } else {
          imageCount++;
        }
      }
      if (hasPdf && imageCount > 0) {
        throw new ForbiddenException(
          'You can upload either one PDF or up to five images, not both',
        );
      }
      if (hasPdf && uploadedFiles.length > 1) {
        throw new ForbiddenException('Only one PDF can be uploaded');
      }
      if (imageCount > 5) {
        throw new ForbiddenException('You can upload up to five images');
      }
    }
    return this.doubtforumService.postAnswer(
      req.userid,
      +questionId,
      req.platformid,
      postAnswerDto,
      uploadedFiles,
    );
  }

  @Patch(':questionId')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'uploadedFiles', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  patchQuestion(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
    @Body(new ValidationPipe({ transform: true }))
    patchQuestionDto: PatchQuestionDto,
    @UploadedFiles() files: { uploadedFiles: Express.Multer.File[] },
  ) {
    let uploadedFiles: Express.Multer.File[] = [];
    uploadedFiles = files.uploadedFiles;
    if (uploadedFiles) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'application/pdf',
      ];
      let hasPdf = false;
      let imageCount = 0;
      for (const file of uploadedFiles) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new ForbiddenException('Invalid file type');
        }
        if (file.mimetype === 'application/pdf') {
          hasPdf = true;
        } else {
          imageCount++;
        }
      }
      if (hasPdf && imageCount > 0) {
        throw new ForbiddenException(
          'You can upload either one PDF or up to five images, not both',
        );
      }
      if (hasPdf && uploadedFiles.length > 1) {
        throw new ForbiddenException('Only one PDF can be uploaded');
      }
      if (imageCount > 5) {
        throw new ForbiddenException('You can upload up to five images');
      }
    }
    return this.doubtforumService.patchQuestion(
      req.userid,
      +questionId,
      req.platformid,
      patchQuestionDto,
      uploadedFiles,
    );
  }

  @Get('source')
  findAllSource(@Request() req: CustomRequest) {
    return this.doubtforumService.getSources(req.userid, req.platformid);
  }

  @Get('subjects')
  findAllSubject(
    @Request() req: CustomRequest,
    @Query('subjectId') subjectId: string,
  ) {
    return this.doubtforumService.findAllSubject(
      req.userid,
      req.platformid,
      +subjectId,
    );
  }

  @Get(':questionId')
  findOne(
    @Request() req: CustomRequest,
    @Param('questionId') questionId: string,
  ) {
    return this.doubtforumService.findOne(
      req.userid,
      +questionId,
      req.platformid,
    );
  }
}
