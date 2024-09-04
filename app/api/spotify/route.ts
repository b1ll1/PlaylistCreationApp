import { NextRequest, NextResponse } from "next/server";
import {
  findArtistId,
  findTrackId,
  getNewAccessToken,
  fetchRecommendations,
  createPlaylist,
  addTracksToPlaylist,
} from "../../../lib/spotify";
import {
  PlaylistData,
  Artist,
  Track,
  RecommendationsResponse,
} from "../../../types/spotify";

export const POST = async (req: NextRequest) => {
  const { playlistData }: { playlistData: PlaylistData } = await req.json();

  try {
    // Validate and get IDs for artists and tracks
    const artistIdPromises = (playlistData.artists || []).map(
      async (artist): Promise<Artist> => ({
        artist,
        id: await findArtistId(artist),
      })
    );
    const trackIdPromises = (playlistData.tracks || []).map(
      async (track): Promise<Track> => ({
        track,
        id: await findTrackId(track),
      })
    );

    const artistResults: Artist[] = await Promise.all(artistIdPromises);
    const trackResults: Track[] = await Promise.all(trackIdPromises);

    const validArtists = artistResults.filter((result) => result.id !== null);
    const validTracks = trackResults.filter((result) => result.id !== null);

    // Extract valid IDs and genres
    const artistIds: string[] = validArtists.map((artist) => artist.id!);
    const trackIds: string[] = validTracks.map((track) => track.id!);
    const genres: string[] = playlistData.genres || [];

    // Limit the number of seeds to the maximum allowed by Spotify API (5 per type)
    const seedArtists: string = artistIds.slice(0, 5).join(",");
    const seedTracks: string = trackIds.slice(0, 5).join(",");
    const seedGenres: string = genres.slice(0, 5).join(",");

    const accessToken = await getNewAccessToken();

    const recommendationsData: RecommendationsResponse =
      await fetchRecommendations(
        accessToken,
        seedArtists,
        seedTracks,
        seedGenres
      );

    // Calculate total duration to limit playlist length
    const userDuration: number = playlistData.duration * 60 * 1000; // Convert minutes to milliseconds
    let cumulativeDuration = 0;
    const limitedTracks = recommendationsData.tracks.filter((track) => {
      if (cumulativeDuration + track.duration_ms <= userDuration) {
        cumulativeDuration += track.duration_ms;
        return true;
      }
      return false;
    });

    const trackUris: string[] = limitedTracks.map((track) => track.uri);

    // Create a new playlist
    const userId: string = "31w2rrji6cok6swmlym3oddoxp2e"; // Replace with dynamic userId if necessary
    const playlist = await createPlaylist(accessToken, userId, "djdrilly");

    // Add recommended tracks to the playlist
    await addTracksToPlaylist(accessToken, playlist.id, trackUris);

    const playlistLink = `https://open.spotify.com/playlist/${playlist.id}`;

    // Return the recommendations data
    return NextResponse.json({ playlistLink });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
};
