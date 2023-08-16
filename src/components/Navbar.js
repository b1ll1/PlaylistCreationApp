import SpotifyLogin from "./SpotifyLogin";
import UserProfile from "./UserProfile";
import { SocialIcon } from 'react-social-icons';
import { GiTomato } from "@react-icons/all-files/gi/GiTomato";

function Navbar(props) {

  return (
    <div className="bg-black text-white flex justify-between px-10 py-5 align-middle items-center">
      <div className="text-2xl font-bold">Sp<SocialIcon url="https://open.spotify.com/" bgColor="white" style={{height:15, width:15}}/>modor{<GiTomato className="inline-block" style={{height:15, width:15}}/>}</div>
        {props.loggedIn ? (
          <UserProfile username={props.userData.display_name} />
        ) : (
          <SpotifyLogin buttonText="Login via Spotify"/>
        )}
    </div>
  );
}

export default Navbar;
