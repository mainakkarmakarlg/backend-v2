import { Injectable } from '@nestjs/common';
import { CustomEmployeeSocketClient } from 'src/common/interface/custom-socket-employee-client.interface';
import { DatabaseService } from 'src/database/database.service';
import { NotificationService } from 'src/notification/notification.service';
import { LeadStatusDto } from './dto/lead-status-save.dto';

@Injectable()
export class LeadService {
  async saveInteractionCall(client: CustomEmployeeSocketClient, data: any) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }
    const newLead = await this.databaseService.userLead.create({
      data: {
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        countryCode: data.countryCode,
        status: 'new',
        action: 'follow-up',
        city: data.city,
      },
    });
    const leadInteraction =
      await this.databaseService.userLeadInteraction.create({
        data: {
          employeeId: client.employeeId,
          isDone: true,
          isIncomming: true,
        },
      });
    const leadActivity = await this.databaseService.userLeadActivity.create({
      data: {
        leadId: newLead.id,
        interactionId: leadInteraction.id,
      },
    });
    return client.emit('interactionCallSaved', { success: true });
  }
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async newInteractionCall(client: CustomEmployeeSocketClient, data: any) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }
    console.log('New interaction call data:', data);
    const lead = await this.databaseService.userLead.findFirst({
      where: {
        id: Number(data.leadId),
      },
    });
    const leadInteraction =
      await this.databaseService.userLeadInteraction.create({
        data: {
          employeeId: client.employeeId,
        },
      });
    const leadActivity = await this.databaseService.userLeadActivity.create({
      data: {
        leadId: lead.id,
        interactionId: leadInteraction.id,
      },
    });
    const leadInfo = await this.databaseService.userLead.findFirst({
      where: {
        id: Number(data.leadId),
      },
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
        UserActivity: {
          include: {
            ContactForm: true,
            Cart: {
              include: {
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
                    },
                  },
                },
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: true,
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
                ExtraOptions: {
                  include: {
                    ExtraOption: true,
                  },
                },
              },
            },
            Payment: {
              include: {
                Gatway: true,
                Cart: {
                  include: {
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
                        },
                      },
                    },
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: {
                                      include: {
                                        Product: true,
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
                    ExtraOptions: {
                      include: {
                        ExtraOption: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phone: true,
                countryCode: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            Interaction: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    return client.emit('leadInfo', leadInfo);
  }

  async getLeadDropDownContent(client: CustomEmployeeSocketClient) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }

    const downdownContent =
      await this.databaseService.platformOptions.findFirst({
        where: {
          key: 'leadDropDownData',
          platformId: client.platformId,
        },
      });
    return client.emit('leadDropDownContent', downdownContent);
  }

  async searchLead(client: CustomEmployeeSocketClient, searchText: string) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }
    const lead = await this.databaseService.userLead.findFirst({
      where: {
        OR: [
          {
            email: searchText,
          },
          {
            phone: searchText,
          },
        ],
      },
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
        LeadSource: true,
      },
    });
    if (!lead) {
      return client.emit('SearchString', {
        message: 'No lead found with the provided email or phone number.',
      });
    }
    return client.emit('SearchString', lead);
  }

  async getLeadInfo(client: CustomEmployeeSocketClient, leadId: any) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }
    const leadInfo = await this.databaseService.userLead.findFirst({
      where: {
        id: leadId,
      },
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
        UserActivity: {
          include: {
            ContactForm: true,
            Cart: {
              include: {
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
                    },
                  },
                },
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: true,
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
                ExtraOptions: {
                  include: {
                    ExtraOption: true,
                  },
                },
              },
            },
            Payment: {
              include: {
                Gatway: true,
                Cart: {
                  include: {
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
                        },
                      },
                    },
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: {
                                      include: {
                                        Product: true,
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
                    ExtraOptions: {
                      include: {
                        ExtraOption: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phone: true,
                countryCode: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            Interaction: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    return client.emit('leadInfo', leadInfo);
  }

  async getLead(client: CustomEmployeeSocketClient) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return client.emit('error', 'You are not allowed to view leads');
    }
    let existingLeads = await this.databaseService.userLead.findMany({
      where: {
        employeeId: client.employeeId,
      },
    });
    if (existingLeads.length > 0) {
      for (const lead of existingLeads) {
        let existingInteraction =
          await this.databaseService.userLeadInteraction.findFirst({
            where: {
              employeeId: client.employeeId,
              isDone: null,
            },
          });
        if (!existingInteraction) {
          const leadInteraction =
            await this.databaseService.userLeadInteraction.create({
              data: {
                employeeId: client.employeeId,
              },
            });
          await this.databaseService.userLeadActivity.create({
            data: {
              leadId: lead.id,
              interactionId: leadInteraction.id,
            },
          });
        }
      }
      existingLeads = await this.databaseService.userLead.findMany({
        where: {
          employeeId: client.employeeId,
        },
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
          LeadSource: true,
        },
      });
      for (const lead of existingLeads) {
        client.rooms.add('employeeLeadWatching-' + lead.id);
      }
      return client.emit('lead', existingLeads);
    }
    for (let i = 0; i < 10; i++) {
      await this.databaseService.$transaction(async (tx) => {
        let hierarchy = 0;
        while (true) {
          const leadSource = await tx.employeeToLeadSource.findFirst({
            where: {
              employeeId: client.employeeId,
              hierarchy: hierarchy ? hierarchy : undefined,
            },
            orderBy: {
              hierarchy: 'desc',
            },
          });
          if (!leadSource) {
            if (hierarchy > 0) {
              hierarchy = hierarchy - 1;
              continue;
            } else {
              break;
            }
          }
          hierarchy = leadSource.hierarchy;
          const lead = await tx.userLead.findFirst({
            where: {
              status: {
                notIn: ['converted', 'abuse', 'fake'],
              },
              sourceId: leadSource.sourceId,
              action: {
                in: ['Call', 'call'],
              },
              employeeId: null,
              OR: [
                {
                  NOT: {
                    UserActivity: {
                      none: {
                        Interaction: {},
                      },
                    },
                  },
                },
                {
                  UserActivity: {
                    some: {
                      Interaction: {
                        createdAt: {
                          lt: new Date(
                            new Date().setHours(0, 0, 0, 0) -
                              5 * 60 * 60 * 1000 -
                              30 * 60 * 1000,
                          ),
                        },
                      },
                    },
                  },
                },
              ],
            },
            orderBy: {
              createdAt: 'asc',
            },
          });
          if (lead) {
            await tx.userLead.update({
              where: {
                id: lead.id,
              },
              data: {
                employeeId: client.employeeId,
              },
            });
            break;
          }
          if (hierarchy === 0) {
            break;
          }
          hierarchy = hierarchy - 1;
        }
      });
    }
    let leads = await this.databaseService.userLead.findMany({
      where: {
        employeeId: client.employeeId,
      },
    });
    if (leads.length > 0) {
      for (const lead of leads) {
        const leadInteraction =
          await this.databaseService.userLeadInteraction.create({
            data: {
              employeeId: client.employeeId,
            },
          });
        const leadActivity = await this.databaseService.userLeadActivity.create(
          {
            data: {
              leadId: lead.id,
              interactionId: leadInteraction.id,
            },
          },
        );
      }
    }
    leads = await this.databaseService.userLead.findMany({
      where: {
        employeeId: client.employeeId,
      },
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
        LeadSource: true,
      },
    });
    for (const lead of leads) {
      client.rooms.add('employeeLeadWatching-' + lead.id);
    }
    return client.emit('lead', leads);
  }

  async checkNewContactForm(contactFormId: number, platformId: number) {
    const leadSource = await this.databaseService.leadSource.findFirst({
      where: {
        name: 'LandingPage',
      },
    });
    if (!leadSource) {
      return;
    }
    const contactForm = await this.databaseService.userContactForm.findFirst({
      where: {
        id: contactFormId,
      },
      include: {
        CourseNdPlatform: true,
      },
    });
    let lead = await this.databaseService.userLead.findFirst({
      where: {
        status: {
          notIn: ['converted', 'abuse', 'fake'],
        },
        OR: [
          {
            email: contactForm.email,
          },
          {
            phone: contactForm.phone,
          },
          {
            UserActivity: {
              some: {
                OR: [
                  {
                    ContactForm: {
                      OR: [
                        {
                          email: contactForm.email,
                        },
                        {
                          phone: contactForm.phone,
                        },
                      ],
                    },
                  },
                  {
                    User: {
                      OR: [
                        {
                          email: contactForm.email,
                        },
                        {
                          phone: contactForm.phone,
                        },
                      ],
                    },
                  },
                  {
                    Cart: {
                      User: {
                        OR: [
                          {
                            email: contactForm.email,
                          },
                          {
                            phone: contactForm.phone,
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
    });
    if (!lead) {
      const leadSource = await this.databaseService.leadSource.findFirst({
        where: {
          name: 'LandingPage',
        },
      });
      if (!leadSource) {
        return;
      }
      lead = await this.databaseService.userLead.create({
        data: {
          email: contactForm.email,
          phone: contactForm.phone,
          status: 'new',
          fname: contactForm.fname,
          lname: contactForm.lname,
          countryCode: contactForm.counrtyCode,
          action: 'Call',
          userId: contactForm.userId,
          priority: 1,
          sourceId: leadSource.id,
          platformId: platformId,
        },
      });
    } else {
      lead = await this.databaseService.userLead.update({
        where: {
          id: lead.id,
        },
        data: {
          userId: contactForm.userId,
          action: 'Call',
          platformId: platformId,
          priority: {
            increment: 1,
          },
        },
      });
    }
    for (const course of contactForm.CourseNdPlatform) {
      let leadCourse =
        await this.databaseService.userLeadToCourseNdProduct.findFirst({
          where: {
            leadId: lead.id,
            courseId: course.courseId,
          },
        });
      if (!leadCourse) {
        leadCourse =
          await this.databaseService.userLeadToCourseNdProduct.create({
            data: {
              leadId: lead.id,
              courseId: course.courseId,
            },
          });
      }
    }
    const activity = await this.databaseService.userLeadActivity.create({
      data: {
        leadId: lead.id,
        contactFormId: contactForm.id,
      },
    });

    const leadInfo = await this.databaseService.userLead.findFirst({
      where: {
        id: lead.id,
      },
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
        UserActivity: {
          include: {
            ContactForm: true,
            Cart: {
              include: {
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
                    },
                  },
                },
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: true,
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
                ExtraOptions: {
                  include: {
                    ExtraOption: true,
                  },
                },
              },
            },
            Payment: {
              include: {
                Gatway: true,
                Cart: {
                  include: {
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
                        },
                      },
                    },
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: {
                                      include: {
                                        Product: true,
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
                    ExtraOptions: {
                      include: {
                        ExtraOption: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phone: true,
                countryCode: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            Interaction: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    this.notificationService.sendNotification(
      '/employee',
      'employeeLeadWatching-' + lead.id,
      'newContactFormLeadChange',
      leadInfo,
    );
  }

  async checkNewSignup(userId: number, platformId: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
    });
    const messages = await this.databaseService.userContactForm.updateMany({
      where: {
        OR: [
          {
            email: user.email,
          },
          {
            phone: user.phone,
          },
        ],
      },
      data: {
        userId: userId,
      },
    });
    const userEvent = await this.databaseService.eventToUser.updateMany({
      where: {
        OR: [
          {
            email: user.email,
          },
          {
            phone: user.phone,
          },
        ],
      },
      data: {
        userId: userId,
      },
    });
    const leadSource = await this.databaseService.leadSource.findFirst({
      where: {
        name: 'NewSignup',
      },
    });
    if (!leadSource) {
      return;
    }
    let lead = await this.databaseService.userLead.findFirst({
      where: {
        status: {
          notIn: ['converted', 'abuse', 'fake'],
        },
        OR: [
          {
            email: user.email,
          },
          {
            phone: user.phone,
          },
          {
            UserActivity: {
              some: {
                OR: [
                  {
                    ContactForm: {
                      OR: [
                        {
                          email: user.email,
                        },
                        {
                          phone: user.phone,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });
    if (!lead) {
      lead = await this.databaseService.userLead.create({
        data: {
          email: user.email,
          phone: user.phone,
          fname: user.fname,
          lname: user.lname,
          countryCode: user.countryCode,
          status: 'new',
          sourceId: leadSource.id,
          userId: userId,
          platformId: platformId,
          action: 'Call',
          priority: 1,
        },
      });
    } else {
      let userActivity = await this.databaseService.userLeadActivity.findFirst({
        where: {
          leadId: lead.id,
          userId: userId,
        },
      });
      if (!userActivity) {
        userActivity = await this.databaseService.userLeadActivity.create({
          data: {
            leadId: lead.id,
            userId: userId,
          },
        });
      }
      lead = await this.databaseService.userLead.update({
        where: {
          id: lead.id,
        },
        data: {
          userId: userId,
          action: 'Call',
          sourceId: leadSource.id,
          platformId: platformId,
          priority: {
            increment: 1,
          },
        },
        include: {
          UserActivity: true,
        },
      });
      this.notificationService.sendNotification(
        '/employee',
        'employeeLeadWatching-' + lead.id,
        'newSignedUpLeadChange',
        lead,
      );
    }
  }

  async getCallingNumber(client: CustomEmployeeSocketClient) {
    const canViewClasses = client.rooms.has('canViewClasses');
    if (!canViewClasses) {
      return client.emit('error', 'You are not allowed to view classes');
    }
    const callingNumbers = await this.databaseService.employeeNumber.findMany({
      include: {
        Employee: {
          where: {
            endTime: null,
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
    client.emit('callingNumbers', callingNumbers);
  }

  async addEmployeeToNumber(
    client: CustomEmployeeSocketClient,
    numberId: number,
  ) {
    const employeeNumber = await this.databaseService.employeeNumber.findFirst({
      where: {
        id: numberId,
      },
    });
    if (!employeeNumber) {
      return client.emit('error', 'Employee number not found');
    }
    const employeeToNumber = await this.databaseService.employeeToNumber.create(
      {
        data: {
          employeeId: client.employeeId,
          numberId: employeeNumber.id,
          startTime: new Date(),
        },
      },
    );
    const employeeNumberToSend =
      await this.databaseService.employeeNumber.findFirst({
        where: {
          id: numberId,
        },
        include: {
          Employee: {
            where: {
              endTime: null,
            },
            take: 1,
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
    return this.notificationService.sendNotification(
      '/employee',
      'canViewLeads',
      'callingNumbersChanged',
      employeeNumberToSend,
    );
  }

  async removeEmployeeFromNumber(
    client: CustomEmployeeSocketClient,
    numberId: number,
  ) {
    const employeeNumber = await this.databaseService.employeeNumber.findFirst({
      where: {
        id: numberId,
      },
    });
    if (!employeeNumber) {
      return client.emit('error', 'Employee number not found');
    }
    const employeeToNumber =
      await this.databaseService.employeeToNumber.updateMany({
        where: {
          employeeId: client.employeeId,
          numberId: employeeNumber.id,
        },
        data: {
          endTime: new Date(),
        },
      });
  }

  async handleLeadEmployeeDisconnect(client: CustomEmployeeSocketClient) {
    const canViewLeads = client.rooms.has('canViewLeads');
    if (!canViewLeads) {
      return;
    }
    const activeNumbers = await this.databaseService.employeeToNumber.findMany({
      where: {
        employeeId: client.employeeId,
        endTime: null,
      },
    });
  }

  async checkNewCart(platformId: number, cartid: number) {
    const cart = await this.databaseService.userCart.findFirst({
      where: {
        id: cartid,
      },
      include: {
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phone: true,
            countryCode: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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
        },
        Product: {
          include: {
            Product: {
              include: {
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: true,
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
    const leadSource = await this.databaseService.leadSource.findFirst({
      where: {
        name: 'NewCart',
      },
    });
    if (!leadSource) {
      return;
    }
    let lead = await this.databaseService.userLead.findFirst({
      where: {
        status: {
          notIn: ['converted', 'abuse', 'fake'],
        },
        OR: [
          {
            email: cart.User.email,
          },
          {
            phone: cart.User.phone,
          },
          {
            UserActivity: {
              some: {
                OR: [
                  {
                    ContactForm: {
                      OR: [
                        {
                          email: cart.User.email,
                        },
                        {
                          phone: cart.User.email,
                        },
                      ],
                    },
                  },
                  {
                    User: {
                      OR: [
                        {
                          email: cart.User.email,
                        },
                        {
                          phone: cart.User.email,
                        },
                      ],
                    },
                  },
                  {
                    Cart: {
                      User: {
                        OR: [
                          {
                            email: cart.User.email,
                          },
                          {
                            phone: cart.User.email,
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
    });
    if (!lead) {
      lead = await this.databaseService.userLead.create({
        data: {
          email: cart.User.email,
          phone: cart.User.phone,
          fname: cart.User.fname,
          lname: cart.User.lname,
          countryCode: cart.User.countryCode,
          status: 'new',
          sourceId: leadSource.id,
          priority: 1,
          userId: cart.User.id,
          platformId: platformId,
          action: 'Call',
          UserActivity: {
            create: {
              cartId: cart.id,
            },
          },
        },
      });
    } else {
      let userActivity = await this.databaseService.userLeadActivity.findFirst({
        where: {
          leadId: lead.id,
          cartId: cart.id,
        },
      });
      if (!userActivity) {
        userActivity = await this.databaseService.userLeadActivity.create({
          data: {
            leadId: lead.id,
            cartId: cart.id,
          },
        });
      }
      lead = await this.databaseService.userLead.update({
        where: {
          id: lead.id,
        },
        data: {
          userId: cart.User.id,
          action: 'Call',
          sourceId: leadSource.id,
          platformId: platformId,
          priority: {
            increment: 1,
          },
        },
        include: {
          Platform: true,
        },
      });
      const leadInfo = await this.databaseService.userLead.findFirst({
        where: {
          id: lead.id,
        },
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
          UserActivity: {
            include: {
              ContactForm: true,
              Cart: {
                include: {
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
                      },
                    },
                  },
                  Product: {
                    include: {
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: true,
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
                  ExtraOptions: {
                    include: {
                      ExtraOption: true,
                    },
                  },
                },
              },
              Payment: {
                include: {
                  Gatway: true,
                  Cart: {
                    include: {
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
                          },
                        },
                      },
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: {
                                        include: {
                                          Product: true,
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
                      ExtraOptions: {
                        include: {
                          ExtraOption: true,
                        },
                      },
                    },
                  },
                },
              },
              User: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  phone: true,
                  countryCode: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              Interaction: {
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
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      this.notificationService.sendNotification(
        '/employee',
        'employeeLeadWatching-' + lead.id,
        'newContactFormLeadChange',
        leadInfo,
      );
    }
  }

  async createdPayment(platformId: number, paymentId: number) {
    const payment = await this.databaseService.userPayments.findFirst({
      where: {
        id: paymentId,
      },
      include: {
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phone: true,
            countryCode: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    let lead = await this.databaseService.userLead.findFirst({
      where: {
        status: {
          notIn: ['converted', 'abuse', 'fake'],
        },
        OR: [
          {
            email: payment.User.email,
          },
          {
            phone: payment.User.phone,
          },
          {
            UserActivity: {
              some: {
                OR: [
                  {
                    ContactForm: {
                      OR: [
                        {
                          email: payment.User.email,
                        },
                        {
                          phone: payment.User.email,
                        },
                      ],
                    },
                  },
                  {
                    User: {
                      OR: [
                        {
                          email: payment.User.email,
                        },
                        {
                          phone: payment.User.email,
                        },
                      ],
                    },
                  },
                  {
                    Cart: {
                      User: {
                        OR: [
                          {
                            email: payment.User.email,
                          },
                          {
                            phone: payment.User.email,
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
    });
    if (lead) {
      const leadActivity = await this.databaseService.userLeadActivity.create({
        data: {
          leadId: lead.id,
          paymentId: payment.id,
        },
      });
      lead = await this.databaseService.userLead.update({
        where: {
          id: lead.id,
        },
        data: {
          userId: payment.User.id,
          action: 'Call',
          sourceId: lead.sourceId,
          platformId: platformId,
          priority: {
            increment: 1,
          },
        },
        include: {
          Platform: true,
          UserActivity: true,
        },
      });
      const leadInfo = await this.databaseService.userLead.findFirst({
        where: {
          id: lead.id,
        },
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
          UserActivity: {
            include: {
              ContactForm: true,
              Cart: {
                include: {
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
                      },
                    },
                  },
                  Product: {
                    include: {
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: true,
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
                  ExtraOptions: {
                    include: {
                      ExtraOption: true,
                    },
                  },
                },
              },
              Payment: {
                include: {
                  Gatway: true,
                  Cart: {
                    include: {
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
                          },
                        },
                      },
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: {
                                        include: {
                                          Product: true,
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
                      ExtraOptions: {
                        include: {
                          ExtraOption: true,
                        },
                      },
                    },
                  },
                },
              },
              User: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  phone: true,
                  countryCode: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              Interaction: {
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
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      this.notificationService.sendNotification(
        '/employee',
        'employeeLeadWatching-' + lead.id,
        'newContactFormLeadChange',
        leadInfo,
      );
    }
  }

  async donePayment(platformId: number, paymentId: number) {
    const payment = await this.databaseService.userPayments.findFirst({
      where: {
        id: paymentId,
      },
      include: {
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phone: true,
            countryCode: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    let lead = await this.databaseService.userLead.findFirst({
      where: {
        status: {
          notIn: ['converted', 'abuse', 'fake'],
        },
        OR: [
          {
            email: payment.User.email,
          },
          {
            phone: payment.User.phone,
          },
          {
            UserActivity: {
              some: {
                OR: [
                  {
                    ContactForm: {
                      OR: [
                        {
                          email: payment.User.email,
                        },
                        {
                          phone: payment.User.phone,
                        },
                      ],
                    },
                  },
                  {
                    User: {
                      OR: [
                        {
                          email: payment.User.email,
                        },
                        {
                          phone: payment.User.phone,
                        },
                      ],
                    },
                  },
                  {
                    Cart: {
                      User: {
                        OR: [
                          {
                            email: payment.User.email,
                          },
                          {
                            phone: payment.User.phone,
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
    });
    if (lead) {
      const leadInfo = await this.databaseService.userLead.update({
        where: {
          id: lead.id,
        },
        data: {
          status: 'converted',
        },
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
          UserActivity: {
            include: {
              ContactForm: true,
              Cart: {
                include: {
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
                      },
                    },
                  },
                  Product: {
                    include: {
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: true,
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
                  ExtraOptions: {
                    include: {
                      ExtraOption: true,
                    },
                  },
                },
              },
              Payment: {
                include: {
                  Gatway: true,
                  Cart: {
                    include: {
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
                          },
                        },
                      },
                      Product: {
                        include: {
                          Product: {
                            include: {
                              Product: {
                                include: {
                                  Product: {
                                    include: {
                                      Product: {
                                        include: {
                                          Product: true,
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
                      ExtraOptions: {
                        include: {
                          ExtraOption: true,
                        },
                      },
                    },
                  },
                },
              },
              User: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  phone: true,
                  countryCode: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              Interaction: {
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
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      this.notificationService.sendNotification(
        '/employee',
        'employeeLeadWatching-' + lead.id,
        'newContactFormLeadChange',
        leadInfo,
      );
    }
  }

  async leadCourseChange(
    client: CustomEmployeeSocketClient,
    leadId: number,
    courseId: number,
  ) {
    let leadToCourse =
      await this.databaseService.userLeadToCourseNdProduct.findFirst({
        where: {
          leadId: leadId,
          courseId: courseId,
        },
      });
    if (leadToCourse) {
      const leadHistory = await this.databaseService.userLeadHistory.create({
        data: {
          leadId: leadId,
          valueText: courseId.toString(),
          key: 'remove course',
          employeeId: client.employeeId,
        },
      });
      leadToCourse =
        await this.databaseService.userLeadToCourseNdProduct.delete({
          where: {
            id: leadToCourse.id,
          },
        });
    } else {
      const leadHistory = await this.databaseService.userLeadHistory.create({
        data: {
          leadId: leadId,
          valueText: courseId.toString(),
          key: 'add course',
          employeeId: client.employeeId,
        },
      });
      leadToCourse =
        await this.databaseService.userLeadToCourseNdProduct.create({
          data: {
            leadId: leadId,
            courseId: courseId,
          },
        });
    }
    const leadInfo = await this.databaseService.userLead.findFirst({
      where: {
        id: leadId,
      },
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
        UserActivity: {
          include: {
            ContactForm: true,
            Cart: {
              include: {
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
                    },
                  },
                },
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: true,
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
                ExtraOptions: {
                  include: {
                    ExtraOption: true,
                  },
                },
              },
            },
            Payment: {
              include: {
                Gatway: true,
                Cart: {
                  include: {
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
                        },
                      },
                    },
                    Product: {
                      include: {
                        Product: {
                          include: {
                            Product: {
                              include: {
                                Product: {
                                  include: {
                                    Product: {
                                      include: {
                                        Product: true,
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
                    ExtraOptions: {
                      include: {
                        ExtraOption: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phone: true,
                countryCode: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            Interaction: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    this.notificationService.sendNotification(
      '/employee',
      'employeeLeadWatching-' + leadId,
      'newContactFormLeadChange',
      leadInfo,
    );
  }

  async leadCallStart(
    client: CustomEmployeeSocketClient,
    interactionId: number,
  ) {
    const leadInteraction =
      await this.databaseService.userLeadInteraction.findFirst({
        where: {
          id: interactionId,
        },
      });
    if (!leadInteraction) {
      return client.emit('error', 'Lead interaction not found');
    }
    if (leadInteraction.callDialTime) {
      return client.emit('error', 'Call already started');
    }
    const updateCall = await this.databaseService.userLeadInteraction.update({
      where: {
        id: leadInteraction.id,
      },
      data: {
        callDialTime: new Date(),
      },
    });
    return client.emit('leadCallStart', leadInteraction);
  }

  async leadCallPickUP(
    client: CustomEmployeeSocketClient,
    interactionId: number,
  ) {
    const leadInteraction =
      await this.databaseService.userLeadInteraction.findFirst({
        where: {
          id: interactionId,
        },
      });
    if (!leadInteraction) {
      return client.emit('error', 'Lead interaction not found');
    }
    if (leadInteraction.callUpTime) {
      return client.emit('error', 'Call already picked up');
    }
    if (!leadInteraction.callDialTime) {
      return client.emit('error', 'Call not started');
    }
    const updateCall = await this.databaseService.userLeadInteraction.update({
      where: {
        id: leadInteraction.id,
      },
      data: {
        callUpTime: new Date(),
      },
    });
    return client.emit('leadCallPickUP', leadInteraction);
  }

  async leadCallEnd(client: CustomEmployeeSocketClient, interactionId: number) {
    const leadInteraction =
      await this.databaseService.userLeadInteraction.findFirst({
        where: {
          id: interactionId,
        },
      });
    if (!leadInteraction) {
      return client.emit('error', 'Lead interaction not found');
    }
    if (leadInteraction.callEndTime) {
      return client.emit('error', 'Call already ended');
    }
    if (!leadInteraction.callDialTime) {
      return client.emit('error', 'Call not started');
    }
    const updateCall = await this.databaseService.userLeadInteraction.update({
      where: {
        id: leadInteraction.id,
      },
      data: {
        callEndTime: new Date(),
      },
    });
    return client.emit('leadCallEnd', leadInteraction);
  }

  async leadNotConnected(
    client: CustomEmployeeSocketClient,
    interactionId: number,
  ) {
    const interaction =
      await this.databaseService.userLeadInteraction.findFirst({
        where: {
          id: interactionId,
        },
      });
    if (!interaction) {
      return client.emit('error', 'Lead interaction not found');
    }
    if (interaction.callEndTime) {
      return client.emit('error', 'Call already ended');
    }
    if (!interaction.callDialTime) {
      return client.emit('error', 'Call not started');
    }
    const updateCall = await this.databaseService.userLeadInteraction.update({
      where: {
        id: interaction.id,
      },
      data: {
        callEndTime: new Date(),
        isConnected: false,
        mode: 'Call',
      },
    });
    return client.emit('leadNotConnected', updateCall);
  }

  // async dissmissLead(
  //   client: CustomEmployeeSocketClient,
  //   interactionId: number,
  // ) {
  //   const interaction =
  //     await this.databaseService.userLeadInteraction.findFirst({
  //       where: {
  //         id: interactionId,
  //       },
  //     });
  //   if (!interaction) {
  //     return client.emit('error', 'Lead interaction not found');
  //   }
  //   if (interaction.callEndTime) {
  //     return client.emit('error', 'Call already ended');
  //   }
  //   if (!interaction.callDialTime) {
  //     return client.emit('error', 'Call not started');
  //   }
  //   const updateCall = await this.databaseService.userLeadInteraction.update({
  //     where: {
  //       id: interaction.id,
  //     },
  //     data: {
  //       callEndTime: new Date(),
  //       mode: 'dismiss',
  //     },
  //   });
  //   return client.emit('leadDissmissed', updateCall);
  // }

  async leadStatusSave(
    client: CustomEmployeeSocketClient,
    leadStatusSaveDto: LeadStatusDto,
  ) {
    const leadInteraction =
      await this.databaseService.userLeadInteraction.findFirst({
        where: {
          id: leadStatusSaveDto.interactionId,
        },
        include: {
          LeadActivity: true,
        },
      });
    if (!leadInteraction) {
      return client.emit('error', 'Lead interaction not found');
    }
    const lead = await this.databaseService.userLead.findFirst({
      where: {
        id: leadInteraction.LeadActivity[0].leadId,
      },
    });

    if (!lead) {
      return client.emit('error', 'Lead not found');
    }
    const leadHistory = await this.databaseService.userLeadHistory.create({
      data: {
        leadId: lead.id,
        valueText: leadStatusSaveDto.leadRemarks,
        key: 'lead status change',
        employeeId: client.employeeId,
      },
    });
    const updatedInteraction =
      await this.databaseService.userLeadInteraction.update({
        where: {
          id: leadInteraction.id,
        },
        data: {
          status: leadStatusSaveDto.leadStatus,
          remarks: leadStatusSaveDto.leadRemarks,
          employeeId: client.employeeId,
          isDone: true,
        },
      });
    const updatedLead = await this.databaseService.userLead.update({
      where: {
        id: lead.id,
      },
      data: {
        action: 'followup',
        employeeId: null,
        status: leadStatusSaveDto.leadStatus,
        countryCode: leadStatusSaveDto.countryCode,
      },
      include: {
        Platform: true,
        UserActivity: true,
      },
    });

    client.emit('onSaveLead', updatedLead);
  }
}
