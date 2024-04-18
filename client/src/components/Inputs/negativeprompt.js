/*

*/
import React from "react";

export default function NegativePrompt({
  model,
  setNegativePrompt,
  negative_prompt,
  handleKeyDown,
}) {
  if (model.model == "stabilityai/stable-video-diffusion-img2vid-xt-1-1") {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Negative prompt</p>
        <span className="tooltiptext">
          Don't over-do it! Especially when using a checkpoint or LoRa.
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
          value={negative_prompt}
          placeholder={"Negative Prompt"}
          style={{
            width: "100%",
            height: "100%",
            marginLeft: "0.2em",
            marginRight: "0.2em",
            minHeight: "100px",
          }}
          onChange={(e) => setNegativePrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
