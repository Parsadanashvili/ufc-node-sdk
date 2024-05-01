import { BaseUfcPayRequest, UfcPayOptions } from "./base";

export type UfcPayRequest = BaseUfcPayRequest & {
  amount: number;
  currency?: number;
  split?: {
    iban: string;
    amount: number;
  };
  preAuth?: boolean;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayRequestResponse = {
  url: string;
  transactionId: string;
};
