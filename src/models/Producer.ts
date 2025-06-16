import { Movie } from "./Movie"
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"

@Entity("producers")
export class Producer {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  name!: string

  @ManyToMany(() => Movie, (movie) => movie.producers)
  movies!: Movie[]
}
