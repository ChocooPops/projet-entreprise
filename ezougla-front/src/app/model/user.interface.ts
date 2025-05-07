export interface UserModel {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE',
    profilePhoto: string,
    createdAt: Date,
}