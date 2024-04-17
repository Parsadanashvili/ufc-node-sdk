import axios, { AxiosResponse } from "axios";
import { UFC_CLIENT_HANDLER_URL, UFC_URL } from "./constants";
import { HttpsProxyAgent } from "https-proxy-agent";
import camelCase from "lodash/camelCase";
import type {
  BaseUfcPayRequest,
  UfcPayAuthorize,
  UfcPayAuthorizeResponse,
  UfcPayBatchResponse,
  UfcPayCharge,
  UfcPayChargeResponse,
  UfcPayCredit,
  UfcPayCreditResponse,
  UfcPayOptions,
  UfcPayRefund,
  UfcPayRefundResponse,
  UfcPayRegister,
  UfcPayRegisterResponse,
  UfcPayRequest,
  UfcPayRequestResponse,
  UfcPayReverse,
  UfcPayReverseResponse,
  UfcPayStatus,
  UfcPayStatusResponse,
} from "./types";

export default class UfcClient {
  protected _request = axios.create({
    baseURL: UFC_URL,
  });

  private _config: {
    cert?: string;
    cert_phrase?: string;
    currency: number;
  } = {
    cert: process.env.UFC_PAY_CERTIFICATE,
    cert_phrase: process.env.UFC_PAY_CERTIFICATE_PHRASE,
    currency: 981,
  };

  constructor(options?: UfcPayOptions) {
    if (options?.cert) {
      this._config.cert = options.cert;
    }

    if (options?.cert_phrase) {
      this._config.cert_phrase = options.cert_phrase;
    }

    if (!this._config.cert || !this._config.cert_phrase) {
      throw new Error("Certificate and certificate phrase are required");
    }

    if (options?.httpAgent) {
      this._request.defaults.proxy = false;
      this._request.defaults.httpsAgent = new HttpsProxyAgent(
        options?.httpAgent.url
      );
    }

    this._request.defaults.httpsAgent.options = {
      ...this._request.defaults.httpsAgent.options,
      cert: this._config.cert,
      key: this._config.cert,
      passphrase: this._config.cert_phrase,
      rejectUnauthorized: false,
      ...(options?.httpAgent?.options || {}),
    };
  }

  private _updateOptions = (options: UfcPayOptions) => {
    this._request.defaults.httpsAgent.options = {
      ...this._request.defaults.httpsAgent.options,
      ...options,
    };
  };

  private _buildQuery = (data: Record<string, string | number | undefined>) => {
    return Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  };

  private _parseResponse = <T = Record<string, string>>(
    response: AxiosResponse
  ) => {
    const text = response.data;

    const rawData: string[] = text.trim().split("\n");

    const parsedResponse: Record<string, string> = {};

    rawData.forEach((data) => {
      const [key, value] = data.split(":");
      parsedResponse[camelCase(key) as string] = value.trim();
    });

    return parsedResponse as T;
  };

