import { NextRequest, NextResponse } from 'next/server';
import { findArtistId, findTrackId } from '../../../lib/spotify';

export const POST = async (req: NextRequest) => {
  const { conversation } = await req.json();

  if (!Array.isArray(conversation) || conversation.length === 0) {
    return NextResponse.json({ error: 'Invalid or empty conversation data' }, { status: 400 });
  }

  // Extract the JSON object from the last entry in the conversation
  const jsonResponse = JSON.parse(conversation[conversation.length - 1]?.content || '{}');

  const artists = jsonResponse.artists || [];
  const tracks = jsonResponse.tracks || [];

  // Validate and get IDs for artists
  const artistIdPromises = artists.map(async (artist: string) => ({
    artist,
    id: await findArtistId(artist),
  }));
  const artistResults = await Promise.all(artistIdPromises);

  // Validate and get IDs for tracks
  const trackIdPromises = tracks.map(async (track: string) => ({
    track,
    id: await findTrackId(track),
  }));
  const trackResults = await Promise.all(trackIdPromises);

  // Prepare the results
  const validArtists = artistResults.filter(result => result.id !== null);
  const validTracks = trackResults.filter(result => result.id !== null);

  return NextResponse.json({
    validArtists: validArtists.map(result => ({ name: result.artist, id: result.id })),
    validTracks: validTracks.map(result => ({ name: result.track, id: result.id })),
    invalidArtists: artistResults.filter(result => result.id === null).map(result => result.artist),
    invalidTracks: trackResults.filter(result => result.id === null).map(result => result.track),
  });
};
