import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Order } from '../../model/order.entity';
import { User } from '../../model/user.entity';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
require('dotenv').config();

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  ////////////////////////////////////////
  ///////////////////////////////////////////////
  //////// Send User Change Email /////////////////////
  ///////////////////////////////////////////////
  ////////////////////////////////////////

  async sendAdminUserChangeEmail(user: User, token: string, email: string) {
    const url = `${process.env.PORTAL_HOST_URL}changeEmail?token=${token}&email=${email}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'เปลี่ยนอีเมลบัญชี Shopdit',
        template: './changeEmail',
        context: {
          name: user.name,
          url,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendAdminUserChangeEmailSuccess(user: User) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'เปลี่ยนอีเมลบัญชี Shopdit สำเร็จ',
        template: './changeEmailSuccess',
        context: {
          name: user.name,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendThaiBulkError(tel) {
    await this.mailerService
      .sendMail({
        to: 'support@shopdit.com',
        from: 'Tech Team <support@shopdit.com>',
        subject: 'Thaibulk Error Notification',
        template: './error',
        context: {
          title: 'พบปัญหา Thaibulk SMS',
          subtitle: `จากเบอร์โทร ${tel} กรุณาตรวจสอบเครดิตบน Thaibulk SMS`,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  ////////////////////////////////////////
  ///////////////////////////////////////////////
  //////// Send User Change Password /////////////////////
  ///////////////////////////////////////////////
  ////////////////////////////////////////

  async sendAdminUserResetPassword(user: User, token: string) {
    const url = `${process.env.PORTAL_HOST_URL}resetPassword?token=${token}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'รีเซ็ตรหัสผ่านบัญชี Shopdit',
        template: './resetPassword',
        context: {
          name: user.name,
          url,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendAdminUserResetPasswordSuccess(user: User) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'เปลี่ยนรหัสผ่านบัญชี Shopdit สำเร็จ',
        template: './resetPasswordSuccess',
        context: {
          name: user.name,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  ////////////////////////////////////////
  ///////////////////////////////////////////////
  //////// Send User Verify Email /////////////////////
  ///////////////////////////////////////////////
  ////////////////////////////////////////

  async sendAdminUserEmailVerify(user: User, token: string) {
    const url = `${process.env.PORTAL_HOST_URL}verifyEmail?token=${token}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'กรุณายืนยันอีเมลบัญชี Shopdit ของคุณ',
        template: './verify',
        context: {
          name: user.name,
          url,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async saCreateMerchantSuccess(user: User, password: string) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'ยินดีต้อนรับสู่ Shopdit',
        template: './saCreateMerchantSuccess',
        context: {
          name: user.name,
          email: user.email,
          password,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendAdminUserEmailVerifySuccess(user: User) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'Support Team <support@shopdit.com>',
        subject: 'ยินดีต้อนรับสู่ Shopdit',
        template: './verifySuccess',
        context: {
          name: user.name,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  //////// Send New Order Merchant ///////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendNewOrderToMerchant(order: Order, locale: any) {
    const orderDate = new Date(order?.orderedAt);
    const orderDateFormat = orderDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

    if (order.merchant.email) {
      await this.mailerService
        .sendMail({
          to: order.merchant.email,
          from: '"Shopdit" <support@shopdit.com>',
          subject: `ได้รับคำสั่งซื้อ ${order?.merchant?.slug} หมายเลขคำสั่งซื้อ ${order.number}`,
          template: './newOrderMerchant',
          context: {
            merchantName: order?.merchant?.merchantTranslations?.find(
              (translation) => translation?.locale === locale,
            )?.name
              ? order?.merchant?.merchantTranslations?.find(
                  (translation) => translation?.locale === locale,
                )?.name
              : order?.merchant?.slug,
            orderNumber: order.number,
            orderDateFormat,
            channel: getChannel(order?.channel),
            customerFullName: order?.customer?.fullName,
            customerTel: order?.customer?.tel,
            customerAddress,
            orderShipment: 'ไม่มี',
            shipmentPrice: order?.invoice?.shipmentPrice,
            paymentMethod: getPaymentMethod(order?.invoice),
            paymentDateFormat: paymentDateFinal,
            orderItems: order?.orderItems,
            totalProductPrice: order?.invoice?.productPrice,
            discountPrice: order?.invoice?.productDiscountPrice,
            totalPrice: order?.invoice?.totalPrice,
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Error : ', err);
        });
    }
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  //////// Send New Order Customer ///////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendNewOrderToCustomer(order: Order, locale: any) {
    const orderDate = new Date(order?.orderedAt);
    const orderDateFormat = orderDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const baseUrl = `https://${order?.merchant?.slug}.${
      process.env.NODE_ENV === 'staging'
        ? 'staging.myshopdit.com'
        : 'myshopdit.com'
    }`;
    const orderUrl = baseUrl + `/me/orders/${order.number}`;
    const ordersUrl = baseUrl + '/me/orders';
    const contactUrl = baseUrl + '/terms-and-policies#contact-us';

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';
    const yearCreated = new Date(order?.merchant?.createdAt).getFullYear();

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ///////// Send Payment Merchant ////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendPaymentOrderToMerchant(order: Order, locale: any) {
    const orderDate = new Date(order?.orderedAt);
    const orderDateFormat = orderDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

    if (order.merchant.email) {
      await this.mailerService
        .sendMail({
          to: order.merchant.email,
          from: '"Shopdit" <support@shopdit.com>',
          subject: `ยืนยันการชำระเงิน ${order?.merchant?.slug} หมายเลขคำสั่งซื้อ ${order.number}`,
          template: './paymentOrderMerchant',
          context: {
            merchantName: order?.merchant?.merchantTranslations?.find(
              (translation) => translation?.locale === locale,
            )?.name
              ? order?.merchant?.merchantTranslations?.find(
                  (translation) => translation?.locale === locale,
                )?.name
              : order?.merchant?.slug,
            orderNumber: order.number,
            orderDateFormat,
            channel: getChannel(order?.channel),
            customerFullName: order?.customer?.fullName,
            customerTel: order?.customer?.tel,
            customerAddress,
            orderShipment: 'ไม่มี',
            shipmentPrice: order?.invoice?.shipmentPrice,
            paymentMethod: getPaymentMethod(order?.invoice),
            paymentDateFormat: paymentDateFinal,
            orderItems: order?.orderItems,
            totalProductPrice: order?.invoice?.productPrice,
            discountPrice: order?.invoice?.productDiscountPrice,
            totalPrice: order?.invoice?.totalPrice,
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Error : ', err);
        });
    }
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ///////// Send Payment Customer ////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendPaymentOrderToCustomer(order: Order, locale: any) {
    const ordeDate = new Date(order?.orderedAt);
    const ordeDateFormat = ordeDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const baseUrl = `https://${order?.merchant?.slug}.${
      process.env.NODE_ENV === 'staging'
        ? 'staging.myshopdit.com'
        : 'myshopdit.com'
    }`;
    const orderUrl = baseUrl + `/me/orders/${order.number}`;
    const ordersUrl = baseUrl + '/me/orders';
    const contactUrl = baseUrl + '/terms-and-policies#contact-us';

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';
    const yearCreated = new Date(order?.merchant?.createdAt).getFullYear();

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ///////// Send Cancel Merchant /////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendCancelOrderToMerchant(order: Order, locale: any) {
    const cancelDate = new Date(order?.cancelAt);
    const cancelDateFormat = cancelDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

    const getReason = (reason: any) => {
      switch (reason) {
        case 'editOrderDetail':
          return 'ต้องการแก้ไขรายละเอียดคำสั่งซื้อ';
        case 'changeAddress':
          return 'ต้องการเปลี่ยนที่อยู่ในการจัดส่ง';
        case 'changePayment':
          return 'ต้องการเปลี่ยนวิธีการชำระเงิน';
        case 'editCoupon':
          return 'ต้องการเพิ่ม/เปลี่ยนโค้ดส่วนลด';
        case 'paymentComplicated':
          return 'ขั้นตอนการชำระเงินซับซ้อนเกินไป';
        case 'notToBuy':
          return 'ไม่ต้องการซื้อสินค้านี้แล้ว';
        case 'sellerNotRespond':
          return 'ผู้ขายไม่ตอบสนองการสอบถามข้อมูล';
        case 'otherOrChangeYourMind':
          return 'อื่น ๆ หรือเปลี่ยนใจ';
        default:
          break;
      }
    };

    if (order.merchant.email) {
      await this.mailerService
        .sendMail({
          to: order.merchant.email,
          from: '"Shopdit" <support@shopdit.com>',
          subject: `คำสั่งซื้อถูกยกเลิก ${order?.merchant?.slug} หมายเลขคำสั่งซื้อ ${order.number}`,
          template: './cancelOrderMerchant',
          context: {
            merchantName: order?.merchant?.merchantTranslations?.find(
              (translation) => translation?.locale === locale,
            )?.name
              ? order?.merchant?.merchantTranslations?.find(
                  (translation) => translation?.locale === locale,
                )?.name
              : order?.merchant?.slug,
            orderNumber: order.number,
            cancelDateFormat,
            cancelReason: getReason(order?.cancelReason),
            channel: getChannel(order?.channel),
            customerFullName: order?.customer?.fullName,
            customerTel: order?.customer?.tel,
            customerAddress,
            orderShipment: 'ไม่มี',
            shipmentPrice: order?.invoice?.shipmentPrice,
            paymentMethod: getPaymentMethod(order?.invoice),
            paymentDateFormat: paymentDateFinal,
            orderItems: order?.orderItems,
            totalProductPrice: order?.invoice?.productPrice,
            discountPrice: order?.invoice?.productDiscountPrice,
            totalPrice: order?.invoice?.totalPrice,
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Error : ', err);
        });
    }
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ///////// Send Cancel Customer /////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendCancelOrderToCustomer(order: Order, locale: any) {
    const orderDate = new Date(order?.orderedAt);
    const orderDateFormat = orderDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const cancelDate = new Date(order?.cancelAt);
    const cancelDateFormat = cancelDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const baseUrl = `https://${order?.merchant?.slug}.${
      process.env.NODE_ENV === 'staging'
        ? 'staging.myshopdit.com'
        : 'myshopdit.com'
    }`;
    const orderUrl = baseUrl + `/me/orders/${order.number}`;
    const ordersUrl = baseUrl + '/me/orders';
    const contactUrl = baseUrl + '/terms-and-policies#contact-us';

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';
    const yearCreated = new Date(order?.merchant?.createdAt).getFullYear();

    const getChannel = (channel: any) => {
      switch (channel) {
        case 'mobileWebsite':
          return 'Mobile Website';
        case 'IosApp':
          return 'iOS Application';
        case 'AndroidApp':
          return 'Android Application';
        case 'desktopWebsite':
          return 'Desktop Website';
        case 'admin':
          return 'Admin Portal';
        default:
          break;
      }
    };

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

    const getReason = (reason: any) => {
      switch (reason) {
        case 'editOrderDetail':
          return 'ต้องการแก้ไขรายละเอียดคำสั่งซื้อ';
        case 'changeAddress':
          return 'ต้องการเปลี่ยนที่อยู่ในการจัดส่ง';
        case 'changePayment':
          return 'ต้องการเปลี่ยนวิธีการชำระเงิน';
        case 'editCoupon':
          return 'ต้องการเพิ่ม/เปลี่ยนโค้ดส่วนลด';
        case 'paymentComplicated':
          return 'ขั้นตอนการชำระเงินซับซ้อนเกินไป';
        case 'notToBuy':
          return 'ไม่ต้องการซื้อสินค้านี้แล้ว';
        case 'sellerNotRespond':
          return 'ผู้ขายไม่ตอบสนองการสอบถามข้อมูล';
        case 'otherOrChangeYourMind':
          return 'อื่น ๆ หรือเปลี่ยนใจ';
        default:
          break;
      }
    };
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  //////// Send Complete Merchant ////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendCompleteOrderToMerchant(order: Order, locale: any) {
    const completeDate = new Date(order?.completedAt);
    const completeDateFormat = completeDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };

    if (order.merchant.email) {
      await this.mailerService
        .sendMail({
          to: order.merchant.email,
          from: '"Shopdit" <support@shopdit.com>',
          subject: `ลูกค้ากดรับสินค้า ${order?.merchant?.slug} หมายเลขคำสั่งซื้อ ${order.number}`,
          template: './completeOrder',
          context: {
            merchantName: order?.merchant?.merchantTranslations?.find(
              (translation) => translation?.locale === locale,
            )?.name
              ? order?.merchant?.merchantTranslations?.find(
                  (translation) => translation?.locale === locale,
                )?.name
              : order?.merchant?.slug,
            orderNumber: order.number,
            completeDateFormat,
            customerFullName: order?.customer?.fullName,
            customerTel: order?.customer?.tel,
            customerAddress,
            orderShipment: 'ไม่มี',
            shipmentPrice: order?.invoice?.shipmentPrice,
            paymentMethod: getPaymentMethod(order?.invoice),
            paymentDateFormat: paymentDateFinal,
            orderItems: order?.orderItems,
            totalProductPrice: order?.invoice?.productPrice,
            discountPrice: order?.invoice?.productDiscountPrice,
            totalPrice: order?.invoice?.totalPrice,
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('Error : ', err);
        });
    }
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  //////// Send Shipemnt Customer ////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async sendShipmentOrderToCustomer(order: Order, locale: any) {
    const orderShipmentDate = new Date();
    const orderShipmentDateFormat = orderShipmentDate.toLocaleDateString(
      'th-TH',
      {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    const baseUrl = `https://${order?.merchant?.slug}.${
      process.env.NODE_ENV === 'staging'
        ? 'staging.myshopdit.com'
        : 'myshopdit.com'
    }`;
    const orderUrl = baseUrl + `/me/orders/${order.number}`;
    const ordersUrl = baseUrl + '/me/orders';
    const contactUrl = baseUrl + '/terms-and-policies#contact-us';

    const customerAddress = 'ไม่มี';

    const paymentDate = new Date(order?.invoice?.paymentAt);
    const paymentDateFormat = paymentDate.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const paymentDateFinal = order?.invoice?.paymentAt
      ? paymentDateFormat + ' ' + order?.invoice?.timePaymentAt + ' น.'
      : 'ยังไม่ได้ชำระ';
    const yearCreated = new Date(order?.merchant?.createdAt).getFullYear();

    const getPaymentMethod = (invoice: any) => {
      switch (invoice?.paymentMethodType) {
        case 'cash':
          return 'เงินสด';
        case 'omise':
          return 'บัตรเครดิต';
        case 'shopditpayCreditCard':
          return 'Shopdit Pay (บัตรเครดิต)';
        case 'shopditpayLinepay':
          return 'Shopdit Pay (Line Pay)';
        case 'shopditpayAirpay':
          return 'Shopdit Pay (Shopee Pay)';
        case 'shopditpayScbEasy':
          return 'Shopdit Pay (SCB EASY)';
        case 'shopditpayBbl':
          return 'Shopdit Pay (Bualuang mBanking)';
        case 'shopditpayBaybank':
          return 'Shopdit Pay (KMA กรุงศรีโมบายแอป)';
        case 'shopditpayTruemoney':
          return 'Shopdit Pay (True Money)';
        case 'bankAccount':
          return (
            invoice?.merchantBankAccountPaymentMethod?.bank?.name +
            ' (' +
            invoice?.merchantBankAccountPaymentMethod?.number +
            ')'
          );
        case 'promptpay':
          return (
            'พร้อมเพย์ Promptpay' +
            ' (' +
            invoice?.merchantPromptpayPaymentMethod?.number +
            ')'
          );
        default:
          break;
      }
    };
  }

  async sendErrorToAdminCis(
    method: string,
    url: string,
    data: any,
    error: any,
  ) {
    try {
      await this.mailerService.sendMail({
        to: this.configService.get<string>('ALLKONS_MAIL_ADMIN_CIS'),
        from: `Support Team <${this.configService.get<string>(
          'ALLKONS_MAIL_FROM_ADDRESS',
        )}>`,
        subject: 'เกิดข้อผิดพลาดในการเชื่อม API',
        template: './errorToAdminCis',
        context: {
          method,
          url,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          data: JSON.stringify(data),
          error: JSON.stringify(error),
        },
      });
    } catch (err) {
      console.log('email error', err);
    }
  }

  async sendInviteMember(
    email: string,
    orgName: string,
    inviteeName: string,
    inviterName: string,
    roleName: string,
    expiresAt: string,
    refCode: string,
    link: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `Support Team <${this.configService.get<string>(
          'ALLKONS_MAIL_FROM_ADDRESS',
        )}>`,
        subject: `คำเชิญคุณเข้าร่วม ${orgName} บน Allkons`,
        template: './inviteMember',
        context: {
          orgName,
          inviteeName,
          inviterName,
          roleName,
          expiresAt,
          refCode,
          link,
        },
      });
    } catch (err) {
      console.log('email error', err);
    }
  }

  async sendApproveMember(
    email: string,
    approverName: string,
    inviteeName: string,
    contact: string,
    targetOrg: string,
    roleName: string,
    expiresAt: string,
    refCode: string,
    link: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `Support Team <${this.configService.get<string>(
          'ALLKONS_MAIL_FROM_ADDRESS',
        )}>`,
        subject: `คำขออนุมัติ: อนุญาตให้ ${contact} เข้าร่วม ${targetOrg}`,
        template: './approveMember',
        context: {
          approverName,
          inviteeName,
          contact,
          targetOrg,
          roleName,
          expiresAt,
          refCode,
          link,
        },
      });
    } catch (err) {
      console.log('email error', err);
    }
  }
}
