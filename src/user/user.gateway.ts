import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { CustomUserSocketClient } from 'src/common/interface/custom-socket-user-client.interface';
import { PracticeService } from 'src/practice/practice.service';
import { ValidationPipe } from '@nestjs/common';
import { PracticeAttemptCreateDto } from 'src/practice/dto/practice-attempt-create.dto';
import { AddQuestionDifficultyDto } from 'src/practice/dto/add-question-difficulty.dto';
import { QuizService } from 'src/quiz/quiz.service';
import { QuizAttemptCreateDto } from 'src/quiz/dto/quiz-attempt-create.dto';
import { AddQuizQuestionDifficultyDto } from 'src/quiz/dto/add-quiz-question-difficulty.dto';

@WebSocketGateway({
  namespace: '/user',
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly practiceService: PracticeService,
    private readonly quizService: QuizService,
  ) {}

  handleConnection(client: CustomUserSocketClient, ...args: any[]) {
    return this.userService.initSocket(client);
  }

  handleDisconnect(client: any) {
    return this.userService.disconnectSocket(client);
  }

  @SubscribeMessage('watch-course')
  async watchCourse(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('watch-course-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('watch-course-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    if (!parsedData.courseId) {
      return client.emit('watch-course-error', {
        message: 'Course ID is required',
      });
    }
    await this.userService.watchCourse(client, +parsedData.courseId);
  }

  @SubscribeMessage('add-practice-question-difficulty')
  async addPracticeQuestionDifficulty(
    client: CustomUserSocketClient,
    data: any,
  ) {
    if (!client.userId) {
      return client.emit('add-practice-question-difficulty-error', {
        message: 'User not logged in',
      });
    }
    try {
      const addQuestionDifficultyDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: AddQuestionDifficultyDto,
      });
      return this.practiceService.addPracticeQuestionDifficulty(
        client,
        addQuestionDifficultyDto,
      );
    } catch (e) {
      client.emit('add-practice-question-difficulty-error', e);
    }
  }

  @SubscribeMessage('quiz-user-cheating')
  async quizUserCheating(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('quiz-user-cheating-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('quiz-user-cheating-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    if (!parsedData.offense) {
      return client.emit('quiz-user-cheating-error', {
        message: 'Offense is required',
      });
    }
    return this.quizService.reportUserCheating(
      client,
      parsedData.offense as string,
    );
  }

  @SubscribeMessage('login')
  async login(client: CustomUserSocketClient, data: any) {
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('login-error', 'Invalid login data format');
      }
    } else {
      parsedData = data;
    }
    if (!parsedData?.token) {
      return client.emit('login-error', 'Token is required');
    }
    return this.authService.wsLogin(client, parsedData.token);
  }

  @SubscribeMessage('make-practice-attempt')
  async makeAttempt(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('make-practice-attempt-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('make-practice-attempt-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    try {
      const practiceAttemptDto = await new ValidationPipe({
        transform: true,
      }).transform(parsedData, {
        type: 'body',
        metatype: PracticeAttemptCreateDto,
      });
      return this.practiceService.getPracticeQuestions(
        client,
        practiceAttemptDto,
      );
    } catch (e) {
      client.emit('make-practice-attempt-error', e);
    }
  }

  // @SubscribeMessage('get-practice-parent-question')
  // async getParentQuestion(client: CustomUserSocketClient, data: any) {
  //   if (!client.userId) {
  //     return client.emit('get-practice-parent-question-error', {
  //       message: 'User not logged in',
  //     });
  //   }
  //   let parsedData;
  //   if (typeof data === 'string') {
  //     try {
  //       parsedData = JSON.parse(data);
  //     } catch (error) {
  //       console.error('Invalid JSON data received:', data);
  //       return client.emit(
  //         'get-practice-parent-question-error',
  //         'Invalid Data',
  //       );
  //     }
  //   } else {
  //     parsedData = data;
  //   }
  //   try {
  //     const practiceAttemptDto = await new ValidationPipe({
  //       transform: true,
  //     }).transform(parsedData, {
  //       type: 'body',
  //       metatype: PracticeAttemptCreateDto,
  //     });
  //     return this.practiceService.getPracticeParentQuestions(
  //       client,
  //       data.questionId,
  //     );
  //   } catch (e) {
  //     client.emit('make-practice-attempt-error', e);
  //   }
  // }

  @SubscribeMessage('watch-practice-question')
  async watchQuestion(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('watch-question-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('make-practice-attempt-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    await this.practiceService.watchPracticeQuestion(
      client,
      parsedData.questionId,
    );
  }

  @SubscribeMessage('add-option-practice-question')
  async addOption(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('add-option-practice-question-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('make-practice-attempt-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    try {
      const questionInfo = {
        questionId: parsedData.questionId,
        optionId: parsedData.optionId,
      };
      await this.practiceService.addOptionPracticeQuestion(
        client,
        questionInfo,
      );
    } catch (e) {
      client.emit('add-option-practice-question-error', e);
    }
  }

  @SubscribeMessage('unregister')
  async unregister(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('unregister-error', {
        message: 'User not logged in',
      });
    }
  }

  @SubscribeMessage('get-practice-question-explaination')
  async getPracticeQuestionExplaination(
    client: CustomUserSocketClient,
    data: any,
  ) {
    if (!client.userId) {
      return client.emit('get-practice-question-explaination-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit(
          'get-practice-question-explaination-error',
          'Invalid Data',
        );
      }
    } else {
      parsedData = data;
    }
    await this.practiceService.getPracticeQuestionExplaination(
      client,
      parsedData.questionId,
    );
  }

  @SubscribeMessage('submit-practice-attempt')
  async submitAttempt(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('submit-practice-attempt-error', {
        message: 'User not logged in',
      });
    }
    try {
      await this.practiceService.submitPracticeAttempt(client);
    } catch (e) {
      client.emit('submit-practice-attempt-error', e);
    }
  }

  @SubscribeMessage('pause-practice-attempt')
  async pauseAttempt(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('pause-practice-attempt-error', {
        message: 'User not logged in',
      });
    }
    await this.practiceService.pausePracticeAttempt(client);
  }

  @SubscribeMessage('make-quiz-attempt')
  async makeQuizAttempt(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('make-quiz-attempt-error', {
        message: 'User not logged in',
      });
    }
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('make-quiz-attempt-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    try {
      const quizAttemptDto = await new ValidationPipe({
        transform: true,
      }).transform(parsedData, {
        type: 'body',
        metatype: QuizAttemptCreateDto,
      });
      return this.quizService.startQuiz(client, quizAttemptDto);
    } catch (e) {
      client.emit('make-quiz-attempt-error', e);
    }
  }

  @SubscribeMessage('give-quiz-questions')
  async giveQuizQuestions(client: CustomUserSocketClient) {
    if (!client.userId) {
      return client.emit('give-quiz-questions-error', {
        message: 'User not logged in',
      });
    }

    if (!client.quizAttempt.quizId) {
      return client.emit('give-quiz-questions-error', {
        message: 'Quiz not found',
      });
    }

    if (!client.quizAttempt.attemptId) {
      return client.emit('give-quiz-questions-error', {
        message: 'Attempt not found',
      });
    }
    return this.quizService.getQuizQuestions(client);
  }

  @SubscribeMessage('watch-quiz-question')
  async watchQuizQuestion(client: CustomUserSocketClient, data: any) {
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('watch-quiz-question-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }
    if (!parsedData.questionId) {
      return client.emit('watch-quiz-question-error', {
        message: 'Question not found',
      });
    }

    if (!client.userId) {
      return client.emit('watch-quiz-question-error', {
        message: 'User not logged in',
      });
    }

    if (!client.quizAttempt?.attemptId) {
      return client.emit('watch-quiz-question-error', {
        message: 'Attempt not found',
      });
    }

    try {
      return this.quizService.watchQuizQuestion(client, +parsedData.questionId);
    } catch (error) {
      return client.emit('watch-quiz-question-error', {
        message: error.message,
      });
    }
  }

  @SubscribeMessage('add-option-quiz-question')
  async addQuizOption(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('add-option-quiz-question-error', {
        message: 'User not logged in',
      });
    }
    if (!client.quizAttempt.attemptId) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Attempt not found',
      });
    }
    if (!client.quizAttempt.questionId) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Question is not being watched',
      });
    }

    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Invalid JSON data received:', data);
        return client.emit('add-option-quiz-question-error', 'Invalid Data');
      }
    } else {
      parsedData = data;
    }

    if (!parsedData.optionId) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Option not found',
      });
    }
    try {
      return this.quizService.addOptionQuizQuestion(
        client,
        parsedData.optionId,
      );
    } catch (e) {
      client.emit('add-option-quiz-question-error', e);
    }
  }

  @SubscribeMessage('get-quiz-question-explaination')
  async getQuizQuestionExplaination(client: CustomUserSocketClient) {
    if (!client.userId) {
      return client.emit('get-quiz-question-explaination-error', {
        message: 'User not logged in',
      });
    }

    if (!client.quizAttempt?.attemptId) {
      return client.emit('get-quiz-question-explaination-error', {
        message: 'Attempt not found',
      });
    }

    return this.quizService.getQuizQuestionExplaination(client);
  }

  @SubscribeMessage('submit-quiz-attempt')
  async submitQuizAttempt(client: CustomUserSocketClient) {
    if (!client.userId) {
      return client.emit('submit-quiz-attempt-error', {
        message: 'User not logged in',
      });
    }

    if (!client.quizAttempt?.attemptId) {
      return client.emit('submit-quiz-attempt-error', {
        message: 'Attempt not found',
      });
    }

    return this.quizService.submitQuizAttempt(client);
  }

  @SubscribeMessage('pause-quiz-attempt')
  async pauseQuizAttempt(client: CustomUserSocketClient) {
    if (!client.userId) {
      return client.emit('pause-quiz-attempt-error', {
        message: 'User not logged in',
      });
    }

    if (!client.quizAttempt?.attemptId) {
      return client.emit('pause-quiz-attempt-error', {
        message: 'Attempt not found',
      });
    }

    return this.quizService.handleQuizAttemptDisconnect(client);
  }

  @SubscribeMessage('add-quiz-question-difficulty')
  async addQuizQuestionDifficulty(client: CustomUserSocketClient, data: any) {
    if (!client.userId) {
      return client.emit('add-quiz-question-difficulty-error', {
        message: 'User not logged in',
      });
    }
    try {
      const addQuizQuestionDifficultyDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: AddQuizQuestionDifficultyDto,
      });
      return this.quizService.addQuizQuestionDifficulty(
        client,
        addQuizQuestionDifficultyDto,
      );
    } catch (e) {
      client.emit('add-quiz-question-difficulty-error', e);
    }
  }
}
