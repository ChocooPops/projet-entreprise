import { UserModel } from "./user.interface";

export interface MessageModel {
    id : string,
    content : string,
    conversationId : string,
    type : 'USER' | 'AI',
    author : UserModel,
    createdAt : Date
}