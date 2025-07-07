import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';

export interface CustomUserSocketClient extends Socket {
  userId: number;
  platformId: number;
  quizAttempt: {
    quizId: number;
    attemptId: number;
    attemptStartTime: Date;
    questionId: number;
    questionStartTime: Date;
    hasSubmited: boolean;
  };
  practiceAttempt: {
    courseId: number;
    attemptId: number;
    attemptStartTime: Date;
    questionId: number;
    questionStartTime: Date;
    hasSubmited: boolean;
  };
  handshake: Handshake & {
    headers: Handshake['headers'] & {
      dauth?: string;
    };
  };
}
