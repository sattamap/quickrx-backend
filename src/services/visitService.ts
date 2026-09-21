import Visit, { type IVisit } from "../models/Visit";
import Patient from "../models/Patient";
import type { Types } from "mongoose";

const mapVisit = (visit: IVisit) => ({
  id: visit._id.toString(),
  patientId: visit.patientId.toString(),
  ageAtVisit: visit.ageAtVisit,
  visitDate: visit.visitDate,
  chiefComplaint: visit.chiefComplaint,
  examination: visit.examination,
  diagnosis: visit.diagnosis,
  clinicalNotes: visit.clinicalNotes,
  createdAt: visit.createdAt,
  updatedAt: visit.updatedAt,
});

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
) => {
  const patient = await Patient.findById(data.patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const visit = await Visit.create(data);

  return mapVisit(visit);
};

export const getAllVisits = async () => {
  const visits = await Visit.find()
    .populate(
      "patientId",
      "patientId name age gender",
    )
    .sort({
      visitDate: -1,
    });

  return visits.map((visit) => ({
    id: visit._id.toString(),
    patientId:
      typeof visit.patientId === "object" &&
      visit.patientId !== null &&
      "_id" in visit.patientId
        ? String(visit.patientId._id)
        : String(visit.patientId),
    ageAtVisit: visit.ageAtVisit,
    visitDate: visit.visitDate,
    chiefComplaint: visit.chiefComplaint,
    examination: visit.examination,
    diagnosis: visit.diagnosis,
    clinicalNotes: visit.clinicalNotes,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
  }));
};

export const getVisitById = async (
  id: string,
) => {
  const visit = await Visit.findById(id).populate(
    "patientId",
    "patientId name age gender",
  );

  if (!visit) {
    return null;
  }

  return {
    id: visit._id.toString(),
    patientId:
      typeof visit.patientId === "object" &&
      visit.patientId !== null &&
      "_id" in visit.patientId
        ? String(visit.patientId._id)
        : String(visit.patientId),
    ageAtVisit: visit.ageAtVisit,
    visitDate: visit.visitDate,
    chiefComplaint: visit.chiefComplaint,
    examination: visit.examination,
    diagnosis: visit.diagnosis,
    clinicalNotes: visit.clinicalNotes,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
  };
};

export const getVisitsByPatientId = async (
  patientId: string,
) => {
  const visits = await Visit.find({
    patientId,
  })
    .populate(
      "patientId",
      "patientId name age gender",
    )
    .sort({
      visitDate: -1,
    });

  return visits.map(mapVisit);
};

export const updateVisit = async (
  id: string,
  data: Partial<CreateVisitData>,
) => {
  const visit = await Visit.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    },
  ).populate(
    "patientId",
    "patientId name age gender",
  );

  if (!visit) {
    return null;
  }

  return mapVisit(visit);
};

export const deleteVisit = async (
  id: string,
) => {
  const visit = await Visit.findByIdAndDelete(id);

  if (!visit) {
    return null;
  }

  return mapVisit(visit);
};