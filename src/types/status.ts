import { UfcPayOptions } from "./base";

export type UfcPayStatus = {
  ip: string;
  transactionId: string;
  options?: Omit<UfcPayOptions, "currency">;
  query?: Record<string, string>;
};

// TODO: Add more fields to UfcPayStatusResponse
export type UfcPayStatusResponse = {
  result: {
    status:
      | "ok"
      | "failed"
      | "created"
      | "pending"
      | "declined"
      | "reversed"
      | "autoreversed"
      | "timeout";
    code: string;
  };
  "3dsecure":
    | "authenticated"
    | "declined"
    | "notparticipated"
    | "no_range"
    | "attempted"
    | "unavailable"
    | "error"
    | "syserror"
    | "unknownscheme"
    | "failed";
  rrn: string;
  approvalCode: string;
  card: {
    mask: string;
    token: string;
    expiry: string;
  };
};
