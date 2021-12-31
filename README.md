# Cloudflare Workers Secrets API

[`@sagi.io/workers-secrets`](https://www.npmjs.com/package/@sagi.io/workers-secrets)
allows Cloudflare Workers Secrets API within your worker and in Node.js.

[![CircleCI](https://circleci.com/gh/sagi/workers-secrets.svg?style=svg&circle-token=e5282bece02d965a8fcde66d517bb599f20aa2e4)](https://circleci.com/gh/sagi/workers-secrets)
[![MIT License](https://img.shields.io/npm/l/@sagi.io/workers-secrets.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@sagi.io/workers-secrets.svg?style=flat-square)](http://npm.im/@sagi.io/workers-secrets)


Based on [Cloudflare's wrangler implementation](https://github.com/cloudflare/wrangler/blob/master/src/commands/secret.rs).

## API

### **`WorkersSecretsAPI({ ... })`**

Instantiates a `WorkersSecretsAPI` object with the methods defined below.

Function definition:

```js
const WorkersSecretsAPI = function({
  cfAccountId,
  cfEmail,
  cfAuthKey,
  cfAuthToken,
  fetchImpl,
}){ ... }
```

Where:

  - **`cfAccountId`** *required* Your Cloudflare account id.
  - **`cfEmail`** *optional|required* The email you registered with Cloudflare.
  - **`cfAuthKey`** *optional|required* Your Cloudflare Auth Key.
  - **`cfAuthToken`** *optional|required* Your Cloudflare Auth Token.
  - **`fetchImpl`** *optional* when running on `Node.js` you need to provide a `fetch` implementation (e.g. `const fetchImpl = require('cross-fetch')`.

Use `cfAuthToken` with a [Cloudflare auth token](https://support.cloudflare.com/hc/en-us/articles/200167836-Managing-API-Tokens-and-Keys). You can also set `cfEmail` and `cfAuthKey` directly without using an auth token.

### **`WorkersSecretsAPI.createSecret({ ... })`**

Function definition:

```js
const createSecret= async ({
  scriptName,
  secretName,
  secretValue,
} = {}) => { ... }
```

Where:

  - **`scriptName`** *required* The name of the Cloudflare Workers Script (e.g. `anonymitybot-com`, can be found in Cloudflare's Dashboard).
  - **`secretName`** *required* The secret name e.g. `ROTATIONAL_RANDOM_PEPPER`.
  - **`secretValue`** *required* The secret value.

### **`WorkersSecretsAPI.deleteSecret({ ... })`**

Function definition:

```js
const deleteSecret= async ({
  scriptName,
  secretName,
} = {}) => { ... }
```

Where:

  - **`scriptName`** *required* The name of the Cloudflare Workers Script (e.g. `anonymitybot-com`, can be found in Cloudflare's Dashboard).
  - **`secretName`** *required* The secret name e.g. `ROTATIONAL_RANDOM_PEPPER`.


### **`WorkersSecretsAPI.listSecrets({ ... })`**

Function definition:

```js
const listSecrets= async ({
  scriptName,
} = {}) => { ... }
```

Where:

  - **`scriptName`** *required* The name of the Cloudflare Workers Script (e.g. `anonymitybot-com`, can be found in Cloudflare's Dashboard).


## Example on Node.js


Run `$ yarn build` and add the `CF_ACCOUNT_ID` and `CF_AUTH_TOKEN` environment variables.

```js
import dotenv from "dotenv";
import WorkersSecretsAPI from "./dist/main.js";
import fetchImpl from "cross-fetch";

(async () => {
  dotenv.config();
  const cfAccountId = process.env.CF_ACCOUNT_ID;
  const cfAuthToken = process.env.CF_AUTH_TOKEN;
  const scriptName = "anonymitybot-xyz";
  const workersSecretsAPI = WorkersSecretsAPI({
    cfAccountId,
    cfAuthToken,
    fetchImpl,
  });
  const data = await workersSecretsAPI.listSecrets({ scriptName });
  console.log(data);
})();
```

## Example on Cloudflare Workers

Simply remove the `fetchImpl` import and usage.
