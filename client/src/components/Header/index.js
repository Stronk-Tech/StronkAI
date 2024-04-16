/*
  Header above the app for pipeline and model selection
*/
import React from "react";
import "./style.css";

const models = [
  {
    name: "SDXL Lightning",
    model: "ByteDance/SDXL-Lightning",
    pipeline: "text-to-image",
  },
  {
    name: "SDXL++",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    pipeline: "text-to-image",
  },
  {
    name: "SD Turbo",
    model: "stabilityai/sd-turbo",
    pipeline: "text-to-image",
  },
  {
    name: "SDXL Turbo",
    model: "stabilityai/sdxl-turbo",
    pipeline: "text-to-image",
  },
  {
    name: "SD 1.5",
    model: "ByteDarunwayml/stable-diffusion-v1-5",
    pipeline: "text-to-image",
  },
  {
    name: "Openjourney",
    model: "prompthero/openjourney-v4",
    pipeline: "text-to-image",
  },
  {
    name: "AbsoluteReality",
    model: "digiplay/AbsoluteReality_v1.8.1",
    pipeline: "text-to-image",
  },
  {
    name: "epiCRealism",
    model: "emilianJR/epiCRealism",
    pipeline: "text-to-image",
  },
  {
    name: "DreamShaper",
    model: "Lykon/DreamShaper",
    pipeline: "text-to-image",
  },
  {
    name: "RealisticVision",
    model: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
    pipeline: "text-to-image",
  },
  {
    name: "RealVisXL",
    model: "SG161222/RealVisXL_V4.0_Lightning",
    pipeline: "text-to-image",
  },
  {
    name: "AnimateDiff",
    model: "ByteDance/AnimateDiff",
    pipeline: "text-to-video",
  },
  {
    name: "AnimateDiff Lightning",
    model: "ByteDance/AnimateDiff-Lightning",
    pipeline: "text-to-video",
  },
  {
    name: "Vilab",
    model: "ali-vilab/text-to-video-ms-1.7b",
    pipeline: "text-to-video",
  },
  {
    name: "SDXL Turbo",
    model: "stabilityai/sdxl-turbo",
    pipeline: "image-to-image",
  },
  {
    name: "pix2pix",
    model: "timbrooks/instruct-pix2pix",
    pipeline: "image-to-image",
  },
  {
    name: "SDXL Lightning",
    model: "ByteDance/SDXL-Lightning",
    pipeline: "image-to-image",
  },
  {
    name: "SD Turbo",
    model: "stabilityai/sd-turbo",
    pipeline: "image-to-image",
  },
  {
    name: "SVD XT",
    model: "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
    pipeline: "image-to-video",
  },
  {
    name: "i2vgen",
    model: "ali-vilab/i2vgen-xl",
    pipeline: "image-to-video",
  },
  {
    name: "AnimateDiff",
    model: "ByteDance/AnimateDiff",
    pipeline: "video-to-video",
  },
];

export default function Header(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <h3
        style={{
          color: "#ffffff",
          alignSelf: "center",
          marginRight: "1em",
          marginLeft: "1em",
        }}
      >
        Stronk AI
      </h3>
      <div
        className={
          props.pipeline == "text-to-image"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.handlePipelineChange("text-to-image", "txt2img");
        }}
      >
        txt2img
      </div>
      <div
        className={
          props.pipeline == "image-to-image"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.handlePipelineChange("image-to-image", "img2img");
        }}
      >
        img2img
      </div>
      <div
        className={
          props.pipeline == "image-to-video"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.handlePipelineChange("image-to-video", "img2vid");
        }}
      >
        img2vid
      </div>
      <div
        className={
          props.pipeline == "text-to-video"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.handlePipelineChange("text-to-video", "txt2vid");
        }}
      >
        text2vid
      </div>
      {/* <div
        className={
          props.pipeline == "video-to-video"
            ? "dropdown-item border"
            : "dropdown-item"
        }
        onClick={() => {
          props.handlePipelineChange("video-to-video", "vid2vid");
        }}
      >
        vid2vid
      </div> */}
      <div className="dropdown">
        <p className="dropdown-button" style={{ marginLeft: "1em" }}>
          &#8595; Model &#8595;
        </p>
        <div className="dropdown-content">
          {models.map((item, idx) =>
            props.pipeline == item.pipeline ? (
              <div
                key={item.name + "-model-" + idx}
                className={
                  props.model == item.model
                    ? "dropdown-item border"
                    : "dropdown-item"
                }
                onClick={() => {
                  props.handleModelChange(item.model);
                  props.setModelName(item.name);
                }}
              >
                {item.name}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
