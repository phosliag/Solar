export interface CompanyWallet {
  address: string;
  createdAt: Date;
  accounts?: SmartAccount[]; // opcional, puede cargarse después
}

export interface SmartAccount {
  network: string;
  address: string;
  transactionHash: string;
  timestamp: string | null;
}

export interface CreateAccountResponse {
  message: string;
  accounts: SmartAccount[];
}

export interface BondAccountInfo {
  network: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  tokens: number;
}

export interface BondAccount {
  network: string;
  address: string;
}

export interface CreateBondResponse {
  message: string;
  accounts: BondAccount[];
  contract: string;
}
