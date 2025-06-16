import "reflect-metadata"
import { MovieAwardService } from "./services/MovieAwardService"
import { initializeDatabase } from "./config/database"
import { CsvService } from "./services/CsvService"
import { deleteDataBaseFile } from "./utils"
import router from "./routes"
import express from "express"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

const PORT = process.env?.PORT || 3000
const csvService = new CsvService()
const movieAwardService = new MovieAwardService()

export const app = express()
app.use(express.json())
app.use("/api/v1", router)

const csvFilePath = path.join(
  __dirname,
  "..",
  process.env.CSV_FILE_NAME || "Movielist.csv",
)
const dbFilePath = path.join(
  __dirname,
  "..",
  process.env.DATABASE_FILE_NAME || "database.sqlite",
)

async function startApplication() {
  try {
    if (require.main === module) {
      await deleteDataBaseFile(dbFilePath)

      console.log("Inicializando base de dados...")
      await initializeDatabase(dbFilePath)
      console.log("Nova base de dados configurada com sucesso!")

      console.log("Carregando informações na base de dados...")
      const csvData = await csvService.readCsv(csvFilePath)
      await movieAwardService.importParsedData(csvData)
      console.log("Base de dados populada com sucesso!")

      console.log("Inicializando servidor...")
      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
        console.log(`Acesse http://localhost:${PORT}`)
      })
    }
  } catch (error) {
    console.error("Ocorreu um erro ao tentar inicializar o servidor: ", error)
    process.exit(1)
  }
}

startApplication()
