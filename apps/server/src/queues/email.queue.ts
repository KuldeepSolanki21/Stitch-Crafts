export const emailQueue = {
  sendWelcomeEmail: async (email: string, name: string) => {
    console.log(`[Email Worker Placeholder] Sending welcome email to ${email}`);
  },
  sendOrderConfirmation: async (orderId: string, email: string) => {
    console.log(`[Email Worker Placeholder] Sending order confirmation ${orderId} to ${email}`);
  },
};
