export interface TaskModel {
    id: string,
    title: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
}