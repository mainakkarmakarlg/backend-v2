import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DatabaseService } from 'src/database/database.service';
import { CustomEmployeeSocketClient } from '../common/interface/custom-socket-employee-client.interface';
import { NotificationService } from '../notification/notification.service';
import { EmployeeDeviceAllowChangeDto } from './dto/emploee-device-allow-change.dto';
import { EmployeeToDeviceAllowDto } from './dto/employee-to-device-allow.dto';
import { ChangeDeviceTypeDto } from './dto/change-device-type.dto';
import { UnlockUSBDto } from 'src/employee/dto/unlock-usb.dto';
import { ChangeEmployeeDeviceNameDTO } from './dto/change-employee-device-name.dto';

@Injectable()
export class DeviceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async registerUserDevice(
    platformId: number,
    registerDeviceDto: RegisterDeviceDto,
  ) {
    const device = await this.databaseService.userDevice.findFirst({
      where: {
        deviceId: registerDeviceDto.deviceId,
      },
    });
    if (!device) {
      await this.databaseService.userDevice.create({
        data: {
          deviceId: registerDeviceDto.deviceId,
          platformId: platformId,
          deviceModel: registerDeviceDto.deviceModel,
          deviceOS: registerDeviceDto.deviceOS,
        },
      });
    }
    return { message: 'Device Registered Successfully' };
  }

  async getEmployeeDevice(
    client: CustomEmployeeSocketClient,
    deviceId: string,
    platformId: number,
    version: string,
  ) {
    let device: any = await this.databaseService.employeeDevices.findFirst({
      where: {
        deviceId: deviceId,
      },
      include: {
        Employee: {
          include: {
            Employee: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });
    if (!device) {
      device = await this.databaseService.employeeDevices.create({
        data: {
          deviceId: deviceId,
          type: 'Office',
        },
      });
    }
    client.join('employee-device-' + device.id);
    client.deviceId = device.id;
    client.isUSBOpen = false;
    client.join('growth-manager-devices');
    const platformOptions = await this.databaseService.platformOptions.findMany(
      {
        where: {
          platformId: platformId,
        },
      },
    );
    device.isOnline = true;
    device.isUSBOpen = false;
    client.emit('platformOption', { platformOptions, device, version });
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'onlineDevice',
      device,
    );
  }

  async isDeviceAllowed(deviceId: number, employeeId: number) {
    const device = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: deviceId,
      },
      include: {
        Employee: {
          where: {
            employeeId: employeeId,
          },
        },
      },
    });
    if (!device) {
      return false;
    }
    if (!device.isAllowed) {
      return false;
    }
    if (device?.Employee.length === 0) {
      await this.databaseService.employeeToDevice.create({
        data: {
          deviceId: device.id,
          employeeId: employeeId,
          isAllowed: false,
        },
      });
      const giveDevice = await this.databaseService.employeeDevices.findFirst({
        where: {
          id: device.id,
        },
        include: {
          Employee: {
            where: {
              employeeId: employeeId,
            },
            include: {
              Employee: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
        },
      });
      this.notificationService.sendNotification(
        '/employee',
        'DeviceView',
        'deviceNotAllowed',
        giveDevice,
      );
      return false;
    }
    if (device.Employee[0].isAllowed === false) {
      return false;
    }
    return device;
  }

  async allowDevice(
    client: CustomEmployeeSocketClient,
    employeeDeviceAllowChange: EmployeeDeviceAllowChangeDto,
  ) {
    const canAllowDevice = client.rooms.has('canAllowDevice');
    if (!canAllowDevice) {
      return client.emit('allowDeviceError', {
        message: 'You are not allowed to perform this action',
      });
    }
    let device: any = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: employeeDeviceAllowChange.deviceId,
      },
    });
    if (!device) {
      return client.emit('allowDeviceError', {
        message: 'Device not found',
      });
    }
    device = await this.databaseService.employeeDevices.update({
      where: {
        id: device.id,
      },
      data: {
        isAllowed: employeeDeviceAllowChange.allowChange,
      },
      include: {
        Employee: {
          include: {
            Employee: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });
    await this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'deviceAllowedChanged',
      device,
    );
    const allowedChangedDevice = await this.notificationService.server
      .of('/employee')
      .in('employee-device-' + device.id)
      .fetchSockets();
    if (allowedChangedDevice.length > 0) {
      this.notificationService.sendNotification(
        '/employee',
        'employee-device-' + device.id,
        'deviceSelfAllowedChanged',
        device,
      );
      if (!device.isAllowed) {
        allowedChangedDevice[0].disconnect();
      }
    }
  }

  async requestUSB(client: CustomEmployeeSocketClient) {
    let employee: {
      id: number;
      fname: string;
      lname: string;
      email: string;
      profile: string;
    };
    if (client.employeeId) {
      employee = await this.databaseService.employee.findFirst({
        where: {
          id: client.employeeId,
        },
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          profile: true,
        },
      });
    }
    return this.notificationService.sendNotification(
      '/employee',
      'canUSBOpen',
      'requestUSBOpen',
      { deviceId: client.deviceId, employee },
    );
  }

  async unlockUSB(
    client: CustomEmployeeSocketClient,
    unlockUSBDto: UnlockUSBDto,
  ) {
    const canUnlockUsb = client.rooms.has('canOpenUSB');
    if (!canUnlockUsb) {
      return client.emit('unlockUSBError', {
        message: 'You are not allowed to perform this action',
      });
    }
    const allSocket: any = await this.notificationService.server
      .of('employee')
      .in('employee-device-' + unlockUSBDto.deviceId)
      .fetchSockets();
    if (allSocket.length === 0) {
      return client.emit('unlockUSBError', {
        message: 'Device is offline',
      });
    }
    const device = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: unlockUSBDto.deviceId,
      },
    });
    const giveDevice: any = device;
    giveDevice.isUSBOpen = unlockUSBDto.isOpen;
    giveDevice.isOnline = true;
    allSocket[0].isUSBOpen = unlockUSBDto.isOpen;
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'unlockedUSB',
      giveDevice,
    );
    return this.notificationService.sendNotification(
      '/employee',
      'employee-device-' + unlockUSBDto.deviceId,
      'unlockUSB',
      { isUnlocked: unlockUSBDto.isOpen },
    );
  }

  async unlockPaswordUSB(client: CustomEmployeeSocketClient, password: string) {
    const USBPassword = await this.databaseService.platformOptions.findFirst({
      where: {
        key: 'USBPassword',
      },
    });
    if (password === USBPassword.valueText) {
      const device = await this.databaseService.employeeDevices.findFirst({
        where: {
          id: client.deviceId,
        },
        include: {
          Employee: {
            include: {
              Employee: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
        },
      });
      if (!device) {
        return client.emit('unlockUSBError', {
          message: 'Device not found',
        });
      }
      client.isUSBOpen = true;
      let giveDevice: any = device;
      giveDevice.isUSBOpen = true;
      giveDevice.isOnline = true;
      this.notificationService.sendNotification(
        '/employee',
        'canViewDevice',
        'unlockedUSB',
        giveDevice,
      );
      return client.emit('unlockUSB', { isUnlocked: true });
    }
  }

  async allowEmployeeToDevice(
    client: CustomEmployeeSocketClient,
    employeeToDeviceAllowDto: EmployeeToDeviceAllowDto,
  ) {
    const canAllowEmployeeToDevice = client.rooms.has(
      'canAllowEmployeeToDevice',
    );
    if (canAllowEmployeeToDevice) {
      return client.emit('allowEmployeeToDeviceError', {
        message: 'You are not allowed to perform this action',
      });
    }
    const device = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: employeeToDeviceAllowDto.deviceId,
      },
    });
    if (!device) {
      return client.emit('allowEmployeeToDeviceError', {
        message: 'Device not found',
      });
    }
    const employee = await this.databaseService.employee.findFirst({
      where: {
        id: employeeToDeviceAllowDto.employeeId,
      },
    });
    if (!employee) {
      return client.emit('allowEmployeeToDeviceError', {
        message: 'Employee not found',
      });
    }
    if (!device.isAllowed) {
      return client.emit('allowEmployeeToDeviceError', {
        message: 'Device is not allowed',
      });
    }
    let employeeToDevice =
      await this.databaseService.employeeToDevice.findFirst({
        where: {
          deviceId: device.id,
          employeeId: employee.id,
        },
        include: {
          Employee: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
              profile: true,
            },
          },
        },
      });

    employeeToDevice = await this.databaseService.employeeToDevice.update({
      where: {
        employeeId_deviceId: {
          deviceId: device.id,
          employeeId: employee.id,
        },
      },
      data: {
        isAllowed: employeeToDeviceAllowDto.allow,
      },
      include: {
        Employee: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            profile: true,
          },
        },
      },
    });
    let givingEmployeeDevice: any = employeeToDevice;
    givingEmployeeDevice.isOnline = false;
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'employeeToDeviceAllowedChanged',
      givingEmployeeDevice,
    );
    const allowedChangedDevice = await this.notificationService.server
      .of('/employee')
      .in('employee-device-' + device.id)
      .fetchSockets();
    if (allowedChangedDevice.length > 0) {
      this.notificationService.sendNotification(
        '/employee',
        'employee-device-' + device.id,
        'employeeToDeviceSelfAllowedChanged',
        employeeToDevice.isAllowed,
      );
      if (!device.isAllowed) {
        allowedChangedDevice[0].disconnect();
      }
    }
  }

  async changeDeviceType(
    client: CustomEmployeeSocketClient,
    changeDeviceTypeDto: ChangeDeviceTypeDto,
  ) {
    const canChangeDeviceType = client.rooms.has('canChangeDeviceType');
    if (!canChangeDeviceType) {
      return client.emit('changeDeviceTypeError', {
        message: 'You are not allowed to perform this action',
      });
    }
    const device = await this.databaseService.employeeDevices.update({
      where: {
        id: changeDeviceTypeDto.deviceId,
      },
      data: {
        type: changeDeviceTypeDto.type,
      },
      include: {
        Employee: {
          include: {
            Employee: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });
    let giveDevice: any = device;
    const isEmployeeOnline = await this.notificationService.server
      .of('employee')
      .in('growth-manager-devices')
      .fetchSockets();
    const deviceClient: any = isEmployeeOnline.find(
      (x: any) => x.deviceId === device.id,
    );
    giveDevice.isUSBOpen = deviceClient?.isUSBOpen ? true : false;
    giveDevice.isOnline = deviceClient ? true : false;
    for (const employee of device.Employee) {
      const isDeviceEmployeeOnline =
        deviceClient?.employeeId === employee.employeeId;
      const givenEmployee: any = employee;
      givenEmployee.isOnline = isDeviceEmployeeOnline;
      giveDevice.Employee = [];
      giveDevice.Employee.push(employee);
    }
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'deviceTypeChanged',
      giveDevice,
    );
    this.notificationService.sendNotification(
      '/employee',
      `employee-device-${device.id}`,
      'deviceSelfTypeChanged',
      { deviceType: device.type },
    );
  }

  async requestAllowDevice(client: CustomEmployeeSocketClient) {
    const device = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: client.deviceId,
      },
    });
    if (!device) {
      return client.emit('requestAllowDeviceError', {
        message: 'Device not found',
      });
    }
    if (device.isAllowed) {
      return client.emit('requestAllowDeviceError', {
        message: 'Device is already allowed',
      });
    }
    await this.notificationService.sendNotification(
      '/employee',
      'canAllowDevice',
      'requestAllowDevice',
      { device },
    );
  }

  async requestAllowEmployeeToDevice(
    client: CustomEmployeeSocketClient,
    employeeId: number,
  ) {
    const device = await this.databaseService.employeeDevices.findFirst({
      where: {
        id: client.deviceId,
      },
    });
    if (!device) {
      return client.emit('requestAllowEmployeeToDeviceError', {
        message: 'Device not found',
      });
    }
    if (!device.isAllowed) {
      return client.emit('requestAllowEmployeeToDeviceError', {
        message: 'Device is not allowed',
      });
    }
    const employee = await this.databaseService.employee.findFirst({
      where: {
        id: employeeId,
      },
    });
    if (!employee) {
      return client.emit('requestAllowEmployeeToDeviceError', {
        message: 'Employee not found',
      });
    }
    await this.notificationService.sendNotification(
      '/employee',
      'canAllowEmployeeToDevice',
      'requestAllowEmployeeToDevice',
      { device, employee },
    );
  }

  async getDevices(client: CustomEmployeeSocketClient) {
    const canViewDevice = client.rooms.has('canViewDevice');
    if (!canViewDevice) {
      return;
    }
    const devices = await this.databaseService.employeeDevices.findMany({
      include: {
        Employee: {
          include: {
            Employee: {
              select: {
                fname: true,
                lname: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    const isEmployeeOnline = await this.notificationService.server
      .of('employee')
      .in('growth-manager-devices')
      .fetchSockets();
    for (const device of devices) {
      const givenDevice: any = device;
      const deviceClient: any = isEmployeeOnline.find(
        (x: any) => x.deviceId === device.id,
      );
      givenDevice.isUSBOpen = deviceClient?.isUSBOpen ? true : false;
      givenDevice.isOnline = deviceClient ? true : false;

      for (const employee of device.Employee) {
        const isDeviceEmployeeOnline =
          deviceClient?.employeeId === employee.employeeId;
        const givenEmployee: any = employee;
        givenEmployee.isOnline = isDeviceEmployeeOnline;
      }
    }
    client.emit('allDevices', devices);
  }

  async changeDeviceName(
    client: CustomEmployeeSocketClient,
    changeEmployeeDeviceNameDto: ChangeEmployeeDeviceNameDTO,
  ) {
    const canChangeDeviceName = client.rooms.has('canChangeDeviceName');
    if (!canChangeDeviceName) {
      return client.emit('changeDeviceNameError', {
        message: 'You are not allowed to perform this action',
      });
    }
    const device = await this.databaseService.employeeDevices.update({
      where: {
        id: changeEmployeeDeviceNameDto.deviceId,
      },
      data: {
        name: changeEmployeeDeviceNameDto.deviceName,
      },
      include: {
        Employee: {
          include: {
            Employee: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'deviceNameChanged',
      device,
    );
    this.notificationService.sendNotification(
      '/employee',
      `employee-device-${device.id}`,
      'deviceSelfNameChanged',
      { deviceName: device.name },
    );
  }
}
