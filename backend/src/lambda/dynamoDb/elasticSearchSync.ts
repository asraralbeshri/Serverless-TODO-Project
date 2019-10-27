import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [esHost],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', JSON.stringify(event))
  for (const record of event.Records) {
    logger.info('Processing record', JSON.stringify(record))

    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const todoId = newItem.todoId.S

    const body = {
      todoId: newItem.todoId.S,
      userId: newItem.userId.S,
      name: newItem.name.S,
      createdAt: newItem.createdAt.S,
      dueDate: newItem.dueDate.S,
      done: newItem.done.BOOL,
      attachmentUrl: newItem.attachmentUrl.S
    }

    await es.index({
      index: 'todos-index',
      type: 'images',
      id: todoId,
      body
    })
  }
}