export interface MovieResponseDto {
  readonly backdrop_path: string | null;
  readonly genre_ids: readonly number[];
  readonly id: number;
  readonly poster_path: string | null;
  readonly release_date: string;
  readonly title: string;
  readonly vote_average: number;
}
