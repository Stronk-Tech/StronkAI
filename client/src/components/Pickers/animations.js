/*

*/
import React from "react";

export default function AnimationSelector({
  thisModelInfo,
  model,
  setLoRa,
  setModel,
  forceUpdate,
}) {
  if (
    !thisModelInfo?.supportsAnimateLCM &&
    !thisModelInfo?.supportsAnimateDiff &&
    !thisModelInfo?.supportsAnimateDiffLightning
  ) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Animation Module</p>
        <span className="tooltiptext">Immediately go from text to video!</span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          <div
            className={
              !model.enableAnimateLCM &&
              !model.enableAnimateDiff &&
              !model.enableAnimateDiffLightning
                ? "style-button border"
                : "style-button"
            }
            onClick={() => {
              model.enableAnimateLCM = false;
              model.enableAnimateDiff = false;
              model.enableAnimateDiffLightning = false;
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            None
          </div>
          <div
            className={
              model.enableAnimateDiff ? "style-button border" : "style-button"
            }
            style={
              !thisModelInfo.supportsAnimateDiff
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (!thisModelInfo.supportsAnimateDiff) {
                return;
              }
              model.enableLCM = false;
              model.enableTurbo = false;
              model.enableLightning = false;
              model.enableAnimateLCM = false;
              model.enableAnimateDiff = true;
              model.enableAnimateDiffLightning = false;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            AnimateDiff
          </div>
          <div
            className={
              model.enableAnimateDiffLightning
                ? "style-button border"
                : "style-button"
            }
            style={
              !thisModelInfo.supportsAnimateDiffLightning
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (!thisModelInfo.supportsAnimateDiffLightning) {
                return;
              }
              model.enableLCM = false;
              model.enableTurbo = false;
              model.enableLightning = false;
              model.enableAnimateLCM = false;
              model.enableAnimateDiff = false;
              model.enableAnimateDiffLightning = true;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            Lightning
          </div>
          <div
            className={
              model.enableAnimateLCM ? "style-button border" : "style-button"
            }
            style={
              !thisModelInfo.supportsAnimateLCM
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (!thisModelInfo.supportsAnimateLCM) {
                return;
              }
              model.enableLCM = false;
              model.enableTurbo = false;
              model.enableLightning = false;
              model.enableAnimateLCM = true;
              model.enableAnimateDiff = false;
              model.enableAnimateDiffLightning = false;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            AnimateLCM
          </div>
        </div>
      </div>
    </div>
  );
}
