import { MessageModel } from "./message.interface";

export interface ConversationModel {
    id: string,
    projectId: string,
    title: string,
    messages: MessageModel[]
}
