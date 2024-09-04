// components/Modal.tsx
import Link from "next/link";
import React from "react";

type ModalProps = {
  show: boolean;
  onClose: () => void;
  playlistLink: string;
};

const Modal: React.FC<ModalProps> = ({ show, onClose, playlistLink }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-neutral-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-neutral-500 p-6 rounded-lg shadow-lg text-center text-neutral-50">
        <h2 className="text-xl font-semibold mb-4">Your Playlist is Ready!</h2>
        <p className="mb-4">Click the link below to open your playlist:</p>
        <Link
          href={playlistLink} passHref
          className="bg-blue-500 mb-4 py-3 px-4 rounded-lg mt-4 mx-2"
        >
          {" "}
          <a target="_blank" rel="noopener noreferrer">
            Open Playlist
          </a>
        </Link>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 border-2 border-neutral-50 text-neutral-50 rounded-lg mx-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
