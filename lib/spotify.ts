import axios from 'axios';

// Function to get a new access token
async function getNewAccessToken(): Promise<string> {
  const refreshToken = process.env.REFRESH_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing environment variables');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching new access token:', error);
    throw error;
  }
}

// Function to search Spotify for artists or tracks
async function searchSpotify(query: string, type: 'artist' | 'track'): Promise<any[]> {
  const accessToken = await getNewAccessToken();

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: type,
        limit: 1, // Adjust limit as needed
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data[type + 's'].items;
  } catch (error) {
    console.error(`Error searching for ${type}:`, error);
    throw error;
  }
}

// Function to find artist ID
async function findArtistId(name: string): Promise<string | null> {
  const artists = await searchSpotify(name, 'artist');
  if (artists.length > 0) {
    return artists[0].id;
  }
  return null;
}

// Function to find track ID
async function findTrackId(name: string): Promise<string | null> {
  const tracks = await searchSpotify(name, 'track');
  if (tracks.length > 0) {
    return tracks[0].id;
  }
  return null;
}

export { getNewAccessToken, searchSpotify, findArtistId, findTrackId };
