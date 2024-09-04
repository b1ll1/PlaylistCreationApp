"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./_components/Navbar";
import { motion } from "framer-motion";
import Modal from "./_components/Modal";

// Define the type for a conversation entry
type ConversationEntry = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [rows, setRows] = useState(1);
  const [response, setResponse] = useState({
    artists: [],
    songs: [],
    genres: [],
    duration: 60,
    prompt: "",
  });
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlistLink, setPlaylistLink] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [showBox, setShowBox] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    // Calculate number of rows needed
    if (textareaRef.current) {
      textareaRef.current.rows = 1; // Reset to 1 row to recalculate
      const currentRows = Math.floor(textareaRef.current.scrollHeight / 24); // Assuming 24px line height
      setRows(currentRows < 5 ? currentRows : 5); // Maximum 5 rows
      console.log(rows);
    }
  };

  // useEffect to check response changes and determine box visibility
  useEffect(() => {
    if (
      response.artists?.length ||
      response.songs?.length ||
      response.genres?.length
    ) {
      setShowBox(true);
    } else {
      setShowBox(false);
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingChat(true);
    setResponse({
      artists: [],
      songs: [],
      genres: [],
      duration: 60,
      prompt: "",
    });

    // Update conversation state with the new user prompt
    const updatedConversation: ConversationEntry[] = [
      ...conversation,
      { role: "user", content: prompt },
    ];
    setConversation(updatedConversation);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversation: updatedConversation }),
      });

      const data = await res.json();
      const aiResponse = data.response || "No response";

      // Update conversation state with the AI response
      setConversation([
        ...updatedConversation,
        { role: "assistant", content: aiResponse },
      ]);
      setResponse(JSON.parse(aiResponse));
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  const createPlaylist = async () => {
    setLoadingPlaylist(true);
    try {
      const res = await fetch("/api/spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistData: response }),
      });
      if(res.ok) {
        const data = await res.json();
        console.log(data.playlistLink)
        setPlaylistLink(data.playlistLink)
        setShowModal(true)
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoadingPlaylist(false);
    }
  };

  return (
    <div className="bg-neutral-700 h-screen flex flex-col">
      <Navbar />
      {showBox && (
        <motion.div
          className="transition-box bg-neutral-800 text-white rounded-b-lg p-5 shadow-lg mx-10 xl:mx-80 lg:mx-20"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="flex flex-row">
            <div>
              <h2 className="text-xl py-2">Detected Playlist Information</h2>
              {response?.prompt && (
                <>
                  {response.artists?.length > 0 && (
                    <p>
                      <strong>Artists:</strong> {response.artists?.join(", ")}
                    </p>
                  )}
                  {response.songs?.length > 0 && (
                    <p>
                      <strong>Songs:</strong> {response.songs?.join(", ")}
                    </p>
                  )}
                  {response.genres?.length > 0 && (
                    <p>
                      <strong>Genres:</strong> {response.genres?.join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>Duration:</strong> {response.duration} minutes
                  </p>
                </>
              )}
            </div>

            <button
              className="bg-blue-500 text-white w-36 py-2 rounded-lg hover:bg-blue-600 ml-auto items-center justify-center flex"
              disabled={loadingPlaylist}
              onClick={createPlaylist}
            >
              {loadingPlaylist ? (
                <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Playlist"
              )}
            </button>
          </div>
        </motion.div>
      )}
      <div className="px-10 pt-10 overflow-y-auto mx-10 xl:mx-80 lg:mx-20">
        <div className="max-w-md text-slate-50 px-10">
          <p className="p-3">
            Start chatting about your favourite artists, tracks and genres...
          </p>
        </div>
        {conversation.map((entry, index) => (
          <div
            key={index}
            className={`flex ${
              entry.role === "user" ? "justify-end" : "justify-start"
            } px-10`}
          >
            <div
              className={`max-w-md p-3 rounded-lg ${
                entry.role === "user"
                  ? "bg-neutral-500 text-white rounded-xl"
                  : "text-slate-50"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {entry.role === "user"
                  ? entry.content
                  : JSON.parse(entry.content).prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto mb-4 mx-10 xl:mx-80 lg:mx-20">
        <form onSubmit={handleSubmit} className="flex flex-row justify-center">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleInputChange}
            rows={1}
            className="w-full p-3 rounded-lg mx-2 bg-neutral-400"
          />
          <button
            type="submit"
            disabled={loadingChat}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loadingChat ? "Loading..." : "Send"}
          </button>
        </form>
      </div>
       <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        playlistLink={playlistLink}
      />
    </div>
  );
}
