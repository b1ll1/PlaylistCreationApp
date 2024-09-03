import { NextRequest, NextResponse } from "next/server";
import {
  findArtistId,
  findTrackId,
  getNewAccessToken,
} from "../../../lib/spotify";

// interface SpotifyUser {
//   display_name: string;
//   email: string;
//   country: string;
// }

// export async function GET(req: NextRequest) {
//   try {
//     const accessToken = await getNewAccessToken();

//     const response = await fetch("https://api.spotify.com/v1/me", {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch user data");
//     }

//     const data: SpotifyUser = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export const POST = async (req: NextRequest) => {
  const { playlistData } = await req.json();

  // Validate and get IDs for artists and tracks
  const artistIdPromises = (playlistData.artists || []).map(
    async (artist: string) => ({
      artist,
      id: await findArtistId(artist),
    })
  );
  const trackIdPromises = (playlistData.tracks || []).map(
    async (track: string) => ({
      track,
      id: await findTrackId(track),
    })
  );

  const artistResults = await Promise.all(artistIdPromises);
  const trackResults = await Promise.all(trackIdPromises);

  const validArtists = artistResults.filter((result) => result.id !== null);
  const validTracks = trackResults.filter((result) => result.id !== null);

  // Extract valid IDs and genres
  const artistIds = validArtists.map((artist) => artist.id);
  const trackIds = validTracks.map((track) => track.id);
  const genres = playlistData.genres || [];

  // Limit the number of seeds to the maximum allowed by Spotify API (5 per type)
  const seedArtists = artistIds.slice(0, 5).join(",");
  const seedTracks = trackIds.slice(0, 5).join(",");
  const seedGenres = genres.slice(0, 5).join(",");
  console.log(JSON.stringify(validArtists));

  try {
    const accessToken = await getNewAccessToken();

    console.log(accessToken)

    // Construct the recommendations API request URL
    const recommendationsEndpoint =
      "https://api.spotify.com/v1/recommendations";
    const queryParams = new URLSearchParams({
      seed_artists: seedArtists,
      seed_tracks: seedTracks,
      seed_genres: seedGenres,
      limit: "10", // You can adjust the number of recommendations returned
    });

    const url = `${recommendationsEndpoint}?${queryParams.toString()}`;

    // Call the Spotify Recommendations API
    const recommendationsResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!recommendationsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch recommendations from Spotify API." },
        { status: recommendationsResponse.status }
      );
    }

    const recommendationsData = await recommendationsResponse.json();

    const playlistCreation = await fetch(
      `https://api.spotify.com/v1/users/31w2rrji6cok6swmlym3oddoxp2e/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "djdrilly#",
          public: true,
        }),
      }
    );

    const playlistId = await playlistCreation.json()

    const trackAddition = await fetch(
      `https://api.spotify.com/v1/playlists/${
        playlistId.id
      }/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: recommendationsData.tracks.map((track: any) => track.uri),
        }),
      }
    );

    console.log(recommendationsData);

    // Return the recommendations data
    return NextResponse.json({ recommendations: recommendationsData });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Spotify API." },
      { status: 500 }
    );
  }
};
