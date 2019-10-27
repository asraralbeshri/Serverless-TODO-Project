# Serverless TODO Project
The TODO is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. 
It allows users to:
* register and log into a web client, 
* create to-do tasks, 
* upload attachment like photo, 
* update and delete tasks.

## Backend
### Installing project dependencies
This project uses NPM to manage software dependencies. NPM Relies on the package.json files located in the project repositories. After cloning, open your terminal and run:

`npm install`

*tip: npm i is shorthand for npm install*

### Deploy application
Open a new terminal within the project directory and run:

`sls deploye -v`

*tip: sls is shorthand for serverless*


## Frontend - client
Open a new terminal within the project directory and run:

`npm start`

This command will run the application in the development mode.
Open http://localhost:3000 to view it in the browser.

### Installing useful tool
[Postman](https://www.getpostman.com/)
Postman is a useful tool to issue and save requests. Postman can create GET, PUT, POST, etc. requests complete with bodies. It can also be used to test endpoints automatically.
