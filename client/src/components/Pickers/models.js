/*

*/
import React from "react";

export default function ModelSelector({
  models,
  model,
  setLoRa,
  setModel,
  forceUpdate,
}) {
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Model</p>
        <span className="tooltiptext">
          Use SDXL for high quality images. SD1.5 supports text2video!
        </span>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {models.map((item, idx) =>
          model.pipeline == item.pipeline ? (
            <div
              key={item.name + "-model-" + idx}
              className={
                model.model == item.model
                  ? "style-button border"
                  : "style-button"
              }
              style={
                item.model == "runwayml/stable-diffusion-v1-5" &&
                item.pipeline == "image-to-video"
                  ? {
                      backgroundColor: "grey",
                      cursor: "inherit",
                      flex: 1,
                      height: "40px",
                      alignContent: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 0,
                    }
                  : {
                      cursor: "pointer",
                      flex: 1,
                      padding: 0,
                      alignContent: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "40px",
                    }
              }
              onClick={() => {
                if (
                  item.model == "runwayml/stable-diffusion-v1-5" &&
                  item.pipeline == "image-to-video"
                ) {
                  return;
                }
                model.enableLCM = false;
                model.enableTurbo = false;
                model.enableLightning = false;
                model.enableAnimateLCM = false;
                model.enableAnimateDiff = false;
                model.enableAnimateDiffLightning = false;
                model.model = item.model;
                model.baseModel = "";
                setLoRa("");
                setModel(model);
                setLoRa("");
                // Because the ref doesn't actually change, force rerender
                forceUpdate();
              }}
            >
              {item.name}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
