import Patient, { type IPatient } from "../models/Patient";

export interface CreatePatientData {
  patientId: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: "male" | "female" | "other";
  phone: string;
  address: string;
  allergies?: string;
  notes?: string;
}

export const createPatient = async (
  data: CreatePatientData,
): Promise<IPatient> => {
  const existingPatient = await Patient.findOne({
    patientId: data.patientId,
  });

  if (existingPatient) {
    throw new Error("Patient ID already exists.");
  }

  const patient = await Patient.create(data);

  return patient;
};

export const getAllPatients = async (): Promise<IPatient[]> => {
  return Patient.find().sort({ createdAt: -1 });
};

export const getPatientById = async (
  id: string,
): Promise<IPatient | null> => {
  return Patient.findById(id);
};

export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientData>,
): Promise<IPatient | null> => {
  return Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deletePatient = async (
  id: string,
): Promise<IPatient | null> => {
  return Patient.findByIdAndDelete(id);
};