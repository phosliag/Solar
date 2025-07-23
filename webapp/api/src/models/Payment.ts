export interface UserInfo {
    tokenList: PurchaseBond[];
    upcomingPayment: UpcomingPayment[];
}
export interface UpcomingPayment{
    bondName: string;    
    paymentDate: string;
    paymentAmount: number;
}

export interface PurchaseBond {
    bondName: string;   
    network: string; 
    amountAvaliable: number;
    price: number;
}

export interface Payment {
    bondName: string;
    bondId: string;
    network: string;
    numberToken: number;
    amount: number;
    paymentDate: string;
    investors: Investors[]
}
export interface Investors {
    userId: string;
    numberToken: number;
    amount: number;
    paid: boolean;
}
