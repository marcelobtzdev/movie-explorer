import type { MovieResponseDto } from './movie-response.dto';

export interface MoviePageResponseDto {
  readonly page: number;
  readonly results: readonly MovieResponseDto[];
  readonly total_pages: number;
  readonly total_results: number;
}
