import React, { useState } from "react";

const DropdownInput = (props) => {

  const SelectionBox = () => {
    return (
      <div className="border border-white rounded-xl p-3 text-white mt-5 w-full">
        {props.currentRequest.requestType === "genre" &&
          props.searchData.map((genre, index) => (
            <div className="text-start">
              <button
                className="p-2"
                onClick={() => props.addRequest("genres", genre)}
              >
                {props.formatString(genre)}
              </button>
              {index !== props.searchData.length - 1 && (
                <div className="border-t border-gray-700"></div>
              )}
            </div>
          ))}
        {props.currentRequest.requestType === "track" &&
          Object.values(props.searchData)[0].items.map((item, index) => (
            <div>
              <button
                className="flex p-2"
                onClick={() => props.addRequest("tracks", item)}
              >
                <img
                  className="w-12 h-12 mr-4 rounded-xl"
                  src={item?.album?.images[0]?.url}
                />
                <div className="flex flex-col">
                  <p className="text-start text-lg">{item.name}</p>
                  <p className="text-start text-gray-400">
                    {item.artists[0]?.name}
                  </p>
                </div>
              </button>
              {index !==
                Object.values(props.searchData)[0].items.length - 1 && (
                <div className="border-t border-gray-700"></div>
              )}
            </div>
          ))}
        {props.currentRequest.requestType === "artist" &&
          Object.values(props.searchData)[0].items.map((item, index) => (
            <div>
              <button
                className="flex p-2 items-center"
                onClick={() => props.addRequest("artists", item)}
              >
                <img
                  className="w-12 h-12 mr-4 rounded-xl"
                  src={item?.images[0]?.url}
                />
                {item.name}
              </button>
              {index !==
                Object.values(props.searchData)[0].items.length - 1 && (
                <div className="border-t border-gray-700"></div>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-1/2">
      <div className="flex">
        <select
          className="rounded-l-xl text-green-300 bg-neutral-600 px-3 w-22"
          value={props.currentRequest.requestType}
          onChange={props.handleCurrentRequestType}
        >
          <option value="track">Track</option>
          <option value="artist">Artist</option>
          <option value="genre">Genre</option>
        </select>
        <input
          type="text"
          className="rounded-r-xl py-5 bg-neutral-800 border-2 border-neutral-600 text-white"
          value={props.currentRequest.request}
          onChange={props.handleCurrentRequest}
        />
      </div>
      {props.searchData && <SelectionBox />}
    </div>
  );
};

export default DropdownInput;
