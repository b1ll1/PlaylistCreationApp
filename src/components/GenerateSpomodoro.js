import React, { useEffect, useState } from "react";
import DropdownInput from "./DropdownInput";
import CreateSpomodoroButton from "./CreateSpomodoroButton";

function GenerateSpomodoro() {
  const [requests, setRequests] = useState({
    tracks: [],
    artists: [],
    genres: [],
  });

  const [searchResult, setSearchResult] = useState(null);

  const [currentRequest, setCurrentRequest] = useState({
    requestType: "track",
    request: "",
  });

  const [duration, setDuration] = useState(25);
  let accessToken = localStorage.getItem("access-token");

  useEffect(() => {
    const searchSpotify = async () => {
      if (currentRequest["request"].length > 0) {
        if (currentRequest["requestType"] === "genre") {
          const response = await fetch(
            `https://api.spotify.com/v1/recommendations/available-genre-seeds            `,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          );
          const data = await response.json();
          const filteredArray = data["genres"].filter((item) =>
            item.includes(currentRequest["request"])
          );
          const limitedSubset = filteredArray.slice(0, 5);
          if (limitedSubset.length > 0) {
            setSearchResult(limitedSubset);
          } else {
            setSearchResult(null);
          }
        } else {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${currentRequest["request"]}&type=${currentRequest["requestType"]}&limit=5`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          );
          const data = await response.json();
          setSearchResult(data);
        }
      } else {
        setSearchResult(null);
      }
    };
    searchSpotify();
  }, [currentRequest]);

  const handleCurrentRequest = async (e) => {
    setCurrentRequest((prevCurrentRequest) => ({
      ...prevCurrentRequest,
      request: e.target.value,
    }));
  };

  const handleCurrentRequestType = (e) => {
    setCurrentRequest({
      requestType: e.target.value,
      request: "",
    });
    setSearchResult(null);
  };

  const formatString = (inputString) => {
    return inputString
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const addRequest = (type, item) => {
    if (requests[type].includes(item)) {
      alert("Item already added to requests...");
    } else {
      setRequests((prevRequests) => ({
        ...prevRequests,
        [type]: [...prevRequests[type], item],
      }));
    }
  };

  const removeRequest = (type, item) => {
    const updatedRequests = requests[type].slice();
    const index = updatedRequests.indexOf(item);
    if (index !== -1) {
      updatedRequests.splice(index, 1);
      setRequests((prevRequests) => ({
        ...prevRequests,
        [type]: updatedRequests,
      }));
    }
  };

  const PlaylistLength = () => {
    const handleChange = (e) => {
      if (e.target.value >= 0) {
        setDuration(parseInt(e.target.value));
      } else {
        alert("Duration of playlist is too short for Spomodoro");
      }
    };
    return (
      <div>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="bg-neutral-800 border-2 border-neutral-600 rounded-xl p-5 text-center text-white"
        />
      </div>
    );
  };

  const urlParam = (type) => {
    if (type === "genres") {
      return requests[type].join(",");
    } else {
      const keysArray = Object.keys(requests[type]).map(
        (entry) => requests[type][entry]["id"]
      );

      return keysArray.join(",");
    }
  };

  const handleCreate = async () => {
    let accessToken = localStorage.getItem("access-token");

    let args = new URLSearchParams({
      seed_genres: urlParam("genres"),
      seed_artists: urlParam("artists"),
      seed_tracks: urlParam("tracks"),
    });

    console.log("https://api.spotify.com/v1/recommendations?" + args);

    const response = await fetch(
      "https://api.spotify.com/v1/recommendations?" + args,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    const data = await response.json();

    const songNumber = calculateSpom(data.tracks);
    createPlaylist(songNumber, data.tracks);
  };

  const calculateSpom = (tracks) => {
    console.log(tracks);
    let total_time = 0;
    let diff = duration*60*1e3;
    let closestIndex = 0;
    for (var i = 0; i < tracks.length; i++) {
      total_time += tracks[i].duration_ms;
      let durationDiff = Math.abs(total_time - duration*60*1e3);
      if (durationDiff < diff) {
        diff = durationDiff;
        closestIndex = i;
      }

      if (total_time >= duration*60*1e3 + 15*60*1e3) {
        break;
      }
    }

    return closestIndex;
  };

  const createPlaylist = async (songNumber, tracks) => {
    const fetchUsername = async () => {
      let accessToken = localStorage.getItem("access-token");

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      const data = await response.json();
      return data.id;
    };

    let accessToken = localStorage.getItem("access-token");

    const username = await fetchUsername();
    let body = new URLSearchParams();

    const response = await fetch(
      `https://api.spotify.com/v1/users/${username}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Spomodoro",
          description:
            "This playlist was generated by using the Spomodoro App.",
          public: false,
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    const song_uris = [];
    for (var i = 0; i < songNumber + 1; i++) {
      song_uris[i] = tracks[i].uri;
    }

    const response1 = await fetch(
      `https://api.spotify.com/v1/playlists/${data.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: song_uris,
        }),
      }
    );

    const data1 = await response1.json();
    console.log(data1);
    setRequests({
      tracks: [],
      artists: [],
      genres: [],
    })
    setCurrentRequest((prevCurrentRequest) => ({
      ...prevCurrentRequest,
      request: "",
    }));
    setSearchResult(null);
    alert('Playlist has been created :) check your Spotify! ')
  };

  return (
    <div className="p-5 items-center">
      <h1 className="text-white p-20">
        Create me a {duration} minute{" "}
        {requests.genres.map((genre, index) => (
          <text>
            <button
              className="text-green-600 hover:text-red-600"
              onClick={() => removeRequest("genres", genre)}
            >
              {formatString(genre)}
            </button>
            {index !== requests.genres.length - 1 && "/"}
          </text>
        ))}{" "}
        Spomodoro playlist
        {(requests.artists.length > 0 || requests.tracks.length > 0) &&
          " from "}
        {requests.artists.length > 0 && "artists like "}
        {requests.artists.map((artist, index) => (
          <text>
            <button
              className="text-green-600 hover:text-red-600"
              onClick={() => removeRequest("artists", artist)}
            >
              {artist.name}
            </button>
            {index !== requests.artists.length - 1 && "/"}
          </text>
        ))}
        {requests.artists.length > 0 && requests.tracks.length > 0 && " and "}
        {requests.tracks.length > 0 && "tracks like "}
        {requests.tracks.map((song, index) => (
          <text>
            <button
              className="text-green-600 hover:text-red-600"
              onClick={() => removeRequest("tracks", song)}
            >
              {song.name}
            </button>
            {index !== requests.tracks.length - 1 && "/"}
          </text>
        ))}
        {"."}
      </h1>
      <div className="flex">
        <DropdownInput
          currentRequest={currentRequest}
          handleCurrentRequest={handleCurrentRequest}
          handleCurrentRequestType={handleCurrentRequestType}
          searchData={searchResult}
          addRequest={addRequest}
          formatString={formatString}
        />
        <div className="flex flex-col w-10/12 items-center">
          <PlaylistLength />
          <CreateSpomodoroButton requests={requests} handleCreate={handleCreate} />
        </div>
      </div>
    </div>
  );
}

export default GenerateSpomodoro;
