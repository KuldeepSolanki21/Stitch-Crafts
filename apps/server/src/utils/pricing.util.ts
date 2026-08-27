export interface FinancialSummary {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
}

export const CONFIG = {
  FREE_SHIPPING_THRESHOLD: Number(process.env.FREE_SHIPPING_THRESHOLD) || 5000,
  SHIPPING_FEE: Number(process.env.SHIPPING_FEE) || 250,
  TAX_RATE: Number(process.env.TAX_RATE) || 0.18, // 18% GST standard
};

export const calculateShipping = (subtotal: number): number => {
  if (subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD || subtotal === 0) {
    return 0;
  }
  return CONFIG.SHIPPING_FEE;
};

export const calculateTax = (taxableAmount: number): number => {
  return Math.round(taxableAmount * CONFIG.TAX_RATE * 100) / 100;
};

export const calculateFinancials = (
  subtotal: number,
  couponDiscount: number = 0
): FinancialSummary => {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscount = Math.min(safeSubtotal, Math.max(0, couponDiscount));
  const taxableBase = safeSubtotal - safeDiscount;
  const shippingFee = calculateShipping(safeSubtotal);
  const taxAmount = calculateTax(taxableBase);
  const totalAmount = Math.round((taxableBase + shippingFee + taxAmount) * 100) / 100;

  return {
    subtotal: safeSubtotal,
    discountAmount: safeDiscount,
    shippingFee,
    taxAmount,
    totalAmount,
  };
};
