import { NominatedMovie } from "./NominatedMovie"
import { Producer } from "./Producer"
import { Studio } from "./Studio"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm"

@Entity("movies")
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  title!: string

  @ManyToMany(() => Studio, (studio) => studio.movies, {
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "movie_studios",
    joinColumn: { name: "movieId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "studioId", referencedColumnName: "id" },
  })
  studios!: Studio[]

  @ManyToMany(() => Producer, (producer) => producer.movies, {
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "movie_producers",
    joinColumn: { name: "movieId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "producerId", referencedColumnName: "id" },
  })
  producers!: Producer[]

  @OneToMany(() => NominatedMovie, (nominatedMovie) => nominatedMovie.movie)
  nominatedMovies!: NominatedMovie[]
}
