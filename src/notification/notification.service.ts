import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationService {
  public server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  async sendNotification(
    namespace: string,
    room: string,
    event: string,
    data: any,
  ) {
    this.server.of(namespace).to(room).emit(event, data);
  }
}
