import mongoose from "mongoose";

export interface IBond {
  _id?: mongoose.Types.ObjectId;
  itemName: string;
  itemCode: string;
  startDate: Date;
  endDate: Date;
  description: string;
  rate: number;
  frequency: "Monthly" | "Quarterly" | "Semi-annualy" | "Annualy";
  targetAmount: number;
  totalUnits: number;
  unitPrice: number;
  earlyExitOption: "yes" | "no";
  exitPenalty?: number;
  exitStartDate?: Date;
  exitEndDate?: Date;
  network: "ALASTRIA" | "AMOY";
  tokenState: Array<{network: string, amount: number, contractAddress?: string, availableAmount?: number}>;
  creator: string;
  contractAddress?: string;
}

// Define the Mongoose Schema for the FormData type
const ObjSchema = new mongoose.Schema({
  itemName: {type: String,required: true},
  itemCode: {type: String,required: true, unique: true},
  startDate: {type: Date,required: true},
  endDate: {type: Date,required: true},
  description: {type: String,required: true},
  rate: {type: Number,required: true},
  frequency: {type: String,enum: ["Monthly", "Quarterly", "Semi-annualy", "Annualy"],required: true,},
  targetAmount: {type: Number,required: true},
  totalUnits: {type: Number,required: true},
  unitPrice: {type: Number,required: true},
  earlyExitOption: {type: String,enum: ["yes", "no"], required: true,},
  exitPenalty: {type: Number, required: function () {return this.earlyExitOption === "yes";}},
  exitStartDate: {type: Date, required: function () {return this.earlyExitOption === "yes";}},
  exitEndDate: {type: Date, required: function () {return this.earlyExitOption === "yes";}},
  network: {type: String,enum: ["ALASTRIA", "AMOY"], required: true},
  tokenState: [
    {network: {type: String, required:true}, amount: {type: Number, required:true}, contractAddress:{type: String}, availableAmount: { type: Number, required: false } }
  ],
  creator: {type: String, required: true},
  contractAddress: {type: String}
});
ObjSchema.index({ bondName: 1 }, { unique: true });

// Export the schema as a Mongoose model
export const GenericModel = mongoose.model("Obj", ObjSchema);

export const getEntities = () => GenericModel.find();
export const getEntitiesByUserId = (userId: string) => GenericModel.find({ creatorCompany: userId });
export const getEntityById = (id: string) => GenericModel.findById(id);
export const getEntityByEntityName = (entityName: string) => GenericModel.findOne({ entityName: entityName });
export const createNewEntity = (values: Record<string, any>) =>
  new GenericModel(values).save();
export const deleteEntityById = (id: string) =>
  GenericModel.findOneAndDelete({ _id: id });
export const updateEntityById = (id: string, update: Partial<IBond>) =>
  GenericModel.findByIdAndUpdate(id, update, { new: true });

