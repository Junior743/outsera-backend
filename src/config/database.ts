import { DataSource } from "typeorm"
import path from "path"

export let AppDataSource: DataSource

export async function initializeDatabase() {
  try {
    AppDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      synchronize: true,
      logging: false,
      entities: [
        process.env.NODE_ENV === "production"
          ? path.join(__dirname, "..", "models", "*.js")
          : path.join(__dirname, "..", "models", "*.ts"),
      ],
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
