"use client";

import { useEffect, useState } from "react";

// Define the type for a conversation entry
type ConversationEntry = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState({
    artists: [],
    songs: [],
    genres: [],
    duration: 60,
    prompt: "",
  });
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [showBox, setShowBox] = useState(false);

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginTop: "20px" }}>
        <h3>Conversation:</h3>
        {conversation.map((entry, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{entry.role === "user" ? "You" : "Assistant"}:</strong>
            <p>
              {entry.role === "user"
                ? entry.content
                : JSON.parse(entry.content).prompt}
            </p>
          </div>
        ))}
      </div>
      <h1>ChatGPT Interface</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
      {showBox && (
        <div className="transition-box">
          <h2>Detected Playlist Information</h2>
          {response.prompt && (
            <>
              <p><strong>Artists:</strong> {response.artists?.join(", ")}</p>
              <p><strong>Songs:</strong> {response.songs?.join(", ")}</p>
              <p><strong>Genres:</strong> {response.genres?.join(", ")}</p>
            </>
          )}
          <button className="create-playlist-button">Create Playlist</button>
        </div>
      )}
    </div>
  );
}
