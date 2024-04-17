import { BaseUfcPayRequest, UfcPayOptions } from "./base";

export type UfcPayRegister = BaseUfcPayRequest &
  (
    | {
        amount: number;
        currency?: number;
        expiry: string;
        token?: string;
        preAuth?: false;
        options?: Omit<UfcPayOptions, "currency">;
      }
    | {
        amount?: 0;
        currency?: number;
        expiry: string;
        token?: string;
        preAuth: true;
        options?: Omit<UfcPayOptions, "currency">;
      }
  );

export type UfcPayRegisterResponse = {
  url: string;
  transactionId: string;
};
