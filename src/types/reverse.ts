import { UfcPayOptions } from "./base";

export type UfcPayReverse = {
  ip: string;
  transactionId: string;
  amount?: number;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayReverseResponse = {
  result: {
    status: "ok" | "reversed" | "failed";
    code: string;
  };
};
