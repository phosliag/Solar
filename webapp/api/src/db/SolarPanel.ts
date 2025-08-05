import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISolarPanel extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  location: string;
  reference: string;
  price?: number;
  state: string;
  owner: string;
  stimatedProduction?: number;
  paymentFreq: string;
  installationYear?: number;
  NftId?: string;
}

const SolarPanelSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  reference: { type: String, required: true },
  price: { type: Number, required: true },
  state: { type: String, required: true },
  owner: { type: String, required: false },
  stimatedProduction: { type: Number, required: true },
  paymentFreq: { type: String, required: true },
  installationYear: { type: Number, required: true },
  NftId: { type: String, required: false },
}, { timestamps: true });

export const SolarPanel: Model<ISolarPanel> = mongoose.models.SolarPanel || mongoose.model<ISolarPanel>('SolarPanel', SolarPanelSchema);

// CRUD functions
export const getSolarPanels = () => SolarPanel.find();
export const getSolarPanelsByOwner = (owner: string) => SolarPanel.findOne({ owner });
export const getSolarPanelsByReference = (reference: string) => SolarPanel.findOne({ reference });
export const getSolarPanelById = (id: string) => SolarPanel.findById(id);
export const createSolarPanel = (values: Record<string, any>) => new SolarPanel(values).save();
export const updateSolarPanelById = (id: string, update: Partial<ISolarPanel>) => SolarPanel.findByIdAndUpdate(id, update, { new: true });
export const deleteSolarPanelById = (id: string) => SolarPanel.findByIdAndDelete(id); 