import { FileModel } from "./file.interface";
import { UserModel } from "./user.interface";

export interface MessageModel {
    id: string,
    content: string,
    conversationId: string,
    type: 'TEXT_USER' | 'TEXT_AI_SUCCESS' | 'TEXT_AI_ERROR' | 'FILE',
    author: UserModel,
    createdAt?: Date,
    file?: FileModel
}