import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try {
    const result = await updateTodo(updatedTodo, todoId)
    logger.info("Updated to do task: " + result)
    return {
      statusCode: 200,
      body: 'true'
    }
  }
  catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e)
    }
  }
})
handler.use(
  cors({
    credentials: true
  })
)
