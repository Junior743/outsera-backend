import { DataSource } from "typeorm"
import path from "path"

export let AppDataSource: DataSource

export async function initializeDatabase(databasePath: string) {
  try {
    AppDataSource = new DataSource({
      type: "sqlite",
      database: databasePath,
      synchronize: true,
      logging: false,
      entities: [path.join(__dirname, "..", "models", "*.ts")],
      migrations: [],
      subscribers: [],
    })

    if (!AppDataSource.isInitialized) await AppDataSource.initialize()
  } catch (error) {
    console.error(
      "Erro ao tentar estabelecer conexão com a base de dados: ",
      error,
    )
    process.exit(1)
  }
}
