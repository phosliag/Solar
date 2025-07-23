import { Bond } from "./SolarPanel";
import { PaymentRecord } from "./admin/EnterpriseWallet";

export const generatePaymentRecords = (bonds: Bond[]): PaymentRecord[] => {
  const records: PaymentRecord[] = [];

  bonds?.forEach((bond) => {
    let currentDate = new Date(bond.bondStartDate!);
    const closingDate = new Date(bond.bondMaturityDate!);

    // Incrementos en función de la frecuencia
    const frequencyIncrement: Record<string, number> = {
      Monthly: 1,
      Quarterly: 3,
      "Semi-annualy": 6,
      Annualy: 12,
    };

    function addMonthsToFirstDay(date: Date, months: number): Date {
      const newDate = new Date(date);
      newDate.setDate(1); // Ajustar siempre al primer día del mes
      newDate.setDate(newDate.getDate() + 32 * months);
      return newDate;
    }

    currentDate = addMonthsToFirstDay(currentDate, frequencyIncrement[bond.paymentFreq]);
    while (currentDate <= closingDate) {
      records.push({
        bondName: bond.bondName,
        paymentDate: currentDate.toISOString().split("T")[0], // Fecha en formato "YYYY-MM-DD"
        amount: 100,
      });
      currentDate = addMonthsToFirstDay(currentDate, frequencyIncrement[bond.paymentFreq]);
    }
    records.push({
      bondName: bond.bondName,
      paymentDate: new Date(bond.bondMaturityDate!).toISOString().split("T")[0], // Fecha en formato "YYYY-MM-DD"
      amount: 100,
    });
  });

  records.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

  return records;
};

export const europeanCountries = [
  "Austria",
  "Bélgica",
  "Bulgaria",
  "Chipre",
  "Croacia",
  "Dinamarca",
  "Eslovaquia",
  "Eslovenia",
  "España",
  "Estonia",
  "Finlandia",
  "Francia",
  "Grecia",
  "Hungría",
  "Irlanda",
  "Italia",
  "Letonia",
  "Lituania",
  "Luxemburgo",
  "Malta",
  "Países Bajos",
  "Polonia",
  "Portugal",
  "Rumanía",
  "Suecia",
];
