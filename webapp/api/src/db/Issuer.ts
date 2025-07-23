import mongoose, { Types, Document } from "mongoose";
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Número de rondas de hashing

export interface IIssuer extends Document {
  _id: Types.ObjectId;
  entityLegalName: string;
  taxIdNumber: string;
  website: string;
  name: string;
  surname: string;
  country: string;
  idCard: string;
  email: string;
  password: string;
  walletAddress?: string;
  accounts?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const IssuerSchema = new mongoose.Schema({
  entityLegalName: { type: String, required: true },
  taxIdNumber: { type: String, required: true, unique: true },
  website: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  country: { type: String, required: true },
  idCard: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  walletAddress: { type: String, required: false },
  accounts: { type: Object, required: false },
}, { timestamps: true });


// Middleware para hashear la contraseña antes de guardar
IssuerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Método para comparar contraseñas
IssuerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const IssuerModel = mongoose.model("Issuer", IssuerSchema);
// 📌 Funciones CRUD básicas
export const getIssuers = () => IssuerModel.find();
export const getIssuerById = (id: string) => IssuerModel.findById(id);
export const getIssuerByEmail = (email: string) => IssuerModel.findOne({email});
export const createIssuer = (values: Record<string, any>): Promise<IIssuer> => new IssuerModel(values).save();
export const deleteIssuerById = (id: string) => IssuerModel.findOneAndDelete({ _id: id });
export const updateIssuerById = (id: string, update: Partial<IIssuer>) =>IssuerModel.findByIdAndUpdate(id, update, { new: true });
