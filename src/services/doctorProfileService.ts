import DoctorProfile, {
  type IDoctorProfile,
} from "../models/DoctorProfile";

import type { Types } from "mongoose";

export interface DoctorProfileInput {
  doctorName: string;
  qualification?: string;
  specialty?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  clinicAddress?: string;
}

export const getDoctorProfile = async (
  userId: Types.ObjectId,
): Promise<IDoctorProfile | null> => {
  return DoctorProfile.findOne({
    userId,
  });
};

export const updateDoctorProfile = async (
  userId: Types.ObjectId,
  data: DoctorProfileInput,
): Promise<IDoctorProfile> => {
  let profile = await DoctorProfile.findOne({
    userId,
  });

  if (!profile) {
    profile = await DoctorProfile.create({
      userId,
      doctorName: data.doctorName,
      qualification: data.qualification ?? "",
      specialty:
        data.specialty ?? "Ophthalmology",
      registrationNumber:
        data.registrationNumber ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      clinicName: data.clinicName ?? "",
      clinicAddress: data.clinicAddress ?? "",
    });

    return profile;
  }

  profile.doctorName = data.doctorName;
  profile.qualification =
    data.qualification ?? "";
  profile.specialty =
    data.specialty ?? "Ophthalmology";
  profile.registrationNumber =
    data.registrationNumber ?? "";
  profile.phone = data.phone ?? "";
  profile.email = data.email ?? "";
  profile.clinicName =
    data.clinicName ?? "";
  profile.clinicAddress =
    data.clinicAddress ?? "";

  await profile.save();

  return profile;
};