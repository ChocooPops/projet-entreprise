export interface UserModel {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE' | 'NOT_ACTIVATE',
    profilePhoto: string,
    createdAt: Date,
}