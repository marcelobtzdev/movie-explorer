import { create } from 'zustand';

export interface MoviesStore {
  clearSearchTerm: () => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export const useMoviesStore = create<MoviesStore>()((set) => ({
  clearSearchTerm: () => set(() => ({ searchTerm: '' })),
  searchTerm: '',
  setSearchTerm: (searchTerm) => set(() => ({ searchTerm })),
}));
