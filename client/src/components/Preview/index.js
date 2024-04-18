import React from "react";

export default function Preview({ isVideo, file, path }) {
  if (!file || !path) {
    return <div style={{ display: "flex" }} />;
  }
  return isVideo ? (
    <video
      src={path + file}
      style={{
        objectFit: "cover",
        width: "100%",
        maxHeight: "calc(100vh - 200px)",
        aspectRatio: "initial",
        maxWidth: "calc(100vw-300px)",
      }}
      controls
      autoPlay
      loop
    ></video>
  ) : (
    <img
      src={path + file}
      style={{
        objectFit: "cover",
        width: "100%",
        maxHeight: "calc(100vh - 200px)",
        aspectRatio: "initial",
        maxWidth: "calc(100vw-300px)",
      }}
    ></img>
  );
}
