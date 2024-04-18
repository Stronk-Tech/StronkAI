/*

*/
import React from "react";

export default function Prompt({
  model,
  setPrompt,
  prompt,
  handleKeyDown
}) {
  if (model.model == "stabilityai/stable-video-diffusion-img2vid-xt-1-1") {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Prompt</p>
        <span className="tooltiptext">
          Be descriptive! Try to describe the scene, weather, lighting, colours,
          etc.
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flex: 1,
          justifyContent: "stretch",
          alignItems: "stretch",
          maxHeight: "400px",
        }}
      >
        <textarea
          value={prompt}
          placeholder={"Prompt"}
          style={{
            width: "100%",
            height: "100%",
            marginLeft: "0.2em",
            marginRight: "0.2em",
            minHeight: "200px",
          }}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
