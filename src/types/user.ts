import { Department } from "./department";
import { Role } from "./role";
import { TaskUser } from "./taskUser";

export interface User {
  id: string;
  fullName?: string;
  dayOfBirth?: string;
  email: string;
  password: string;
  department: Department;
  pictureProfile?: string;
  createDate: string;
  role: Role;
  status: string;
  TaskUser: TaskUser[];
}
