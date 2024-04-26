import { UfcPayOptions } from "./base";

export type UfcPayRefund = {
  ip: string;
  transactionId: string;
  amount?: number;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayRefundResponse = {
  result: {
    status: "ok" | "failed";
    code: string;
  };
  refundTransactionId: string;
};
