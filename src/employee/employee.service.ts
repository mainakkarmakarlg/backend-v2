import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CustomEmployeeSocketClient } from 'src/common/interface/custom-socket-employee-client.interface';
import { NotificationService } from 'src/notification/notification.service';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { v4 as uuidv4 } from 'uuid';
import { GetPaymentsDto } from './dto/get-payments.dto';
import { DeviceService } from '../device/device.service';
@Injectable()
export class EmployeeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
    private readonly deviceService: DeviceService,
  ) {}

  async getSampleLead(client: CustomEmployeeSocketClient, data: any) {
    const lead = await this.databaseService.userLead.findMany({
      include: {
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            profile: true,
            countryCode: true,
            phone: true,
            Meta: true,
          },
        },
        LeadSource: true,
        Course: {
          include: {
            Course: {
              include: {
                Course: {
                  include: {
                    Course: {
                      include: {
                        Course: {
                          include: {
                            Course: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    client.emit('getsamplelead', lead);
  }

  async getUser(client: CustomEmployeeSocketClient, number: number) {
    const canView = client.rooms.has('canViewStudentData');
    if (canView) {
      const users = await this.databaseService.user.findMany({
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          profile: true,
          countryCode: true,
          phone: true,
        },
      });
      client.emit('users', users);
    }
  }

  async userLeads(client: CustomEmployeeSocketClient) {
    const canView = client.rooms.has('canViewStudentData');
    if (canView) {
      let startDate = new Date();
      let endDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      startDate = new Date(startDate.getTime() + IST_OFFSET);
      endDate = new Date(endDate.getTime() + IST_OFFSET);
      const users = await this.databaseService.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          profile: true,
        },
      });
      const userForm = await this.databaseService.userContactForm.findMany({
        where: {
          userId: null,
        },
      });
      client.emit('classes', users, userForm);
    }
  }

  async getPayments(
    client: CustomEmployeeSocketClient,
    getPaymentsDto: GetPaymentsDto,
  ) {
    const canGetPayments = client.rooms.has('canViewPayments');
    if (!canGetPayments) {
      return client.emit('getPaymentsError', {
        message: 'You are not allowed to view payments',
      });
    }
    let startDate = new Date();
    let endDate = new Date();
    if (getPaymentsDto.startDate) {
      startDate = new Date(getPaymentsDto.startDate);
    }
    if (getPaymentsDto.endDate) {
      endDate = new Date(getPaymentsDto.endDate);
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    startDate = new Date(startDate.getTime() + IST_OFFSET);
    endDate = new Date(endDate.getTime() + IST_OFFSET);
    const users = await this.databaseService.user.findMany({
      where: {
        UserPayment: {
          some: {
            createdAt: {
              gte: getPaymentsDto.startDate,
              lte: getPaymentsDto.endDate,
            },
          },
        },
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        profile: true,
        UserPayment: {
          where: {
            createdAt: {
              gte: getPaymentsDto.startDate,
              lte: getPaymentsDto.endDate,
            },
          },
          include: {
            Cart: {
              include: {
                ExtraOptions: {
                  include: {
                    ExtraOption: {
                      include: {
                        Option: true,
                      },
                    },
                  },
                },
                Course: {
                  select: {
                    Course: {
                      include: {
                        Meta: true,
                        Course: {
                          include: {
                            Meta: true,
                            Course: {
                              include: {
                                Meta: true,
                                Course: {
                                  include: {
                                    Meta: true,
                                    Course: {
                                      include: {
                                        Meta: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const sortedUsers = users.sort((a, b) => {
      return (
        b.UserPayment[0]?.createdAt.getTime() -
        a.UserPayment[0]?.createdAt.getTime()
      );
    });
    client.emit('getPayments', sortedUsers);
  }

  async employeeBreak(client: CustomEmployeeSocketClient) {
    if (client.breakId) {
      let employeeBreak =
        await this.databaseService.employeeAttandenceBreak.findFirst({
          where: {
            id: client.breakId,
          },
        });
      if (employeeBreak.breakEnd) {
        return client.emit('break-end-error', {
          message: 'Break already ended',
        });
      } else {
        employeeBreak =
          await this.databaseService.employeeAttandenceBreak.update({
            where: {
              id: client.breakId,
            },
            data: {
              breakEnd: new Date(),
            },
          });
        client.breakId = null;
        return client.emit('break-end-success', {
          message: 'Break ended successfully',
        });
      }
    } else {
      let employeeBreak =
        await this.databaseService.employeeAttandenceBreak.findFirst({
          where: {
            attandenceId: client.attendanceId,
            breakEnd: null,
          },
        });
      if (employeeBreak) {
        return client.emit('break-start-error', {
          message: 'Break already started',
        });
      }
      employeeBreak = await this.databaseService.employeeAttandenceBreak.create(
        {
          data: {
            attandenceId: client.attendanceId,
            breakStart: new Date(),
          },
        },
      );
      client.breakId = employeeBreak.id;
      return client.emit('break-start-success', {
        message: 'Break started successfully',
      });
    }
  }

  async initializeConnection(client: CustomEmployeeSocketClient) {
    if (client.handshake.headers.dauth === undefined) {
      return client.disconnect();
    }
    const platForm = await this.databaseService.platform.findFirst({
      where: {
        OR: [
          {
            origin: client.handshake.headers.origin,
          },
          {
            auth: client.handshake.headers.dauth,
          },
        ],
      },
    });
    if (!platForm || platForm.name !== 'Growth Manager') {
      return client.disconnect();
    }
    client.platformId = platForm.id;
    const deviceId: string = client.handshake.query.deviceId.toString();
    await this.deviceService.getEmployeeDevice(
      client,
      deviceId,
      platForm.id,
      platForm.version,
    );
  }

  async giveEmployee(client: CustomEmployeeSocketClient, data: any) {
    const employees = await this.databaseService.employee.findMany({});
    client.emit('hierarchy', employees);
  }

  checkForBreak(client: CustomEmployeeSocketClient) {
    if (client.breakId) {
      return client.emit('break', { break: true });
    } else {
      return client.emit('break', { break: false });
    }
  }

  async login(
    client: CustomEmployeeSocketClient,
    loginEmployeeDto: LoginEmployeeDto,
  ) {
    const employee = await this.databaseService.employee.findFirst({
      where: {
        email: loginEmployeeDto.email,
      },
      include: {
        Personal: true,
        Work: true,
      },
    });

    if (!employee) {
      return client.emit('loginError', { message: 'employee not found' });
    }
    if (employee.password !== loginEmployeeDto.password) {
      return client.emit('loginError', { message: 'password incorrect' });
    }
    const deviceToEmployee = await this.deviceService.isDeviceAllowed(
      client.deviceId,
      employee.id,
    );
    if (!deviceToEmployee) {
      return client.emit('loginError', {
        message: 'employee not allowed on this device',
      });
    }
    const onlineSockets = await this.notificationService.server
      .of('/employee')
      .in('online_employee')
      .fetchSockets();
    if (
      onlineSockets.some((socket: any) => {
        return socket.employeeId === employee.id;
      })
    ) {
      return client.emit('loginError', {
        message: 'Please Logout from other devices to login here',
      });
    }
    client.join('online_employee');
    client.employeeId = employee.id;
    let attendance = await this.databaseService.employeeAttandence.findFirst({
      where: {
        employeeId: employee.id,
        checkOut: null,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    if (attendance) {
      client.attendanceId = attendance.id;
    } else {
      attendance = await this.databaseService.employeeAttandence.create({
        data: {
          employeeId: employee.id,
          deviceId: client.deviceId,
          checkIn: new Date(),
        },
      });
      client.attendanceId = attendance.id;
    }
    const employeeBreak =
      await this.databaseService.employeeAttandenceBreak.findFirst({
        where: {
          attandenceId: attendance.id,
          breakEnd: null,
        },
      });
    if (employeeBreak) {
      client.breakId = employeeBreak.id;
    } else {
      client.breakId = null;
    }
    client.emit('loginsuccess', { employee });
    const permissions = await this.databaseService.employeePermission.findMany({
      where: {
        permissionId: null,
        OR: [
          {
            OR: [
              {
                Employee: {
                  some: {
                    employeeId: employee.id,
                  },
                },
              },
              {
                Group: {
                  some: {
                    EmployeePermissionGroup: {
                      Employees: {
                        some: {
                          employeeId: employee.id,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
          {
            Permissions: {
              some: {
                OR: [
                  {
                    OR: [
                      {
                        Employee: {
                          some: {
                            employeeId: employee.id,
                          },
                        },
                      },
                      {
                        Group: {
                          some: {
                            EmployeePermissionGroup: {
                              Employees: {
                                some: {
                                  employeeId: employee.id,
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                  {
                    Permissions: {
                      some: {
                        OR: [
                          {
                            OR: [
                              {
                                Employee: {
                                  some: {
                                    employeeId: employee.id,
                                  },
                                },
                              },
                              {
                                Group: {
                                  some: {
                                    EmployeePermissionGroup: {
                                      Employees: {
                                        some: {
                                          employeeId: employee.id,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            ],
                          },
                          {
                            Permissions: {
                              some: {
                                OR: [
                                  {
                                    Employee: {
                                      some: {
                                        employeeId: employee.id,
                                      },
                                    },
                                  },
                                  {
                                    Group: {
                                      some: {
                                        EmployeePermissionGroup: {
                                          Employees: {
                                            some: {
                                              employeeId: employee.id,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        Permissions: {
          where: {
            OR: [
              {
                OR: [
                  {
                    Employee: {
                      some: {
                        employeeId: employee.id,
                      },
                    },
                  },
                  {
                    Group: {
                      some: {
                        EmployeePermissionGroup: {
                          Employees: {
                            some: {
                              employeeId: employee.id,
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
              {
                Permissions: {
                  some: {
                    OR: [
                      {
                        Employee: {
                          some: {
                            employeeId: employee.id,
                          },
                        },
                      },
                      {
                        Group: {
                          some: {
                            EmployeePermissionGroup: {
                              Employees: {
                                some: {
                                  employeeId: employee.id,
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
          include: {
            Permissions: {
              where: {
                OR: [
                  {
                    Employee: {
                      some: {
                        employeeId: employee.id,
                      },
                    },
                  },
                  {
                    Group: {
                      some: {
                        EmployeePermissionGroup: {
                          Employees: {
                            some: {
                              employeeId: employee.id,
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    });
    for (const permission of permissions) {
      client.join(permission.name);
      for (const permission1 of permission.Permissions) {
        client.join(permission1.name);
        for (const permission2 of permission1.Permissions) {
          client.join(permission2.name);
        }
      }
    }
    const employees = await this.databaseService.employee.findMany({
      where: {
        NOT: {
          id: employee.id,
          isActive: false,
        },
      },
    });
    const onlineEmployees = [];
    for (const givingemployee of employees) {
      const givenEmployee: any = givingemployee;
      givenEmployee.isOnline =
        onlineSockets.findIndex(
          (x: any) => x.employeeId === givingemployee.id,
        ) !== -1;
      onlineEmployees.push(givenEmployee);
    }

    const givingEmployee = {
      id: employee.id,
      fname: employee.fname,
      lname: employee.lname,
      email: employee.email,
      profile: employee.profile,
    };
    this.notificationService.sendNotification(
      '/employee',
      'online_employee',
      'cameOnline',
      { employee: givingEmployee },
    );
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'employeeLogin',
      { deviceToEmployee, employee: givingEmployee },
    );
    client.emit('onlineEmployees', onlineEmployees);
    client.emit('employeepermissions', { permissions });
  }

  async getEmployeeDetails(client: CustomEmployeeSocketClient) {
    const canView = client.rooms.has('canViewEmployee');
    if (canView) {
      const employees = await this.databaseService.employee.findMany({
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          profile: true,
          Personal: true,
          Work: true,
        },
      });
      const giveEmployee: object[] = [];
      const isEmployeeOnline = await this.notificationService.server
        .of('employee')
        .in('online_employee')
        .fetchSockets();
      for (const employee of employees) {
        const givenEmployee: any = employee;
        givenEmployee.isOnline =
          isEmployeeOnline.findIndex(
            (x: any) => x.employeeId === employee.id,
          ) !== -1;
        giveEmployee.push(employee);
      }
      client.emit('employeeDetails', giveEmployee);
    }
  }

  async changeEmployeePassword(
    client: CustomEmployeeSocketClient,
    password: string,
  ) {
    await this.databaseService.employee.update({
      where: {
        id: client.employeeId,
      },
      data: {
        password: password,
      },
    });
    client.emit('passwordChanged', { message: 'password changed' });
  }

  async logout(client: CustomEmployeeSocketClient) {
    client.disconnect();
  }

  async cleanupConnection(client: CustomEmployeeSocketClient) {
    if (client.employeeId) {
      const employee = await this.databaseService.employee.findFirst({
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
      const employeeToNumber =
        await this.databaseService.employeeToNumber.updateMany({
          where: {
            employeeId: client.employeeId,
            endTime: null,
          },
          data: {
            endTime: new Date(),
          },
        });
      const canViewLeads = client.rooms.has('canViewLeads');

      await this.notificationService.sendNotification(
        '/employee',
        'online_employee',
        'employeelogout',
        { employee },
      );
    }
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
    if (device) {
      const giveDevice: any = device;

      giveDevice.isOnline = false;
      giveDevice.isUSBOpen = false;
      this.notificationService.sendNotification(
        '/employee',
        'canViewDevice',
        'onlineDevice',
        giveDevice,
      );
    }

    if (client.attendanceId) {
      await this.databaseService.employeeAttandence.update({
        where: {
          id: client.attendanceId,
        },
        data: {
          checkOut: new Date(),
        },
      });
    }
    if (client.breakId) {
      await this.databaseService.employeeAttandenceBreak.update({
        where: {
          id: client.breakId,
        },
        data: {
          breakEnd: new Date(),
        },
      });
    }
  }

  async addEmployee(
    client: CustomEmployeeSocketClient,
    newEmployee: CreateEmployeeDto,
  ) {
    const canAddEmployee = client.rooms.has('EmployeeAdd');
    if (canAddEmployee) {
      const employee = await this.databaseService.employee.findFirst({
        where: {
          email: newEmployee.email,
        },
      });
      if (employee) {
        return client.emit('employeeCreateError', {
          message: 'Employee already exists',
        });
      } else {
        const createdEmployee = await this.databaseService.employee.create({
          data: {
            fname: newEmployee.fname,
            lname: newEmployee.lname,
            email: newEmployee.email,
            profile: newEmployee.profile,
            password: uuidv4(),
          },
        });
        client.emit('employeeCreated', {
          message: 'Employee created successfully',
        });
      }
    }
  }
}
