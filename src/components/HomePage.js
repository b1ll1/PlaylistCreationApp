import React from "react";
import SpotifyLogin from "./SpotifyLogin";

function HomePage() {
  return (
    <div className="text-white font-sans my-auto w-2/3 mx-auto text-xl">
      
      <img class="w-20 mx-auto m-5" src="https://www.freepnglogos.com/uploads/spotify-logo-png/file-spotify-logo-png-4.png"/>
      
      <p className="p-5">Welcome to Spomodoro!</p>

      <p  className="p-5">
        Using the Spotify API, we create custom playlists based on your song,
        artist and genre recommendations.
      </p>

      <p  className="p-5 pb-10">
        Make mixes of custom duration, perfect for parties, late night chills or
        deep focus sessions.
      </p>

      <SpotifyLogin buttonText="Login via Spotify to Get Started"/>
    </div>
  );
}

export default HomePage;
