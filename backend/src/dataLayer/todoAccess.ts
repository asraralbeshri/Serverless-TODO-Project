import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  // try to make pigination
  /*private params = {
  TableName: this.todosTable,
  IndexName: this.userIDIndex,
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: {
    ':userId': undefined
   // ':userId': userId
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined, //Pagination - LastEvaluatedKeyPair
  Limit: 2 //DataPerReq
 }*/
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIDIndex = process.env.User_ID_INDEX,
    private readonly s3 = new AWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.TODO_S3_BUCKET,
    private urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.userIDIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: true,
      //ExclusiveStartKey: nextKey, //Pagination - LastEvaluatedKeyPair
      //Limit: 2 //DataPerReq
    }).promise()
    const items = result.Items

    return items as TodoItem[]

    // try to make pigination
    /*if (result.LastEvaluatedKey) {
      result.ExclusiveStartKey = data.LastEvaluatedKey;
      return await getAllData(params);

  }*/
    // let data : TodoItem[] = null;
    // this.params.ExpressionAttributeValues = {':userId': userId }
    //  let result = await this.docClient.query(this.params).promise()
    //  items = result.Items
    // console.log("Items are " + items)
    // let i :number = 0
    /* while(items.length > 0) {
     data[i]=items[i]
     console.log("Data:"+data[i])
     i++
     }*/
    //console.log("Data:"+data)
    /*console.log("Last: ", result.LastEvaluatedKey)
    if (result.LastEvaluatedKey) {
      this.params.ExclusiveStartKey = result.LastEvaluatedKey;
      console.log("Call method again")
       return await this.getTodos(userId)*/
    // items = [...items, ...result.Items];
    //}
    //  else {
    // const rr=  items as TodoItem[]
    // let size = rr.length
    //console.log("Array size is "+size)
    // }
    // return await getAllData(params);
    //if (result.Count == 0) {
    //return undefined
    // }
  }


  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()
    todoItem.attachmentUrl = '';
    return todoItem as TodoItem
  }

  async deleteTodo(id: string) {
    // get sort key (createdAt)
    const items = await this.getCreatedAt(id)
    const createAt = items[0].createdAt
    //Delete item
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: id,
        createdAt: createAt
      }
    }).promise()
  }

  async updataTodo(id: string, name: string, dueDate: string, done: boolean) {
    // get sort key (createdAt)
    const items = await this.getCreatedAt(id)
    const createAt = items[0].createdAt
    //Update item
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: id,
        createdAt: createAt
      },
      UpdateExpression: "SET #name = :x , #dueDate = :y , #done = :z",
      ExpressionAttributeNames: {
        '#name': "name",
        '#dueDate': "dueDate",
        '#done': "done",
      },
      ExpressionAttributeValues: {
        ":x": name,
        ":y": dueDate,
        ":z": done,
      }
    }).promise()
  }

  getUploudURL(todoId: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }

  async getCreatedAt(todoId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()
    const items = result.Items
    return items as TodoItem[]
  }
}

// To send X-ray stream segments
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}




