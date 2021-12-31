// @ts-nocheck
import WorkersSecretsAPI, * as funcs from "./main";

describe("WorkersSecretsAPI", () => {
  const cfAccountId = "CF_ACCOUNT_ID";
  const cfEmail = "CF_EMAIL";
  const cfAuthKey = "CF_AUTH_KEY";
  const cfAuthToken = "CF_AUTH_TOKEN";

  beforeEach(() => {
    global.fetch = null;
  });
  test("getAuthHeaders", () => {
    expect(funcs.getAuthHeaders({ cfEmail, cfAuthKey })).toMatchSnapshot();
    expect(funcs.getAuthHeaders({ cfAuthToken })).toMatchSnapshot();
    expect(() =>
      funcs.getAuthHeaders({ cfEmail })
    ).toThrowErrorMatchingSnapshot();
  });

  test("setGlobals", () => {
    expect(() => funcs.setGlobals()).toThrowErrorMatchingSnapshot();
    const fetchImpl = jest.fn();
    funcs.setGlobals(fetchImpl);
    expect(global.fetch).toEqual(fetchImpl);
  });

  test("fetchApiCall", async () => {
    const url = "https://x.xyz";
    const options = { method: "GET" };

    const response1 = { ok: true, json: jest.fn() };
    const fetchImpl1 = jest.fn(() => response1);
    funcs.setGlobals(fetchImpl1);

    await funcs.fetchApiCall(url, options);
    expect(fetchImpl1).toHaveBeenCalledWith(url, options);
    expect(response1.json).toHaveBeenCalled();

    const response2 = { ok: false };
    const fetchImpl2 = jest.fn(() => response2);
    global.fetch = null;
    funcs.setGlobals(fetchImpl2);

    await expect(() =>
      funcs.fetchApiCall(url, options)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("createSecret", async () => {
    const headers = funcs.getAuthHeaders({ cfAuthToken });
    const baseInputs = { cfAccountId, headers };
    jest.spyOn(funcs, "fetchApiCall");
    funcs.fetchApiCall.mockReturnValueOnce("");
    const scriptName = "anonymitybot-com";
    const secretName = "ROTATIONAL_PEPPER";
    const secretValue =
      "witch collapse practice feed shame open despair _SAMPLE_PRIVATE_KEY_DO_NOT_IMPORT_creek road again ice least";
    await funcs.createSecret(baseInputs)({
      scriptName,
      secretName,
      secretValue,
    });
    expect(funcs.fetchApiCall.mock.calls[0]).toMatchSnapshot();
  });

  test("deleteSecret", async () => {
    const headers = funcs.getAuthHeaders({ cfAuthToken });
    const baseInputs = { cfAccountId, headers };
    jest.spyOn(funcs, "fetchApiCall");

    funcs.fetchApiCall.mockClear();
    funcs.fetchApiCall.mockReturnValueOnce("");
    const scriptName = "anonymitybot-com";
    const secretName = "ROTATIONAL_PEPPER";
    await funcs.deleteSecret(baseInputs)({
      scriptName,
      secretName,
    });
    expect(funcs.fetchApiCall.mock.calls[0]).toMatchSnapshot();
  });

  test("listSecrets", async () => {
    const headers = funcs.getAuthHeaders({ cfAuthToken });
    const baseInputs = { cfAccountId, headers };
    jest.spyOn(funcs, "fetchApiCall");

    funcs.fetchApiCall.mockClear();
    funcs.fetchApiCall.mockReturnValueOnce("");
    const scriptName = "anonymitybot-com";
    await funcs.listSecrets(baseInputs)({
      scriptName,
    });
    expect(funcs.fetchApiCall.mock.calls[0]).toMatchSnapshot();
  });

  test("WorkersSecretsAPI", async () => {
    global.fetch = null;
    jest.clearAllMocks();
    jest.spyOn(funcs, "setGlobals");
    jest.spyOn(funcs, "createSecret");
    jest.spyOn(funcs, "deleteSecret");
    jest.spyOn(funcs, "listSecrets");
    funcs.createSecret.mockReturnValueOnce("createSecretAsyncFunc");
    funcs.deleteSecret.mockReturnValueOnce("deleteSecretAsyncFunc");
    funcs.listSecrets.mockReturnValueOnce("listSecretsAsyncFunc");

    const fetchImpl = jest.fn();
    expect(WorkersSecretsAPI({ cfAccountId, cfAuthToken, fetchImpl })).toEqual({
      createSecret: "createSecretAsyncFunc",
      deleteSecret: "deleteSecretAsyncFunc",
      listSecrets: "listSecretsAsyncFunc",
    });

    expect(funcs.setGlobals).toHaveBeenCalledWith(fetchImpl);

    const headers = funcs.getAuthHeaders({ cfAuthToken });
    const baseInputs = { cfAccountId, headers };

    expect(funcs.createSecret).toHaveBeenCalledWith(baseInputs);
    expect(funcs.deleteSecret).toHaveBeenCalledWith(baseInputs);
    expect(funcs.listSecrets).toHaveBeenCalledWith(baseInputs);
  });

  test("WorkersSecretsAPI; end-to-end test", async () => {
    global.fetch = null;
    jest.clearAllMocks();
    jest.spyOn(funcs, "setGlobals");
    jest.spyOn(funcs, "createSecret");
    const data = JSON.stringify({ success: true });
    const response = { ok: true, json: jest.fn(() => data) };
    const fetchImpl = jest.fn(() => response);
    const workersSecretsAPI = WorkersSecretsAPI({
      cfAccountId,
      cfAuthToken,
      fetchImpl,
    });
    expect(funcs.setGlobals).toHaveBeenCalledWith(fetchImpl);

    const headers = funcs.getAuthHeaders({ cfAuthToken });
    const baseInputs = { cfAccountId, headers };

    expect(funcs.createSecret).toHaveBeenCalledWith(baseInputs);
    const scriptName = "anonymitybot-com";
    const secretName = "ROTATIONAL_PEPPER";
    const secretValue = "secret value woohoo";
    await workersSecretsAPI.createSecret({
      scriptName,
      secretName,
      secretValue,
    });
    expect(fetchImpl.mock.calls[0]).toMatchSnapshot();
  });
});
