/*

*/
import React from "react";

export default function CheckpointSelector({
  thisModelInfo,
  model,
  setLoRa,
  setModel,
  forceUpdate,
}) {
  if (!thisModelInfo?.baseModels?.length) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Checkpoint</p>
        <span className="tooltiptext">
          Checkpoints make it easier to generate high quality images from a
          simple prompt!
        </span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          {thisModelInfo.baseModels.map((item, idx) => (
            <div
              key={item.name + "-model-" + idx}
              className={
                model.baseModel == item.model
                  ? "style-button border"
                  : "style-button"
              }
              style={{
                padding: 0,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                model.baseModel = item.model;
                setLoRa("");
                setModel(model);
                // Because the ref doesn't actually change, force rerender
                forceUpdate();
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
