// src/services/apiSmartAccountService.ts
import { environment } from "../enviroments/environment"; // Asegúrate de que esta ruta sea correcta
import { CreateAccountResponse } from "../models/company.model";

const baseUrl = environment.HOST_SMART_ACCOUNT;
const apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

const headers = {
  "Content-Type": "application/json",
  "x-api-key": apiKey,
};

export async function createAccount(saltHex: string): Promise<CreateAccountResponse> {
  const response = await fetch(`${baseUrl}/createAccount`, {
    method: "POST",
    headers,
    body: JSON.stringify({ args: [saltHex] }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// src/services/apiSmartAccountService.ts
export async function createAccountSimple(salt: string, network: string): Promise<any> {
  const url = `${baseUrl}/createIndividualAccountRetry`;

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ args: [salt, network] }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}
