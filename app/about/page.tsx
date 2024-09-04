import React from "react";
import Navbar from "../_components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

function page() {
  return (
    <div className="bg-neutral-700 h-screen flex flex-col">
      <Navbar />
      <footer className="mt-auto mb-4 text-neutral-500 text-center">
        Made by <Link className="hover:text-neutral-400" href="https://x.com/__b1ll__">@__B1ll__</Link>
      </footer>
    </div>
  );
}

export default page;
