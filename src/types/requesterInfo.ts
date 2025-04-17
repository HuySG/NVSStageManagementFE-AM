import { Department } from "./department";

export interface RequesterInfo {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: Department;
}
