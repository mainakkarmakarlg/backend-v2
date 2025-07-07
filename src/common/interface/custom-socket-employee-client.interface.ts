import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';

export interface CustomEmployeeSocketClient extends Socket {
  employeeId: number;
  deviceId: number;
  attendanceId: number;
  breakId: number;
  platformId: number;
  isUSBOpen: boolean;
  handshake: Handshake & {
    headers: Handshake['headers'] & {
      dauth?: string;
    };
  };
}
