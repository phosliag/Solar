import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrecioLuz extends Document {
  fecha: string;
  precios: number[];
}

const PrecioLuzSchema: Schema = new Schema({
  fecha: { type: String, required: true, unique: true },
  precios: { type: [Number], required: true }
});

export const PrecioLuz: Model<IPrecioLuz> = mongoose.models.PrecioLuz || mongoose.model<IPrecioLuz>('PrecioLuz', PrecioLuzSchema, 'precios-luz'); 