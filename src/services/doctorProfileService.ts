import DoctorProfile, {
  IDoctorProfile,
} from "../models/DoctorProfile.js";

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

export const getDoctorProfile = async (): Promise<IDoctorProfile | null> => {
  return DoctorProfile.findOne().sort({ createdAt: 1 });
};

export const createDoctorProfile = async (
  data: DoctorProfileInput,
): Promise<IDoctorProfile> => {
  const existingProfile = await DoctorProfile.findOne();

  if (existingProfile) {
    throw new Error("Doctor profile already exists.");
  }

  return DoctorProfile.create(data);
};

export const updateDoctorProfile = async (
  data: DoctorProfileInput,
): Promise<IDoctorProfile> => {
  let profile = await DoctorProfile.findOne();

  if (!profile) {
    profile = await DoctorProfile.create(data);
    return profile;
  }

  profile.doctorName = data.doctorName;
  profile.qualification = data.qualification ?? "";
  profile.specialty = data.specialty ?? "";
  profile.registrationNumber = data.registrationNumber ?? "";
  profile.phone = data.phone ?? "";
  profile.email = data.email ?? "";
  profile.clinicName = data.clinicName ?? "";
  profile.clinicAddress = data.clinicAddress ?? "";

  await profile.save();

  return profile;
};