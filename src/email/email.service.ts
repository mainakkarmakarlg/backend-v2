import { Injectable, OnModuleInit } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import { MailTemplates } from './templates/paymentconfimation.template';

@Injectable()
export class EmailsService implements OnModuleInit {
  private apiInstance: brevo.TransactionalEmailsApi;
  mailTemplates: MailTemplates;
  async onModuleInit() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    const apikeys = brevo.TransactionalEmailsApiApiKeys.apiKey;
    this.apiInstance.setApiKey(apikeys, process.env.BREVO_API_KEY);
  }

  constructor() {
    this.mailTemplates = new MailTemplates();
  }

  async sendVefificationEmail(
    email: string,
    subject: string,
    token: string,
    name: string,
    templateId: number,
    sendername: string,
    senderemail: string,
  ) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = { email: senderemail, name: sendername };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = { email: token, fname: name };
    if (process.env.NODE_ENV !== 'development') {
      this.apiInstance.sendTransacEmail(sendSmtpEmail).then(
        (data) => {
          return data;
        },
        (error) => {
          console.error('Error in sending email', error);
        },
      );
    }
  }

  async sendEnrollmentConfirmationEmail(
    receiverName: string,
    receiverEmail: string,
    senderEmail: string,
    senderName: string,
    mailData: any,
    mailTemplateName: string,
  ) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: senderEmail, name: senderName };
    sendSmtpEmail.subject = 'Enrollment Confirmation';
    sendSmtpEmail.to = [{ email: receiverEmail, name: receiverName }];
    let mailTemplateFound = false;
    if (mailTemplateName === 'ClassPaymentconfirmation') {
      mailTemplateFound = true;
      sendSmtpEmail.htmlContent =
        this.mailTemplates.paymentClassesConfirmationTemplate(
          mailData.orderId,
          mailData.userFirstName,
          mailData.orderDate,
          mailData.productTable,
          mailData.shippingCharges,
          mailData.totalAmount,
          mailData.subtotal,
          mailData.studentFullName,
          mailData.studentEmail,
          mailData.studentPhone,
          mailData.shippingName,
          mailData.shippingPhone,
          mailData.shippingEmail,
          mailData.shippingAddress,
          mailData.shippingCity,
          mailData.shippingState,
          mailData.shippingPincode,
          mailData.shippingCountry,
          mailData.reductionCharge,
        );
    }
    if (process.env.NODE_ENV !== 'development') {
      this.apiInstance.sendTransacEmail(sendSmtpEmail).then(
        (data) => {
          return data;
        },
        (error) => {
          console.error('Error in sending email', error);
        },
      );
    }
  }

  async sendBrevoMail(
    receiverName: string,
    receiverEmail: string,
    senderEmail: string,
    senderName: string,
    templateId: number,
    params: object,
  ) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: senderEmail, name: senderName };
    sendSmtpEmail.to = [{ email: receiverEmail, name: receiverName }];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params;
    if (process.env.NODE_ENV !== 'development') {
      this.apiInstance.sendTransacEmail(sendSmtpEmail).then(
        (data) => {
          return console.log('Email sent successfully', data);
        },
        (error) => {
          console.error('Error in sending email', error);
        },
      );
    }
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    templateId: number,
    sendername: string,
    senderemail: string,
  ) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: senderemail, name: sendername };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = { fname: name };
    if (process.env.NODE_ENV !== 'development') {
      this.apiInstance.sendTransacEmail(sendSmtpEmail).then(
        (data) => {
          return data;
        },
        (error) => {
          console.error('Error in sending email', error);
        },
      );
    }
  }
  async sendIntrospectAnalysisMail(
    receiverName: string,
    receiverEmail: string,
    senderEmail: string,
    senderName: string,
    summary: string,
  ) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: senderEmail,
      name: senderName,
    };
    sendSmtpEmail.subject = 'Introspect Analysis Summary';

    sendSmtpEmail.to = [
      {
        email: receiverEmail,
        name: receiverName,
      },
    ];

    // sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.htmlContent = summary;
    // These params should match the variables used in your Brevo template
    sendSmtpEmail.params = {
      name: receiverName,
      summary,
    };
    if (process.env.NODE_ENV === 'development') {
      return 'mail will be sent to u ';
    }

    if (process.env.NODE_ENV !== 'development') {
      try {
        const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(response);
        return response;
      } catch (error) {
        console.error('Error sending introspect analysis email:', error);
      }
    }
  }
}
