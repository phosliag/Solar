import { CreateBondResponse } from "models/company.model";

//Funciones dinamicas para calculos (Dinero anual) Numero anual tokens...
export const useBusinessService = () => {
    const calculateBondPrice = async (bond: any) => {
        console.log("Call calculateBondPrice()");
        try {
            if (!bond) return;
            const goalAmount = bond.goalAmount;
            const numberTokens = bond.numberTokens;

            if (goalAmount && numberTokens) {
                const bondPrice = goalAmount / numberTokens;
                if (bondPrice) {
                    // Redondear hacia abajo y mostrar sin decimales
                    return Math.floor(bondPrice);
                }
            }
        } catch (err) {
            console.error('Error calculateBondPrice() :: ', err);
            return null;
        }
    };


    const getBondNetWorkAccount = async (accounts: any[], network: string) => {
        console.log("Call getBondNetWorkAccount()");
        try {
            for (const account of accounts) {
                if (account.network === network) {
                    return account.address;
                }
            }
            return null;
        } catch (err) {
            console.error('Error getBondAccounts() :: ', err);
            return null;
        }
    };

    const getPaymenAmount = async (bond: any, numberOfToKens: number, anualInterestRate: number) => {
        console.log("Call getPaymenAmount()");
        try {
            const bondPrice = await calculateBondPrice(bond);
            if (!bondPrice) return null;
            const nominalValue = (bondPrice * numberOfToKens);
            const finalPrice =(nominalValue * (anualInterestRate/100));
            return finalPrice;
        } catch (err) {
            console.error('Error getPaymenAmount() :: ', err);
            return null;
        }
    };

    const extractListItem = async (list: any) => {
        console.log("Call extractListItem()");
        try {
            for (const item of list) { 
                return item;
            }
            return null;
        } catch (err) {
            console.error('Error extractListItem() :: ', err);
            return null;
        }
    };

    return {
        calculateBondPrice,
        getBondNetWorkAccount,
        getPaymenAmount,
        extractListItem
    };
};




