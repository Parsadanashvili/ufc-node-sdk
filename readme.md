# ufc.ge Node.js SDK Documentation

The ufc-node-sdk package is a helpful tool for handling payments in your application. It provides a convenient interface for interacting with the UFC payment gateway. In this documentation, we will cover the main features and methods of the package.

## Installation

To install the package, use the following command:

```bash
npm install ufc-node-sdk
```

or

```bash
yarn add ufc-node-sdk
```

## Usage

To use the package, import it into your project and create a new instance of the `UfcClient` class:

```ts
import UfcClient from "ufc-node-sdk";

const instance = new UfcClient({
  cert: process.env.UFC_PAY_CERTIFICATE,
  cert_phrase: process.env.UFC_PAY_CERTIFICATE_PHRASE,
  currency: 981,
});
```

You can also pass additional options to the constructor, such as an HTTP agent:

```ts
import UfcClient from "ufc-node-sdk";

const instance = new UfcClient({
  cert: process.env.UFC_PAY_CERTIFICATE,
  cert_phrase: process.env.UFC_PAY_CERTIFICATE_PHRASE,
  currency: 981,
  httpAgent: {
    url: "http://your-proxy-url",
    options: {
      // additional options for the HTTP agent
    },
  },
});
```

## Methods

The package provides several methods for interacting with the UFC payment gateway. Here are the main methods:

- `request` - Request the payment
- `authorize` - Authorizes a transaction
- `status` - Retrieves the status of a transaction
- `reverse` - Reverses a transaction
- `refund` - Refunds a transaction
- `batch` - Close the day
- `register` - Register card for future payments
- `charge` - Charge the amount from the registered card
- `credit` - Send the amount to the previously charged card

Each method returns a promise that resolves with the result of the operation. Here is an example of how to use the `request` method:

```ts
const result = await instance.request({
  ip: "127.0.0.1", // IP address of the client
  amount: 100, // Amount of the payment (in the smallest unit of the currency, e.g. 100 for 1.00 GEL)
  language: "ka", // Language of the payment page (ka/ge, en, ru)
  // optional
  description: "Test transaction", // Description of the payment
  // optional
  currency: 981, // Currency of the payment (ISO 4217 code) default is 981 (GEL)
  // optional
  preAuth: false, // Pre-authorize the payment (true/false)
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
