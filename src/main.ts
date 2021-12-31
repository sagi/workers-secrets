import "@sagi.io/globalthis";

const ERROR_PREFIX = "@sagi.io/workers-secrets";
const CF_V4_BASE = "https://api.cloudflare.com/client/v4/accounts";

type WorkersSecretsParams = {
  cfAccountId: string;
  cfEmail?: string;
  cfAuthKey?: string;
  cfAuthToken?: string;
  fetchImpl?: any;
};

type AuthHeadersInput = {
  cfEmail?: string;
  cfAuthKey?: string;
  cfAuthToken?: string;
};

type Headers = { [key: string]: string };
type BaseInputs = { cfAccountId: string; headers: Headers };

type CreateSecretParams = {
  scriptName: string;
  secretName: string;
  secretValue: string;
};

type DeleteSecretParams = {
  scriptName: string;
  secretName: string;
};

type ListSecretsParams = {
  scriptName: string;
};

export const getAuthHeaders = ({
  cfEmail,
  cfAuthKey,
  cfAuthToken,
}: AuthHeadersInput): Headers => {
  if (cfAuthToken) {
    return {
      Authorization: `Bearer ${cfAuthToken}`,
      "Content-Type": "application/json",
    };
  }

  if (cfEmail && cfAuthKey) {
    return {
      "X-Auth-Email": cfEmail,
      "X-Auth-Key": cfAuthKey,
      "Content-Type": "application/json",
    };
  }

  throw new Error(
    `${ERROR_PREFIX}: Either cfAuthToken or cfEmail and cfAuthKey must be provided`
  );
};

export const setGlobals = (fetchImpl = null) => {
  if (!globalThis.fetch) {
    if (!fetchImpl) {
      throw new Error(`${ERROR_PREFIX}: No fetch nor fetchImpl were found.`);
    } else {
      globalThis.fetch = fetchImpl;
    }
  }
};
// Based on https://github.com/cloudflare/cloudflare-rs/blob/master/cloudflare/src/endpoints/workers/create_secret.rs
export const createSecret =
  (baseInputs: BaseInputs) =>
  async ({ scriptName, secretName, secretValue }: CreateSecretParams) => {
    const { cfAccountId, headers } = baseInputs;
    const url = `${CF_V4_BASE}/${cfAccountId}/workers/scripts/${scriptName}/secrets`;
    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify({ name: secretName, text: secretValue }),
    };
    return fetchApiCall(url, options);
  };

// Based on https://github.com/cloudflare/cloudflare-rs/blob/master/cloudflare/src/endpoints/workers/delete_secret.rs
export const deleteSecret =
  (baseInputs: BaseInputs) =>
  async ({ scriptName, secretName }: DeleteSecretParams) => {
    const { cfAccountId, headers } = baseInputs;
    const url = `${CF_V4_BASE}/${cfAccountId}/workers/scripts/${scriptName}/secrets/${secretName}`;
    const options = { method: "DELETE", headers };
    return fetchApiCall(url, options);
  };

// Based on https://github.com/cloudflare/cloudflare-rs/blob/master/cloudflare/src/endpoints/workers/list_secrets.rs
export const listSecrets =
  (baseInputs: BaseInputs) =>
  async ({ scriptName }: ListSecretsParams) => {
    const { cfAccountId, headers } = baseInputs;
    const url = `${CF_V4_BASE}/${cfAccountId}/workers/scripts/${scriptName}/secrets`;
    const options = { method: "GET", headers };
    return fetchApiCall(url, options);
  };

export const fetchApiCall = async (url: string, options: any) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `${ERROR_PREFIX}: Error with API call ${JSON.stringify({ url, options })}`
    );
  }
  return response.json();
};

const WorkersSecretsAPI = ({
  cfAccountId,
  cfEmail,
  cfAuthKey,
  cfAuthToken,
  fetchImpl,
}: WorkersSecretsParams) => {
  setGlobals(fetchImpl);
  const headers = getAuthHeaders({ cfEmail, cfAuthKey, cfAuthToken });
  const baseInputs = { cfAccountId, headers };

  return {
    createSecret: createSecret(baseInputs),
    deleteSecret: deleteSecret(baseInputs),
    listSecrets: listSecrets(baseInputs),
  };
};

export default WorkersSecretsAPI;
