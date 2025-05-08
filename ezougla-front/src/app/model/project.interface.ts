import { UserModel } from "./user.interface";

export interface ProjectModel {
    id: string,
    name: string,
    description: string,
    srcBackground: string,
    assignedUsers: UserModel[]
}