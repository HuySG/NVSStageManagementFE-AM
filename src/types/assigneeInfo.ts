import { Department } from "./department";
import { Role } from "./role";
import { TaskUser } from "./taskUser";

export interface AssigneeInfo {
  id: string;
  fullName: string;
  dayOfBirth: string;
  email: string;
  pictureProfile: string;
  createDate: string;
  password: string;
  department: Department;
  role: Role;
  status: string;
  taskUsers: TaskUser[];
}
