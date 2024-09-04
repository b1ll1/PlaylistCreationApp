import { NextRequest, NextResponse } from "next/server";
import { findArtistId, findTrackId } from "@/lib/spotify";

// Define the API route
export const POST = async (req: NextRequest) => {
  const { conversation } = await req.json();

  // Validate the conversation data
  if (!Array.isArray(conversation) || conversation.length === 0) {
    return NextResponse.json(
      { error: "Invalid or empty conversation data" },
      { status: 400 }
    );
  }

  // Ensure the prompt is the last entry in the conversation
  const prompt = conversation[conversation.length - 1]?.content || "";

  // Make sure to replace 'OPENAI_API_KEY' with your environment variable
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured." },
      { status: 500 }
    );
  }

  try {
    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or another model of your choice
        messages: [
          {
            role: "system",
            content:
              'You are an assistant that helps create music playlists. Extract and return the following information in JSON format: artists, songs, genres (these must be selected from the following: "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music"), and duration of the playlist (this should always be stated in minutes (always return just the number in the response), the default will be 60). Additionally, suggest a next prompt for the user to provide more details or modify the playlist, include this in the JSON object with the key "prompt". Ensure the response is a JSON object. The user can only select a maximum of 5 songs, artists and genres so if they go over this limit, take the first 5 and prompt them to reconfirm if you must leave one off the list. Do not ever add songs or artists to the list unless they are specifically requested by the user.',
          },
          ...conversation,
          { role: "user", content: prompt },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

//     const responseData = JSON.parse(data.choices[0]?.message?.content || "{}");

//     // Validate and get IDs for artists and tracks
//     const artistIdPromises = (responseData.artists || []).map(
//       async (artist: string) => ({
//         artist,
//         id: await findArtistId(artist),
//       })
//     );
//     const trackIdPromises = (responseData.tracks || []).map(
//       async (track: string) => ({
//         track,
//         id: await findTrackId(track),
//       })
//     );

//     const artistResults = await Promise.all(artistIdPromises);
//     const trackResults = await Promise.all(trackIdPromises);

//     const validArtists = artistResults.filter((result) => result.id !== null);
//     const validTracks = trackResults.filter((result) => result.id !== null);

//     // Prepare the results
//     return NextResponse.json({response: JSON.stringify({

//       artists: validArtists.map((result) => ({
//         name: result.artist,
//         id: result.id,
//       })),
//       tracks: validTracks.map((result) => ({
//         name: result.track,
//         id: result.id,
//       })),
//       genres: responseData.genres,
//       duration: responseData.duration || 60,
//       prompt:
//       responseData.prompt ||
//       "Please provide more details or modify the playlist.",
//       // invalidArtists: artistResults
//       // .filter((result) => result.id === null)
//       // .map((result) => result.artist),
//       // invalidTracks: trackResults
//       // .filter((result) => result.id === null)
//       // .map((result) => result.track),
//     })
//     });
//   } catch (error) {
//     console.error("Error calling OpenAI API:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch from OpenAI API." },
//       { status: 500 }
//     );
//   }
// };

// Return the response data from OpenAI
return NextResponse.json({ response: data.choices[0]?.message?.content || 'No response' });
} catch (error) {
  console.error('Error calling OpenAI API:', error);
  return NextResponse.json({ error: 'Failed to fetch from OpenAI API.' }, { status: 500 });
}
};