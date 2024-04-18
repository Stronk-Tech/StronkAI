/*

*/
import React from "react";

export default function LoraSelector({ thisModelInfo, model, loRa, setLoRa }) {
  if (
    !thisModelInfo.loRas.length ||
    model.baseModel != "" ||
    model.enableLCM ||
    model.enableTurbo ||
    model.enableLightning ||
    model.enableAnimateLCM ||
    model.enableAnimateDiff ||
    model.enableAnimateDiffLightning
  ) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>LoRas</p>
        <span className="tooltiptext">
          Enhance or restyle the output completely.
        </span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          {thisModelInfo.loRas.map((item, idx) => (
            <div
              key={item.name + "-lora-" + idx}
              className={
                loRa == item.model ? "style-button border" : "style-button"
              }
              style={{
                padding: 0,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                setLoRa(item.model);
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
