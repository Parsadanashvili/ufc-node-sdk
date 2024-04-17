import { BaseUfcPayRequest, UfcPayOptions } from "./base";

export type UfcPayAuthorize = BaseUfcPayRequest & {
  transactionId: string;
  currency?: number;
  amount: number;
  options?: Omit<UfcPayOptions, "currency">;
};

export type UfcPayAuthorizeResponse = {
  result: {
    status: "ok" | "failed";
    code: string;
  };
  rrn: string;
  approvalCode: string;
  card: {
    mask: string;
  };
};
