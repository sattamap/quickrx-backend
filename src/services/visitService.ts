import Visit, { type IVisit } from "../models/Visit";
import Patient from "../models/Patient";
import type { Types } from "mongoose";

export interface CreateVisitData {
  patientId: Types.ObjectId;
  ageAtVisit: number;
  visitDate: Date;
  chiefComplaint: string;
  examination: IVisit["examination"];
  diagnosis?: string;
  clinicalNotes?: string;
}

export const createVisit = async (
  data: CreateVisitData,
): Promise<IVisit> => {
  const patient = await Patient.findById(data.patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const visit = await Visit.create(data);

  return visit;
};

export const getAllVisits = async (): Promise<IVisit[]> => {
  return Visit.find()
    .populate("patientId", "patientId name age gender")
    .sort({ visitDate: -1 });
};

export const getVisitById = async (
  id: string,
): Promise<IVisit | null> => {
  return Visit.findById(id).populate(
    "patientId",
    "patientId name age gender",
  );
};

export const getVisitsByPatientId = async (
  patientId: string,
): Promise<IVisit[]> => {
  return Visit.find({ patientId })
    .populate("patientId", "patientId name age gender")
    .sort({ visitDate: -1 });
};

export const updateVisit = async (
  id: string,
  data: Partial<CreateVisitData>,
): Promise<IVisit | null> => {
  return Visit.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("patientId", "patientId name age gender");
};

export const deleteVisit = async (
  id: string,
): Promise<IVisit | null> => {
  return Visit.findByIdAndDelete(id);
};