import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { EmployeeService } from './employee.service';
import { CustomEmployeeSocketClient } from 'src/common/interface/custom-socket-employee-client.interface';
import { ValidationPipe } from '@nestjs/common';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { DeviceService } from 'src/device/device.service';
import { EmployeeDeviceAllowChangeDto } from 'src/device/dto/emploee-device-allow-change.dto';
import { EmployeeToDeviceAllowDto } from 'src/device/dto/employee-to-device-allow.dto';
import { ChangeDeviceTypeDto } from 'src/device/dto/change-device-type.dto';
import { UnlockUSBDto } from './dto/unlock-usb.dto';
import { ChangeEmployeeDeviceNameDTO } from 'src/device/dto/change-employee-device-name.dto';
import { PlatformService } from 'src/platform/platform.service';
import { LeadService } from 'src/lead/lead.service';
import { LeadStatusDto } from 'src/lead/dto/lead-status-save.dto';

@WebSocketGateway({ namespace: '/employee' })
export class EmployeeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly deviceService: DeviceService,
    private readonly platformService: PlatformService,
    private readonly leadService: LeadService,
  ) {}

  handleConnection(client: CustomEmployeeSocketClient) {
    return this.employeeService.initializeConnection(client);
  }

  handleDisconnect(client: CustomEmployeeSocketClient) {
    return this.employeeService.cleanupConnection(client);
  }

  @SubscribeMessage('newInteractionCall')
  async newInteractionCall(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.newInteractionCall(client, data);
  }

  @SubscribeMessage('saveInteractionCall')
  async saveInteractionCall(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.saveInteractionCall(client, data);
  }

  @SubscribeMessage('getlead')
  async getSampleLead(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.getLead(client);
  }

  @SubscribeMessage('login')
  async login(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const loginEmployeeDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: LoginEmployeeDto,
      });
      return this.employeeService.login(client, loginEmployeeDto);
    } catch (e) {
      client.emit('loginError', e);
    }
  }

  @SubscribeMessage('getCourse')
  async getCourse(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.platformService.getCourse(client);
  }

  @SubscribeMessage('getUser')
  async getUser(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.employeeService.getUser(client, 0);
  }

  @SubscribeMessage('getLeadsDropDownContent')
  async getLeadsDropDownContent(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
  ) {
    return this.leadService.getLeadDropDownContent(client);
  }

  @SubscribeMessage('employeeBreak')
  async startBreak(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.employeeService.employeeBreak(client);
  }

  @SubscribeMessage('getClasses')
  async getClasses(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.employeeService.userLeads(client);
  }

  @SubscribeMessage('checkForBreak')
  async checkForBreak(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.employeeService.checkForBreak(client);
  }

  @SubscribeMessage('getHierarchy')
  async giveEmployee(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.employeeService.giveEmployee(client, data);
  }

  @SubscribeMessage('employeeDetails')
  async getEmployeeDetails(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
  ) {
    return this.employeeService.getEmployeeDetails(client);
  }

  @SubscribeMessage('addEmployee')
  async addEmployee(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    //return this.employeeService.addEmployee(client, data);
  }

  @SubscribeMessage('giveDevice')
  async getDevices(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.deviceService.getDevices(client);
  }

  @SubscribeMessage('allowDevice')
  async allowDevice(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const employeeDeviceAllowChange = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: EmployeeDeviceAllowChangeDto,
      });
      return this.deviceService.allowDevice(client, employeeDeviceAllowChange);
    } catch (e) {
      client.emit('getPaymentsError', e);
    }
  }

  @SubscribeMessage('allowEmployeeToDevice')
  async allowEmployee(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const employeeToDeviceAllowDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: EmployeeToDeviceAllowDto,
      });
      return this.deviceService.allowEmployeeToDevice(
        client,
        employeeToDeviceAllowDto,
      );
    } catch (e) {
      client.emit('allowEmployeeToDeviceError', e);
    }
  }

  @SubscribeMessage('changeDeviceType')
  async changeDeviceType(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const changeDeviceTypeDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: ChangeDeviceTypeDto,
      });
      return this.deviceService.changeDeviceType(client, changeDeviceTypeDto);
    } catch (e) {
      client.emit('changeDeviceTypeError', e);
    }
  }

  @SubscribeMessage('requestUSB')
  async requestUSB(@ConnectedSocket() client: CustomEmployeeSocketClient) {
    return this.deviceService.requestUSB(client);
  }

  @SubscribeMessage('openUSB')
  async unlockDeviceUSB(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const unlockDeviceUSB = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: UnlockUSBDto,
      });
      return this.deviceService.unlockUSB(client, unlockDeviceUSB);
    } catch (e) {
      client.emit('unlockDeviceUSBError', e);
    }
  }

  @SubscribeMessage('changeDeviceName')
  async changeDeviceName(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const changeDeviceNameDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: ChangeEmployeeDeviceNameDTO,
      });
      return this.deviceService.changeDeviceName(client, changeDeviceNameDto);
    } catch (e) {
      client.emit('changeDeviceNameError', e);
    }
  }

  @SubscribeMessage('unlockUSB')
  async unlockUSB(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() password: any,
  ) {
    return this.deviceService.unlockPaswordUSB(client, password);
  }

  @SubscribeMessage('getLeadInfo')
  async getLeadInfo(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.getLeadInfo(client, +data.leadId);
  }

  @SubscribeMessage('getCallingNumber')
  async getCallingNumbers(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
  ) {
    return this.leadService.getCallingNumber(client);
  }

  @SubscribeMessage('SetCallingNumber')
  async setCallingNumbers(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.addEmployeeToNumber(client, +data.callingNumberId);
  }

  @SubscribeMessage('leadCallStart')
  async leadStartCall(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.leadCallStart(client, +data.interactionId);
  }

  @SubscribeMessage('leadCallPicup')
  async leadPickCall(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.leadCallPickUP(client, +data.interactionId);
  }

  @SubscribeMessage('leadNotConnected')
  async leadNotConnected(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.leadNotConnected(client, +data.interactionId);
  }

  @SubscribeMessage('leadCallEnd')
  async leadEndCall(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.leadCallEnd(client, +data.interactionId);
  }

  @SubscribeMessage('leadSave')
  async leadSave(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    try {
      const saveStateLeadDto = await new ValidationPipe({
        transform: true,
      }).transform(data, {
        type: 'body',
        metatype: LeadStatusDto,
      });
      return this.leadService.leadStatusSave(client, saveStateLeadDto);
    } catch (e) {
      client.emit('add-practice-question-difficulty-error', e);
    }
  }

  @SubscribeMessage('searchLead')
  async searchLead(
    @ConnectedSocket() client: CustomEmployeeSocketClient,
    @MessageBody() data: any,
  ) {
    return this.leadService.searchLead(client, data.searchText);
  }
}
