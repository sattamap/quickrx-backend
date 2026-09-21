import Patient, { type IPatient } from "../models/Patient";

const mapPatient = (patient: IPatient) => ({
  id: patient._id.toString(),
  patientId: patient.patientId,
  name: patient.name,
  age: patient.age,
  dateOfBirth: patient.dateOfBirth,
  gender: patient.gender,
  phone: patient.phone,
  address: patient.address,
  allergies: patient.allergies,
  notes: patient.notes,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});

export interface CreatePatientData {
  patientId?: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: "male" | "female" | "other";
  phone: string;
  address: string;
  allergies?: string;
  notes?: string;
};

const generatePatientId = async (): Promise<string> => {
  const lastPatient = await Patient.findOne({
    patientId: /^PAT-\d+$/,
  }).sort({ patientId: -1 });

  if (!lastPatient) {
    return "PAT-001";
  }

  const match = lastPatient.patientId.match(/^PAT-(\d+)$/);

  if (!match) {
    return "PAT-001";
  }

  const nextNumber = Number(match[1]) + 1;

  return `PAT-${String(nextNumber).padStart(3, "0")}`;
};

export const createPatient = async (
  data: CreatePatientData,
) => {
  const patientId =
    data.patientId?.trim() || await generatePatientId();

  const existingPatient = await Patient.findOne({
    patientId,
  });

  if (existingPatient) {
    throw new Error("Patient ID already exists.");
  }

  const patient = await Patient.create({
    ...data,
    patientId,
  });

  return mapPatient(patient);
};

export const getAllPatients = async () => {
  const patients = await Patient.find().sort({
    createdAt: -1,
  });

  return patients.map(mapPatient);
};

export const getPatientById = async (
  id: string,
) => {
  const patient = await Patient.findById(id);

  if (!patient) {
    return null;
  }

  return mapPatient(patient);
};

export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientData>,
) => {
  const patient = await Patient.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!patient) {
    return null;
  }

  return mapPatient(patient);
};

export const deletePatient = async (
  id: string,
) => {
  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    return null;
  }

  return mapPatient(patient);
};