import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { deleteTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)

  logger.info("Extract to do id")
  const todoId = event.pathParameters.todoId
  try {
    // TODO: Remove a TODO item by id
    await deleteTodo(todoId)
    return {
      statusCode: 200,
      body: ''
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
