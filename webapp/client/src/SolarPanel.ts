export interface SolarPanel {
    _id: string | undefined;
    name: string; // Name of the bond
    location: string;
    reference: string;
    price: number | undefined | { $numberDecimal: string };
    state: string;
    owner: string;
    stimatedProduction: number | undefined; // Estimated production in kWh
    paymentFreq: string; // Frequency of coupon payments
    installationYear?: number; // Año de instalación del panel
    // walletAddress: string; // Wallet address for bond management
};
