import mongoose from "mongoose";

// Define the schema for a payment invoice
const InvoiceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    bonoId: { type: String, required: true },
    endDate: { type: String, required: true },
    network: { type: String, required: true },
    amount: { type: Number, required: true },
    payments: [
        {    
            timeStamp: { type: Date, required: false },
            paid: { type: Boolean, required: true },
            trxPaid: { type: String, required: false }
        },
    ],
    logs: [
        {
            timeStamp: { type: Date, required: true },
            trxStable: { type: String, required: true },
            trxTransfer: { type: String, required: true }
        }
    ] 
});

// Create the model
export const PaymentInvoice = mongoose.model("PaymentInvoice", InvoiceSchema);

// Create a new payment invoice
export const createPaymentInvoice = (values: Record<string, any>) =>
    new PaymentInvoice(values).save();

// Get all payment invoices
export const getAllPaymentInvoices = () => PaymentInvoice.find();

// Get payment invoices by userId
export const getPaymentInvoicesByUserId = (userId: string) =>
    PaymentInvoice.find({ userId });

// Get payment invoices by bonoId
export const getPaymentInvoicesByBonoId = (bonoId: string) =>
    PaymentInvoice.find({ bonoId });

// Get a payment invoice by _id
export const getPaymentInvoiceById = (id: string) =>
    PaymentInvoice.findById(id);

// Delete a payment invoice by _id
export const deletePaymentInvoiceById = (id: string) =>
    PaymentInvoice.findByIdAndDelete(id);

// Delete all payment invoices by userId
export const deletePaymentInvoicesByUserId = (userId: string) =>
    PaymentInvoice.deleteMany({ userId });

// Delete all payment invoices by bonoId
export const deletePaymentInvoicesByBonoId = (bonoId: string) =>
    PaymentInvoice.deleteMany({ bonoId });

// Update a payment invoice by _id
export const updatePaymentInvoiceById = (
    id: string,
    update: Partial<Record<string, any>>
) => PaymentInvoice.findByIdAndUpdate(id, update, { new: true });

// Update a payment invoice by userId + bonoId + network
export const updatePaymentInvoiceByData = (
    userId: string,
    bondId: string,
    network: string,
    update: Partial<Record<string, any>>
) =>
    PaymentInvoice.findOneAndUpdate(
        { userId: userId, bonoId: bondId, network: network },
        update,
        { new: true }
    );

// Get a payment invoice by userId + bonoId + network
export const getPaymentInvoiceByData = (
    userId: string,
    bondId: string,
    network: string
) =>
    PaymentInvoice.findOne({
        userId: userId,
        bonoId: bondId,
        network: network,
    });

/* NEW FUNCTIONS TO HANDLE INDIVIDUAL PAYMENTS */

// Add a new payment to an invoice (with only timeStamp, paid, trxPaid)
export const addPaymentToInvoice = (
    invoiceId: string,
    payment: {
        timeStamp: Date;
        paid: boolean;
        trxPaid: string;
    }
) =>
    PaymentInvoice.findByIdAndUpdate(
        invoiceId,
        { $push: { payments: payment } },
        { new: true }
    );

// Mark a payment as paid using its timestamp
export const markPaymentAsPaid = (
    invoiceId: string,
    timeStamp: Date,
    update: {
        paid: boolean;
        trxPaid: string;
    }
) =>
    PaymentInvoice.findOneAndUpdate(
        { _id: invoiceId, "payments.timeStamp": timeStamp },
        {
            $set: {
                "payments.$.paid": update.paid,
                "payments.$.trxPaid": update.trxPaid,
            },
        },
        { new: true }
    );

// Remove a specific payment by timestamp
export const removePaymentFromInvoice = (invoiceId: string, timeStamp: Date) =>
    PaymentInvoice.findByIdAndUpdate(
        invoiceId,
        { $pull: { payments: { timeStamp } } },
        { new: true }
    );

// Add a log entry to an invoice
export const addLogToInvoice = (
    invoiceId: string,
    log: {
        timeStamp: Date;
        trxStable: string;
        trxTransfer: string;
    }
) =>
    PaymentInvoice.findByIdAndUpdate(
        invoiceId,
        { $push: { logs: log } },
        { new: true }
    );
