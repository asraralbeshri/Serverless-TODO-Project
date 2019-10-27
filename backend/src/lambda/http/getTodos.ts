import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodos } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info('Processing event: ', event)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // TODO: Get all TODO items for a current user
  try{
  const todos = await getTodos(jwtToken)
  console.log("Items are:" +todos)
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
}
catch(e){
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
