import axios from "axios";
import {
  RecommendationsResponse,
  CreatePlaylistResponse,
} from "../types/spotify";

// Function to get a new access token
async function getNewAccessToken(): Promise<string> {
  const refreshToken = process.env.REFRESH_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing environment variables");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching new access token:", error);
    throw error;
  }
}

// Function to search Spotify for artists or tracks
async function searchSpotify(
  query: string,
  type: "artist" | "track"
): Promise<any[]> {
  const accessToken = await getNewAccessToken();

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: {
        q: query,
        type: type,
        limit: 1, // Adjust limit as needed
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data[type + "s"].items;
  } catch (error) {
    console.error(`Error searching for ${type}:`, error);
    throw error;
  }
}

// Function to find artist ID
async function findArtistId(name: string): Promise<string | null> {
  const artists = await searchSpotify(name, "artist");
  if (artists.length > 0) {
    return artists[0].id;
  }
  return null;
}

// Function to find track ID
async function findTrackId(name: string): Promise<string | null> {
  const tracks = await searchSpotify(name, "track");
  if (tracks.length > 0) {
    return tracks[0].id;
  }
  return null;
}

async function fetchRecommendations(
  accessToken: string,
  seedArtists: string,
  seedTracks: string,
  seedGenres: string,
  limit = 50
): Promise<RecommendationsResponse> {
  const recommendationsEndpoint = "https://api.spotify.com/v1/recommendations";
  const queryParams = new URLSearchParams({
    seed_artists: seedArtists,
    seed_tracks: seedTracks,
    seed_genres: seedGenres,
    limit: limit.toString(), // Convert limit to string
  });

  const url = `${recommendationsEndpoint}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations from Spotify API.");
  }

  return await response.json();
}

async function createPlaylist(
  accessToken: string,
  userId: string,
  playlistName: string,
  isPublic: boolean = true
): Promise<CreatePlaylistResponse> {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        public: isPublic,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create a playlist.");
  }

  return await response.json();
}

async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add tracks to the playlist.");
  }
}

async function totalPlaylists(
  accessToken: string,
  userId: string
): Promise<number> {
  try {
    // Fetch playlists from the Spotify API
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Return the total number of playlists
    return data.total ?? 0; // Return 0 if `total` is undefined
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return 0; // Return 0 in case of error
  }
}

export {
  getNewAccessToken,
  searchSpotify,
  findArtistId,
  findTrackId,
  fetchRecommendations,
  createPlaylist,
  addTracksToPlaylist,
  totalPlaylists
};
