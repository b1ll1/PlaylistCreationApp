import React from 'react'
import { SocialIcon } from 'react-social-icons';
import { GiTomato } from "@react-icons/all-files/gi/GiTomato";

function Header() {
  return (
    <div>
        <h1 className='text-white text-xl'>Sp<SocialIcon url="https://open.spotify.com/" bgColor="white" style={{height:20, width:20}}/>m<GiTomato style={{verticalAlign: 'middle'}}/>doro</h1>
        <div className="flex flex-col w-64 h-screen bg-gray-800">
      <div className="flex items-center justify-center h-16 text-white text-xl font-semibold">
        Sidebar
      </div>
      <div className="flex flex-col flex-1 p-4 overflow-y-auto">
        <a href="#" className="py-2 hover:text-gray-400">
          Link 1
        </a>
        <a href="#" className="py-2 hover:text-gray-400">
          Link 2
        </a>
        <a href="#" className="py-2 hover:text-gray-400">
          Link 3
        </a>
        <a href="#" className="py-2 hover:text-gray-400">
          Link 4
        </a>
      </div>
    </div>
    </div>
  )
}

export default Header
