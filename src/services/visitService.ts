import Visit, { type IVisit } from "../models/Visit";
import Patient from "../models/Patient";
import Prescription from "../models/Prescription";
import type { Types } from "mongoose";

const mapVisit = (visit: IVisit) => ({
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
  userId: Types.ObjectId,
  data: CreateVisitData,
) => {
  const patient = await Patient.findOne({
    _id: data.patientId,
    userId,
  });

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const visit = await Visit.create(data);

  return mapVisit(visit);
};

export const getAllVisits = async (
  userId: Types.ObjectId,
) => {
  const patients = await Patient.find({
    userId,
  }).select("_id");

  const patientIds = patients.map(
    (patient) => patient._id,
  );

  const visits = await Visit.find({
    patientId: { $in: patientIds },
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

export const getVisitById = async (
  userId: Types.ObjectId,
  id: string,
) => {
  const visit = await Visit.findById(id).populate(
    "patientId",
    "patientId name age gender userId",
  );

  if (!visit) {
    return null;
  }

  const patientId =
    typeof visit.patientId === "object" &&
    visit.patientId !== null &&
    "_id" in visit.patientId
      ? visit.patientId._id
      : visit.patientId;

  const patient = await Patient.findOne({
    _id: patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  return mapVisit(visit);
};

export const getVisitsByPatientId = async (
  userId: Types.ObjectId,
  patientId: string,
) => {
  const patient = await Patient.findOne({
    _id: patientId,
    userId,
  });

  if (!patient) {
    return [];
  }

  const visits = await Visit.find({
    patientId: patient._id,
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
  userId: Types.ObjectId,
  id: string,
  data: Partial<CreateVisitData>,
) => {
  const existingVisit = await Visit.findById(id);

  if (!existingVisit) {
    return null;
  }

  const patient = await Patient.findOne({
    _id: existingVisit.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  // Do not allow a visit to be moved to another patient.
  const { patientId: _ignoredPatientId, ...updateData } =
    data;

  const visit = await Visit.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!visit) {
    return null;
  }

  return mapVisit(visit);
};

export const deleteVisit = async (
  userId: Types.ObjectId,
  id: string,
) => {
  const visit = await Visit.findById(id);

  if (!visit) {
    return null;
  }

  const patient = await Patient.findOne({
    _id: visit.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  // Delete the prescription associated with this visit, if one exists.
  await Prescription.deleteOne({
    visitId: visit._id,
  });

  // Finally, delete the visit.
  await Visit.findByIdAndDelete(id);

  return mapVisit(visit);
};