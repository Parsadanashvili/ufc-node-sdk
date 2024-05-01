import { BaseUfcPayRequest, UfcPayOptions } from "./base";

export type UfcPayCharge = BaseUfcPayRequest & {
  token: string;
  amount: number;
  currency?: number;
  split?: {
    iban: string;
    amount: number;
  };
  preAuth?: boolean;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayChargeResponse = {
  result: {
    status: "ok" | "failed";
    code: string;
  };
  transactionId: string;
  rrn: string;
  approvalCode: string;
};
