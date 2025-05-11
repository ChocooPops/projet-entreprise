import { FileModel } from "./file.interface";
import { UserModel } from "./user.interface";

export interface MessageModel {
    id: string,
    content: string,
    conversationId: string,
    type: 'TEXT_USER_TO_USER' | 'TEXT_USER_TO_AI' | 'ASK_ANALYSE_CONV' | 'TEXT_AI_SIMPLE_ANSWER' | 'TEXT_AI_ANALYSIS_CONV' | 'TEXT_AI_ERROR' | 'FILE',
    author: UserModel,
    createdAt?: Date,
    file?: FileModel
}