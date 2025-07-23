export interface Bond {
    _id: string | undefined;
    bondName: string; // Name of the bond
    bondSymbol: string;
    bondStartDate: Date | undefined; // Satrt date of the bond
    bondMaturityDate: Date | undefined; // Maturity date of the bond
    bondPurpose: string; // Purpose of creating the bond
    interestRate: number | undefined; // Annual interest rate in percentage
    paymentFreq: string; // Frequency of coupon payments
    goalAmount: number | undefined; // Total amount to raise
    numberTokens: number | undefined; // Number of tokens to issue
    price: number | undefined;
    earlyRedemptionClauses: string; // Whether early redemption is allowed
    penalty: number | undefined; // Penalty percentage for early redemption
    redemptionStartDate: Date | undefined // Early redemption start date
    redemptionFinishDate: Date | undefined // Early redemption final date
    blockchainNetwork: string; // Selected blockchain network
    // walletAddress: string; // Wallet address for bond management
    tokenState: TokenState[];
    creatorCompany: string | undefined
};

export interface TokenState{
    blockchain: string;    
    amount: number;
    amountAvaliable: number;
}
export interface InvestorBonds {
    userId: string;
    bondName: string;
    amount: number;
    network: string;
}