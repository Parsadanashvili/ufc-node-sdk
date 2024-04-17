import { BaseUfcPayRequest, UfcPayOptions } from "./base";

export type UfcPayRequest = BaseUfcPayRequest &
  (
    | {
        amount: number;
        currency?: number;
        preAuth?: false;
        options?: Omit<UfcPayOptions, "currency">;
      }
    | {
        amount: number;
        currency?: number;
        preAuth: true;
        options?: Omit<UfcPayOptions, "currency">;
      }
  );

export type UfcPayRequestResponse = {
  url: string;
  transactionId: string;
};
