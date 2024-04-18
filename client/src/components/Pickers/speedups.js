/*

*/
import React from "react";

export default function SpeedupSelector({
  thisModelInfo,
  model,
  setLoRa,
  setModel,
  forceUpdate,
}) {
  if (
    model.baseModel == "chillpixel/starlight-animated-sdxl" ||
    model.model == "prompthero/openjourney-v4"
  ) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Speedup Module</p>
        <span className="tooltiptext">Generate images at a lightning quick pace.</span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          <div
            className={
              !model.enableLCM && !model.enableTurbo && !model.enableLightning
                ? "style-button border"
                : "style-button"
            }
            onClick={() => {
              model.enableLCM = false;
              model.enableTurbo = false;
              model.enableLightning = false;
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            None
          </div>
          <div
            className={
              model.enableTurbo ? "style-button border" : "style-button"
            }
            style={
              !thisModelInfo.supportsTurbo ||
              model.baseModel == "SG161222/RealVisXL_V4.0" ||
              model.enableAnimateLCM ||
              model.enableAnimateDiff ||
              model.enableAnimateDiffLightning
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (
                !thisModelInfo.supportsTurbo ||
                model.baseModel == "SG161222/RealVisXL_V4.0" ||
                model.enableAnimateLCM ||
                model.enableAnimateDiff ||
                model.enableAnimateDiffLightning
              ) {
                return;
              }
              model.enableLCM = false;
              model.enableTurbo = true;
              model.enableLightning = false;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            Turbo
          </div>
          <div
            className={
              model.enableLightning ? "style-button border" : "style-button"
            }
            style={
              !thisModelInfo.supportsLightning ||
              model.enableAnimateLCM ||
              model.enableAnimateDiff ||
              model.enableAnimateDiffLightning
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (
                !thisModelInfo.supportsLightning ||
                model.enableAnimateLCM ||
                model.enableAnimateDiff ||
                model.enableAnimateDiffLightning
              ) {
                return;
              }
              model.enableLCM = false;
              model.enableTurbo = false;
              model.enableLightning = true;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            Lightning
          </div>
          <div
            className={model.enableLCM ? "style-button border" : "style-button"}
            style={
              !thisModelInfo.supportsLCM ||
              model.baseModel == "SG161222/RealVisXL_V4.0" ||
              model.baseModel == "Lykon/dreamshaper-xl-1-0" ||
              model.enableAnimateLCM ||
              model.enableAnimateDiff ||
              model.enableAnimateDiffLightning
                ? {
                    backgroundColor: "grey",
                    cursor: "inherit",
                  }
                : null
            }
            onClick={() => {
              if (
                !thisModelInfo.supportsLCM ||
                model.enableAnimateLCM ||
                model.enableAnimateDiff ||
                model.enableAnimateDiffLightning ||
                model.baseModel == "SG161222/RealVisXL_V4.0" ||
                model.baseModel == "Lykon/dreamshaper-xl-1-0"
              ) {
                return;
              }
              model.enableLCM = true;
              model.enableTurbo = false;
              model.enableLightning = false;
              setLoRa("");
              setModel(model);
              // Because the ref doesn't actually change, force rerender
              forceUpdate();
            }}
          >
            LCM
          </div>
        </div>
      </div>
    </div>
  );
}
