export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async sendEmail(payload: EmailPayload): Promise<boolean> {
    console.log(`[EMAIL NOTIFICATION] To: ${payload.to} | Subject: ${payload.subject}`);
    return true;
  }

  async sendOrderConfirmation(email: string, orderId: string, totalAmount: number): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Stitch & Crafts — Order Confirmation #${orderId.substring(0, 8)}`,
      html: `<h1>Order Confirmed</h1><p>Order #${orderId} for ₹${totalAmount} is under craft.</p>`,
    });
  }

  async sendOrderDispatched(email: string, orderId: string, trackingNumber: string, carrier: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Stitch & Crafts — Your Order Has Shipped',
      html: `<h1>Order Dispatched</h1><p>Carrier: ${carrier}</p><p>Airway Bill: ${trackingNumber}</p>`,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Stitch & Crafts Atelier',
      html: `<h1>Welcome, ${name}</h1><p>Thank you for joining our atelier.</p>`,
    });
  }
}

export const emailService = new EmailService();
