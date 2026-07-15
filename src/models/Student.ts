import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import {
  BLOOD_GROUPS,
  GENDERS,
  HOUSES,
  STUDENT_STATUSES,
  type BloodGroup,
  type Gender,
  type House,
  type StudentStatus,
} from "./enums";

export interface IAddress {
  line1?: string;
  line2?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface IGuardianDetails {
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
}

export interface IEmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface IMedicalInfo {
  conditions?: string;
  allergies?: string;
  medications?: string;
  doctorName?: string;
  doctorPhone?: string;
}

export interface IStudent extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  admissionNumber: string;
  rollNumber?: string;
  aadhaarNumber?: string;
  name: string;
  photoUrl?: string;
  dob: Date;
  gender: Gender;
  bloodGroup?: BloodGroup;
  address?: IAddress;
  guardianDetails?: IGuardianDetails;
  emergencyContact?: IEmergencyContact;
  previousSchool?: string;
  currentClass: Types.ObjectId;
  section: Types.ObjectId;
  house?: House;
  isHosteller: boolean;
  medicalInfo?: IMedicalInfo;
  parents: Types.ObjectId[];
  academicYear: Types.ObjectId;
  school: Types.ObjectId;
  status: StudentStatus;
  admissionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    line1: String,
    line2: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const guardianDetailsSchema = new Schema<IGuardianDetails>(
  {
    fatherName: String,
    fatherPhone: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    motherOccupation: String,
    guardianName: String,
    guardianPhone: String,
    guardianRelation: String,
  },
  { _id: false }
);

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const medicalInfoSchema = new Schema<IMedicalInfo>(
  {
    conditions: String,
    allergies: String,
    medications: String,
    doctorName: String,
    doctorPhone: String,
  },
  { _id: false }
);

const studentSchema = new Schema<IStudent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    admissionNumber: { type: String, required: true, trim: true, uppercase: true },
    rollNumber: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true, select: false },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    dob: { type: Date, required: true },
    gender: { type: String, enum: GENDERS, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    address: addressSchema,
    guardianDetails: guardianDetailsSchema,
    emergencyContact: emergencyContactSchema,
    previousSchool: { type: String, trim: true },
    currentClass: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    house: { type: String, enum: HOUSES },
    isHosteller: { type: Boolean, default: true },
    medicalInfo: medicalInfoSchema,
    parents: [{ type: Schema.Types.ObjectId, ref: "Parent" }],
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    status: { type: String, enum: STUDENT_STATUSES, default: "active" },
    admissionDate: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

studentSchema.index({ school: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ name: "text", admissionNumber: "text", rollNumber: "text" });

export const Student: Model<IStudent> =
  models.Student || model<IStudent>("Student", studentSchema);
