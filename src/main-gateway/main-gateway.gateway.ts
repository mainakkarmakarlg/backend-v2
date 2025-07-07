import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomEmployeeSocketClient } from 'src/common/interface/custom-socket-employee-client.interface';
import { NotificationService } from 'src/notification/notification.service';

@WebSocketGateway({})
export class MainGatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly notificationService: NotificationService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: CustomEmployeeSocketClient) {
    client.disconnect();
  }
  handleDisconnect() {}
  afterInit(server: Server) {
    this.notificationService.setServer(server);
  }
}
