/*

*/
import React from "react";

export default function StyleSelector({
  templates,
  model,
  templateName,
  setTemplate,
  setTemplateName,
  setNegativePrompt,
}) {
  if (
    model.model == "timbrooks/instruct-pix2pix" ||
    model.model == "stabilityai/stable-video-diffusion-img2vid-xt-1-1"
  ) {
    return;
  }
  return (
    <div className="hodler">
      <div className="tooltip">
        <p>Prompt style template</p>
        <span className="tooltiptext">
          Applies a template to your prompt to recreate a specific style.
        </span>
      </div>
      <div className="grid">
        <div className="grid-grid">
          {templates.map((item, idx) => (
            <div
              key={item.name + "-template-" + idx}
              className={
                templateName == item.name
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
                setTemplate(item.template);
                setTemplateName(item.name);
                setNegativePrompt(item.negative_prompt);
              }}
            >
              {item.name == "Style" ? "None" : item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
