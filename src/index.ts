import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { errorHandlerDefault } from './middlewares/error.midlewares'

const app = express()
const port = 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with Express and TypeScript!')
})

app.use(express.json()) // ✅ Cần thiết để đọc req.body
app.use('/users', usersRouter)
databaseService.connect()
app.use(errorHandlerDefault)
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
