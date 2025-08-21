import mongoose from "mongoose";

// Define the schema for a payment invoice
const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  panelId: { type: String, required: true },
  purchaseDate: { type: Date, required: true, default: Date.now },
  payments: [
    {
      timeStamp: {
        type: Date, required: false, default: () => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
        }
      }, //Last day of payment invoice(tipically last day of month included)
      paid: { type: Boolean, required: true }, // Flag to determine paid status
      trxPaid: { type: String, required: false }, // trx hash
      amount: { type: mongoose.Schema.Types.Decimal128, required: false } //Amount paid of the month
    },
  ],
  // logs: [{ timeStamp: { type: Date, required: true }, trxStable: { type: String, required: true }, trxTransfer: { type: String, required: true } }]
});

// Create the model
export const PaymentInvoice = mongoose.model("PaymentInvoice", InvoiceSchema);

// Create a new payment invoice
export const createPaymentInvoice = (values: Record<string, any>) => new PaymentInvoice(values).save();

// Get all payment invoices
export const getAllPaymentInvoices = () => PaymentInvoice.find();

// Get payment invoices by userId
export const getPaymentInvoicesByUserId = (userId: string) => PaymentInvoice.find({ userId });

// Get payment invoices by bonoId
export const getPaymentInvoicesByPanelId = (panelId: string) => PaymentInvoice.find({ panelId });

// Get a payment invoice by _id
export const getPaymentInvoiceById = (id: string) => PaymentInvoice.findById(id);

// Delete a payment invoice by _id
export const deletePaymentInvoiceById = (id: string) => PaymentInvoice.findByIdAndDelete(id);

// Delete all payment invoices by userId
export const deletePaymentInvoicesByUserId = (userId: string) => PaymentInvoice.deleteMany({ userId });

// Delete all payment invoices by bonoId
export const deletePaymentInvoicesByBonoId = (bonoId: string) => PaymentInvoice.deleteMany({ bonoId });

// Update a payment invoice by _id
export const updatePaymentInvoiceById = (id: string, update: Partial<Record<string, any>>) => PaymentInvoice.findByIdAndUpdate(id, update, { new: true });

// Update a payment invoice by userId + bonoId + network
export const updatePaymentInvoiceByData = (userId: string, panelId: string, update: Partial<Record<string, any>>) =>
  PaymentInvoice.findOneAndUpdate({ userId: userId, panelId: panelId }, update, { new: true });

// Get a payment invoice by userId + bonoId + network
export const getPaymentInvoiceByData = (userId: string, panelId: string) =>
  PaymentInvoice.findOne({ userId: userId, panelId: panelId });

/* NEW FUNCTIONS TO HANDLE INDIVIDUAL PAYMENTS */
// TODO -- Revisar necesidad de estas funciones
// Add a new payment to an invoice (with only timeStamp, paid, trxPaid)
export const addPaymentToInvoice = (invoiceId: string, payment: { timeStamp: Date; paid: boolean; trxPaid: string; amount?: number; }) =>
  PaymentInvoice.findByIdAndUpdate(
    invoiceId,
    { $push: { payments: payment } },
    { new: true }
  );

// Mark a payment as paid using its timestamp
export const markPaymentAsPaid = (invoiceId: string, timeStamp: Date, update: { paid: boolean; trxPaid: string; amount?: number; }) =>
  PaymentInvoice.findOneAndUpdate(
    { _id: invoiceId, "payments.timeStamp": timeStamp },
    { $set: { "payments.$.paid": update.paid, "payments.$.trxPaid": update.trxPaid, "payments.$.amount": update.amount } }, { new: true }
  );

// Remove a specific payment by timestamp
export const removePaymentFromInvoice = (invoiceId: string, timeStamp: Date) =>
  PaymentInvoice.findByIdAndUpdate(invoiceId, { $pull: { payments: { timeStamp } } }, { new: true });

// Add a log entry to an invoice
export const addLogToInvoice = (invoiceId: string, log: { timeStamp: Date; trxStable: string; trxTransfer: string; }) =>
  PaymentInvoice.findByIdAndUpdate(invoiceId, { $push: { logs: log } }, { new: true });
