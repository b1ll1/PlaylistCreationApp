// types/spotify.ts
  
  export interface Artist {
    artist: string;
    id: string | null;
  }
  
  export interface Track {
    track: string;
    id: string | null;
  }
  
  export interface PlaylistData {
    artists?: string[];
    tracks?: string[];
    genres?: string[];
    duration: number; // Duration in minutes
  }
  
  export interface RecommendationsResponse {
    tracks: Array<{
      uri: string;
      duration_ms: number;
    }>;
  }
  
  export interface CreatePlaylistResponse {
    id: string;
  }