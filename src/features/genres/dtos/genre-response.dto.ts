export interface GenreResponseDto {
  readonly genres: readonly {
    readonly id: number;
    readonly name: string;
  }[];
}
