import { UfcPayOptions } from "./base";

export type UfcPayCredit = {
  transactionId: string;
  amount: number;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayCreditResponse = {
  result: {
    status: "ok" | "failed";
    code: string;
  };
  refundTransactionId: string;
};
