import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()
const bucketName = process.env.TODO_S3_BUCKET

export async function getTodos(jwtToken: string
): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getTodos(userId)
}

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  return await todoAccess.createTodo({
    createdAt: new Date().toISOString(),
    done: false,
    dueDate: CreateTodoRequest.dueDate,
    name: CreateTodoRequest.name,
    todoId: todoId,
    userId: userId,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
  })
}

export async function deleteTodo(key: string) {
  await todoAccess.deleteTodo(key)
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string
) {
  return await todoAccess.updataTodo(
    todoId,
    UpdateTodoRequest.name,
    UpdateTodoRequest.dueDate,
    UpdateTodoRequest.done);
}

export function getUploadUrl(todoId: string): string {
  return todoAccess.getUploudURL(todoId)
}



