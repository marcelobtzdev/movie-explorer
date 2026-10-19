export interface MovieDetailResponseDto {
  readonly backdrop_path: string | null;
  readonly genres: readonly { readonly id: number; readonly name: string }[];
  readonly id: number;
  readonly overview: string;
  readonly release_date: string;
  readonly title: string;
}
