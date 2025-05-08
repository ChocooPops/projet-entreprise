import { UserModel } from "./user.interface";

export interface TaskModel {
    id: string,
    title: string,
    description: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    assignedUsers: UserModel[]
}