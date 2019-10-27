import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createTodo } from '../../businessLogic/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  try {
    const newItem = await createTodo(newTodo, jwtToken)
    // TODO: Implement creating a new TODO item
    return {
      statusCode: 201,
      body: JSON.stringify(newItem)

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