  /**
   *
   * Request a payment
   *
   * @param ip - IP address of the client
   * @param description - Description of the payment
   * @param language - Language of the payment page (ka/ge, en, ru)
   * @param currency - Currency of the payment (ISO 4217 code) default is 981 (GEL)
   * @param amount - Amount of the payment (in the smallest unit of the currency, e.g. 1000 for 10.00 GEL)
   * @param preAuth - Pre-authorization flag
   */
  public async request(options: UfcPayRequest): Promise<UfcPayRequestResponse> {
    const command = options.preAuth ? "a" : "v";

    const query = this._buildQuery({
      command,
      client_ip_addr: options.ip,
      description: options.description || "",
      language: options.language || "ge",
      currency: options.currency || this._config.currency,
      amount: options.amount,
      msg_type: options.preAuth ? "DMS" : "SMS",
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data =
      this._parseResponse<Omit<UfcPayRequestResponse, "url">>(response);

    return {
      url: `${UFC_CLIENT_HANDLER_URL}?trans_id=${data.transactionId}`,
      ...data,
    };
  }

  /**
   *
   * Authorize a transaction
   *
   * @param ip - IP address of the client
   * @param transactionId - Transaction ID
   * @param description - Description of the payment
   * @param language - Language of the payment page (ka/ge, en, ru)
   * @param currency - Currency of the payment (ISO 4217 code) default is 981 (GEL)
   * @param amount - Amount for charging (amount may be less than or equal to the authorized amount, subtract amount will be refunded)
   */
  public async authorize(
    options: UfcPayAuthorize
  ): Promise<UfcPayAuthorizeResponse> {
    const query = this._buildQuery({
      command: "t",
      trans_id: options.transactionId,
      client_ip_addr: options.ip,
      description: options.description || "",
      language: options.language || "ge",
      currency: options.currency || this._config.currency,
      amount: options.amount,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "failed",
        code: data.resultCode,
      },
      rrn: data.rrn,
      approvalCode: data.approvalCode,
      card: {
        mask: data.cardNumber,
      },
    };
  }

  /**
   *
   * Retrieves the status of the transaction
   *
   * @param ip - IP address of the client
   * @param transactionId - Transaction ID
   */
  public async status(options: UfcPayStatus): Promise<UfcPayStatusResponse> {
    const query = this._buildQuery({
      command: "c",
      client_ip_addr: options.ip,
      trans_id: options.transactionId,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: String(
          data.result
        ).toLowerCase() as UfcPayStatusResponse["result"]["status"],
        code: data.resultCode,
      },
      "3dsecure": String(
        data["3Dsecure"]
      ).toLowerCase() as UfcPayStatusResponse["3dsecure"],
      rrn: data.rrn,
      approvalCode: data.approvalCode,
      card: {
        mask: data.cardNumber,
        token: data.reccPmntId,
        expiry: data.reccPmntExpiry,
      },
    };
  }

  /**
   *
   * Must be used before day is closed
   *
   * You can't reverse partial amount of pre-authorization
   * Partial reverse is only available for full authorized amount
   *
   * @param ip - IP address of the client
   * @param transactionId - Transaction ID
   * @param amount - Amount for refunding (only for partial refund)
   */
  public async reverse(options: UfcPayReverse): Promise<UfcPayReverseResponse> {
    const query = this._buildQuery({
      command: "r",
      client_ip_addr: options.ip,
      trans_id: options.transactionId,
      amount: options.amount,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "reversed" | "failed",
        code: data.resultCode,
      },
    };
  }

  /**
   *
   * Must be used after day is closed
   *
   * You mush use reverse command if you want to refund before day is closed
   * Partial refund can be done multiple times
   * Refunt sum can't be more than the charged amount
   *
   * @param ip - IP address of the client
   * @param transactionId - Transaction ID
   * @param amount - Amount for refunding (only for partial refund)
   */
  public async refund(options: UfcPayRefund): Promise<UfcPayRefundResponse> {
    const query = this._buildQuery({
      command: "k",
      client_ip_addr: options.ip,
      trans_id: options.transactionId,
      amount: options.amount,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "failed",
        code: data.resultCode,
      },
      refundTransactionId: data.refundTransactionId,
    };
  }

  /**
   * Close the day
   */
  public async batch(options: BaseUfcPayRequest): Promise<UfcPayBatchResponse> {
    const query = this._buildQuery({
      command: "b",
      ip: options.ip,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "failed",
        code: data.resultCode,
      },
      transactions: {
        credit: parseInt(data.fld074),
        totalCredit: parseInt(data.fld086),
        debit: parseInt(data.fld076),
        totalDebit: parseInt(data.fld088),
      },
      reversals: {
        credit: parseInt(data.fld075),
        totalCredit: parseInt(data.fld087),
        debit: parseInt(data.fld077),
        totalDebit: parseInt(data.fld089),
      },
    };
  }

  /**
   *
   * Register card for future payments
   *
   * @param ip - IP address of the client
   * @param description - Description of the payment
   * @param language - Language of the payment page (ka/ge, en, ru)
   * @param currency - Currency of the payment (ISO 4217 code) default is 981 (GEL)
   * @param amount - Amount of the payment (in the smallest unit of the currency, e.g. 1000 for 10.00 GEL)
   * @param expiry - Expiry date of the card (MMYY) (if expiry is greater than card expiry, date will be set to card expiry)
   * @param token - Token generated by merchant (if not provided, transaction id will be used as token)
   * @param preAuth - Pre-authorization flag
   */
  public async register(
    options: UfcPayRegister
  ): Promise<UfcPayRegisterResponse> {
    const amount = options.amount === undefined ? 0 : options.amount;
    const command = options.preAuth && options.amount === 0 ? "p" : "z";

    const query = this._buildQuery({
      command,
      client_ip_addr: options.ip,
      description: options.description || "",
      language: options.language || "ge",
      currency: options.currency || this._config.currency,
      amount,
      perspayee_expiry: options.expiry,
      biller_client_id: options.token,
      msg_type: options.preAuth ? "AUTH" : "SMS",
      perspayee_gen: 1,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      url: `${UFC_CLIENT_HANDLER_URL}?trans_id=${data.transactionId}`,
      transactionId: data.transactionId,
    };
  }

  /**
   *
   * Charge the amount from the registered card
   *
   * @param ip - IP address of the client
   * @param description - Description of the payment
   * @param language - Language of the payment page (ka/ge, en, ru)
   * @param amount - Amount of the payment (in the smallest unit of the currency, e.g. 1000 for 10.00 GEL)
   * @param currency - Currency of the payment (ISO 4217 code) default is 981 (GEL)
   * @param token - Card token (generated by merchant or transaction id)
   */
  public async charge(options: UfcPayCharge): Promise<UfcPayChargeResponse> {
    const query = this._buildQuery({
      command: "e",
      client_ip_addr: options.ip,
      description: options.description || "",
      language: options.language || "ge",
      currency: options.currency || this._config.currency,
      amount: options.amount,
      perspayee_expiry: options.token,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "failed",
        code: data.resultCode,
      },
      transactionId: data.transactionId,
      rrn: data.rrn,
      approvalCode: data.approvalCode,
    };
  }

  /**
   *
   * Send the amount to the previously charged card
   *
   * @param transactionId - Transaction ID
   * @param amount - Amount of the payment (in the smallest unit of the currency, e.g. 1000 for 10.00 GEL)
   */
  public async credit(options: UfcPayCredit): Promise<UfcPayCreditResponse> {
    const query = this._buildQuery({
      command: "g",
      amount: options.amount,
      trans_id: options.transactionId,
    });

    if (options.options) this._updateOptions(options.options);

    const response = await this._request.post(
      `/ecomm2/MerchantHandler?${query}`
    );

    const data = this._parseResponse(response);

    console.log(data);

    return {
      result: {
        status: data.result.toLowerCase() as "ok" | "failed",
        code: data.resultCode,
      },
      refundTransactionId: data.refundTransactionId,
    };
  }
}
