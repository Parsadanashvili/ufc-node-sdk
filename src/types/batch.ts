export type UfcPayBatchResponse = {
  result: {
    status: "ok" | "failed";
    code: string;
  };
  transactions: {
    credit: number;
    totalCredit: number;
    debit: number;
    totalDebit: number;
  };
  reversals: {
    credit: number;
    totalCredit: number;
    debit: number;
    totalDebit: number;
  };
};
