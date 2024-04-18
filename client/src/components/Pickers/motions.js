/*

*/
import React from "react";

export default function MotionSelector({
  motions,
  motion,
  model,
  setMotion,
}) {
  if (!model.enableAnimateDiffLightning) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Motion</p>
        <span className="tooltiptext">Control camera movement.</span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          {motions.map((item, idx) => (
            <div
              key={item.name + "-motion-" + idx}
              className={
                motion == item.motion ? "style-button border" : "style-button"
              }
              style={{
                padding: 0,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                setMotion(item.motion);
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
