import Image from "next/image";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <div className="bg-black text-white p-5 flex flex-row">
      <Link href="/" className="font-semibold flex flex-row text-blue-500">
        <Image
          src="/icon.png"
          width={20}
          height={20}
          alt="dj drilly icon "
          className="object-contain mx-2"
        />
      aidj
      </Link>
      <Link href="/about" className="px-5">
        about
      </Link>
    </div>
  );
}

export default Navbar;
