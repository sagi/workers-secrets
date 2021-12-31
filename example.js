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
