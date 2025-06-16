import { Award } from "./Award"
import { Movie } from "./Movie"
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm"

@Entity("nominated_movies")
export class NominatedMovie {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "boolean", default: false })
  winner!: boolean

  @Column()
  year!: number

  @ManyToOne(() => Award, (award) => award.nominatedMovies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "awardId" })
  award!: Award

  @Column()
  awardId!: number

  @ManyToOne(() => Movie, (movie) => movie.nominatedMovies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "movieId" })
  movie!: Movie

  @Column()
  movieId!: number
}
