import { Schema, model, Document } from 'mongoose';

// Interfaz del documento
export interface IRetailMarket extends Document {
  reference: string;
  location: string;
  owner?: string;
}

// Esquema Mongoose
const RetailMarketSchema = new Schema<IRetailMarket>({
  reference: { type: String, required: true },
  location: { type: String, required: true },
  owner: { type: String },
});

export const RetailMarketModel = model<IRetailMarket>('RetailMarket', RetailMarketSchema);

// Funciones CRUD básicas
export const getRetailMarkets = () => RetailMarketModel.find();
export const getRetailMarketById = (id: string) => RetailMarketModel.findById(id);
export const createRetailMarket = (values: Record<string, any>): Promise<IRetailMarket> => new RetailMarketModel(values).save();
export const deleteRetailMarketById = (id: string) => RetailMarketModel.findOneAndDelete({ _id: id });
export const updateRetailMarketById = (id: string, update: Partial<IRetailMarket>) => RetailMarketModel.findByIdAndUpdate(id, update, { new: true });
