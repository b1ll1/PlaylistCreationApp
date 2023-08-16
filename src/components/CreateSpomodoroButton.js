import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function CreateSpomodoroButton(props) {
  const [showButton, setShowButton] = useState(false);
  const [animate, setAnimate] = useState(0);

  useEffect(() => {
    if (props.requests.tracks.length > 0 || props.requests.artists.length > 0 || props.requests.genres.length > 0) {
      setShowButton(true);
      setAnimate(0);
    } else {
      setShowButton(false);
      setAnimate(200);
    }
  }, [props.requests]);

  return (
    <div>
      {showButton && (
        <motion.button
          className="bg-green-600 rounded-xl px-5 py-10 m-20"
          initial={{ y: 200 }}
          animate={{ y: animate }}
          onClick={props.handleCreate}
        >
          Create Spomodoro Playlist
        </motion.button>
      )}
    </div>
  );
}

export default CreateSpomodoroButton;
