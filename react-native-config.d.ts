declare module 'react-native-config' {
  export interface NativeConfig {
    TMDB_ACCESS_TOKEN?: string;
    TMDB_BASE_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
