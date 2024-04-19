/*
  Contains state, mutators and layout of the app
*/
import React, { useState, useReducer } from "react";
import "./style.css";
import HeaderForm from "../../components/Header";
import SideBar from "../../components/SideBar";
import Preview from "../../components/Preview";
import useApi from "../../hooks/Api";
import Worker from "../../components/Worker";
import Job from "../../components/Job";
import ModelSelector from "../../components/Pickers/models";
import CheckpointSelector from "../../components/Pickers/checkpoints";
import SpeedupSelector from "../../components/Pickers/speedups";
import AnimationSelector from "../../components/Pickers/animations";
import NegativePrompt from "../../components/Inputs/negativeprompt";
import Prompt from "../../components/Inputs/prompt";
import MotionSelector from "../../components/Pickers/motions";
import StyleSelector from "../../components/Pickers/styles";
import LoraSelector from "../../components/Pickers/loras";

// Load env variable or assume local default host+port for backend
const HTTP_URL = process.env.REACT_APP_HTTP_URL || "http://127.0.0.1:42069";
const WS_URL = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:42069";

// Random prompt button which does not exist yet
const examplePrompts = [""];

// All
const models = [
  {
    name: "SDXL",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    baseModels: [
      {
        name: "None",
        model: "",
      },
      {
        name: "DreamShaper",
        model: "Lykon/dreamshaper-xl-1-0",
      },
      {
        name: "RealisticVision",
        model: "SG161222/RealVisXL_V4.0",
      },
    ],
    loRas: [
      {
        name: "None",
        model: "",
      },
      {
        name: "PixelArt",
        model: "nerijs/pixel-art-xl",
      },
    ],
    pipeline: "text-to-image",
    supportsLCM: true,
    supportsTurbo: true,
    supportsLightning: true,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
  {
    name: "SD1.5",
    model: "runwayml/stable-diffusion-v1-5",
    baseModels: [
      {
        name: "None",
        model: "",
      },
      {
        name: "AbsoluteReality",
        model: "digiplay/AbsoluteReality_v1.8.1",
      },
      {
        name: "epiCRealism",
        model: "emilianJR/epiCRealism",
      },
      {
        name: "DreamShaper",
        model: "Lykon/DreamShaper",
      },
      {
        name: "RealisticVision",
        model: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
      },
    ],
    loRas: [],
    pipeline: "text-to-image",
    supportsLCM: true,
    supportsTurbo: false,
    supportsLightning: false,
    supportsAnimateLCM: true,
    supportsAnimateDiff: true,
    supportsAnimateDiffLightning: true,
  },
  {
    name: "Openjourney",
    model: "prompthero/openjourney-v4",
    baseModels: [],
    loRas: [],
    pipeline: "text-to-image",
    supportsLCM: false,
    supportsTurbo: false,
    supportsLightning: false,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
  //
  {
    name: "SDXL",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    baseModels: [],
    loRas: [],
    pipeline: "image-to-image",
    supportsLCM: true,
    supportsTurbo: false,
    supportsLightning: true,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
  {
    name: "pix2pix",
    model: "timbrooks/instruct-pix2pix",
    baseModels: [],
    loRas: [],
    pipeline: "image-to-image",
    supportsLCM: false,
    supportsTurbo: false,
    supportsLightning: false,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
  //
  {
    name: "SVD",
    model: "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
    baseModels: [],
    loRas: [],
    pipeline: "image-to-video",
    supportsLCM: true,
    supportsTurbo: false,
    supportsLightning: false,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
  {
    name: "Coming soon!",
    model: "runwayml/stable-diffusion-v1-5",
    baseModels: [
      {
        name: "AbsoluteReality",
        model: "digiplay/AbsoluteReality_v1.8.1",
      },
      {
        name: "epiCRealism",
        model: "emilianJR/epiCRealism",
      },
      {
        name: "DreamShaper",
        model: "Lykon/DreamShaper",
      },
      {
        name: "RealisticVision",
        model: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
      },
    ],
    loRas: [],
    pipeline: "image-to-video",
    supportsLCM: true,
    supportsTurbo: false,
    supportsLightning: false,
    supportsAnimateLCM: false,
    supportsAnimateDiff: false,
    supportsAnimateDiffLightning: false,
  },
];

// Style templates. Replaces '{prompt}' with the actual prompt before sending the job request
const templates = [
  {
    name: "None",
    template: "{prompt}",
    negative_prompt: "",
  },
  {
    name: "Animal",
    template:
      "{prompt}, wildlife photography, photograph, high quality, wildlife, f 1.8, soft focus, 8k, national geographic",
    negative_prompt:
      "photo, deformed, black and white, realism, disfigured, low contrast",
  },
  {
    name: "Cinematic",
    template:
      "Cinematic Movie of {prompt} . shallow depth of field, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
    negative_prompt:
      "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured",
  },
  {
    name: "DigiArt",
    template:
      "concept art of {prompt} . digital artwork, illustrative, painterly, matte painting, highly detailed, photorealistic, octane render, 8k, unreal engine, sharp focus, volumetric lighting unreal engine",
    negative_prompt: "photo, photorealistic, realism, ugly",
  },
  {
    name: "Enhanced",
    template:
      "breathtaking {prompt} . award-winning, professional, highly detailed",
    negative_prompt: "ugly, deformed, noisy, blurry, distorted, grainy",
  },
  {
    name: "Fantasy",
    template:
      "ethereal fantasy concept art of {prompt} . magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
    negative_prompt:
      "photographic, realistic, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
  },
  {
    name: "Landscape",
    template:
      "{prompt}, realism, octane render, 8k, exploration, cinematic, artstation, 35 mm camera, unreal engine, hyper detailed, photo - realistic maximum detail, volumetric light, moody cinematic epic concept art, realistic matte painting, hyper photorealistic, epic, artstation, movie concept art, cinematic composition, ultra - detailed, realistic",
    negative_prompt: "",
  },
  {
    name: "Photo",
    template:
      "cinematic photo of {prompt} . 35mm photograph, Hyperdetailed Photography, film, bokeh, soft light, professional, 4k, extremely detailed, Nikon D850, (35mm|50mm|85mm), award winning photography",
    negative_prompt:
      "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly",
  },
  {
    name: "PixelArt",
    template: "pixel-art of {prompt} . low-res, blocky, pixels, 8-bit graphics",
    negative_prompt:
      "sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic",
  },
];

// Camera motions + which LoRas correspond with that motion
const motions = [
  {
    name: "None",
    motion: "",
  },
  {
    name: "Zoom in",
    motion: "guoyww/animatediff-motion-lora-zoom-in",
  },
  {
    name: "Zoom out",
    motion: "guoyww/animatediff-motion-lora-zoom-out",
  },
  {
    name: "Tilt up",
    motion: "guoyww/animatediff-motion-lora-tilt-up",
  },
  {
    name: "Tilt down",
    motion: "guoyww/animatediff-motion-lora-tilt-down",
  },
  {
    name: "Pan left",
    motion: "guoyww/animatediff-motion-lora-pan-left",
  },
  {
    name: "Pan right",
    motion: "guoyww/animatediff-motion-lora-pan-right",
  },
  {
    name: "Roll left",
    motion: "guoyww/animatediff-motion-lora-rolling-anticlockwise",
  },
  {
    name: "Roll right",
    motion: "guoyww/animatediff-motion-lora-rolling-clockwise",
  },
];

export default function Home() {
  // Pipeline names to display on the UI and send to the worker
  const [pipeline, setPipeline] = useState("CREATE");
  // Model names to display on the UI and send to the worker
  const [model, setModel] = useState({
    name: "SDXL",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    baseModel: "",
    pipeline: "text-to-image",
    enableLCM: false,
    enableTurbo: false,
    enableLightning: false,
    enableAnimateLCM: false,
    enableAnimateDiff: false,
  });
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  // Prompt given by user
  const [prompt, setPrompt] = useState(
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
  );
  // Negative prompt set by style
  const [negative_prompt, setNegativePrompt] = useState("");
  // Motion LoRa to request from the AI worker
  const [motion, setMotion] = useState("");
  // Style LoRa to request from the AI worker
  const [loRa, setLoRa] = useState("");
  // Template/style name to display and pattern to apply on the prompt
  const [template, setTemplate] = useState("{prompt}");
  const [templateName, setTemplateName] = useState("None");
  // Path to source asset to display in the preview window
  const [selectedPreview, setPreview] = useState("");
  // Path to source asset to use as input for the AI worker
  const [selectedImage, setImage] = useState("");
  const [selectedVideo, setVideo] = useState("");
  // WS API connection variables
  const [maxQueue, workers, queue, images, videos] = useApi(HTTP_URL, WS_URL);

  let thisModelInfo;
  for (const tmpModel of models) {
    if (tmpModel.pipeline != model.pipeline) {
      continue;
    }
    if (tmpModel.model != model.model) {
      continue;
    }
    thisModelInfo = tmpModel;
    break;
  }

  // Adjusts (hidden) params on pipeline change (newVal == "CREATE" || "ENHANCE" || "ANIMATE")
  function handlePipelineChange(newVal) {
    if (newVal == "CREATE") {
      setModel({
        name: "SDXL",
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        baseModel: "",
        pipeline: "text-to-image",
        enableLCM: false,
        enableTurbo: false,
        enableLightning: false,
        enableAnimateLCM: false,
        enableAnimateDiff: false,
        enableAnimateDiffLightning: false,
      });
      setMotion("");
      setLoRa("");
    }
    if (newVal == "ENHANCE") {
      setModel({
        name: "SDXL",
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        baseModel: "",
        pipeline: "image-to-image",
        enableLCM: false,
        enableTurbo: false,
        enableLightning: false,
        enableAnimateLCM: false,
        enableAnimateDiff: false,
        enableAnimateDiffLightning: false,
      });
      setMotion("");
      setLoRa("");
    }
    if (newVal == "ANIMATE") {
      setModel({
        name: "SVD",
        model: "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
        baseModel: "",
        pipeline: "image-to-video",
        enableLCM: false,
        enableTurbo: false,
        enableLightning: false,
        enableAnimateLCM: false,
        enableAnimateDiff: false,
        enableAnimateDiffLightning: false,
      });
      setMotion("");
      setLoRa("");
    }
    setPipeline(newVal);
  }

  // Replaces "template" with {words} in it with their corresponding value in data (obj)
  function replaceMe(template, data) {
    const pattern = /{\s*(\w+?)\s*}/g;
    return template.replace(pattern, (_, token) => data[token] || "");
  }

  // Take state and request job from API
  function handleSubmit() {
    let speedup_module = "";
    let animate_module = "";
    if (model.enableLCM) {
      speedup_module = "LCM";
    }
    if (model.enableTurbo) {
      speedup_module = "Turbo";
    }
    if (model.enableLightning) {
      speedup_module = "Lightning";
    }
    if (model.enableAnimateLCM) {
      animate_module = "LCM";
    }
    if (model.enableAnimateDiff) {
      animate_module = "AnimateDiff";
    }
    if (model.enableAnimateDiffLightning) {
      animate_module = "AnimateDiffLightning";
    }
    fetch(HTTP_URL + "/tokenize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: replaceMe(template, { prompt: prompt }),
        negative_prompt: negative_prompt,
        motion: motion,
        lora: loRa,
        image: pipeline == "video-to-video" ? selectedVideo : selectedImage,
        model: model.model,
        baseModel: model.baseModel,
        pipeline: model.pipeline,
        speedup_module: speedup_module,
        animate_module: animate_module,
      }),
    }).then((res) => {
      console.log(res);
    });
  }

  // Sets job image source and preview source
  function setImgSource(newVal) {
    setImage(newVal || "");
    setVideo("");
    setPreview(newVal || "");
  }

  // Clears job image source and sets preview source
  function setVidSource(newVal) {
    setImage("");
    setVideo(newVal || "");
    setPreview(newVal || "");
  }

  // Lil message to help the user out
  let message;
  let disabled = false;
  if (queue.length >= maxQueue) {
    disabled = true;
    message = "Queue is full";
  }
  if (
    model.pipeline == "image-to-image" ||
    model.pipeline == "image-to-video"
  ) {
    if (!selectedPreview == selectedImage) {
      disabled = true;
      message = "Select a source image";
    }
  }
  if (model.pipeline == "video-to-video") {
    if (!selectedPreview == selectedVideo) {
      disabled = true;
      message = "Select a source video";
    }
  }

  // Make submit request the job, rather than start a newline
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container">
      <div className="top">
        <HeaderForm pipeline={pipeline} setPipeline={handlePipelineChange} />
      </div>
      <div className="bot">
        {/* Left sidebar */}
        <div
          className="left"
          style={{
            borderRight: "2px solid rgba(0,0,0,0.2)",
            borderLeft: "2px solid rgba(0,0,0,0.2)",
          }}
        >
          {/* Some help text per pipeline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <h3 style={{ color: "#ffffff", marginBottom: 0 }}>{pipeline}</h3>
            {pipeline == "CREATE" ? (
              <p style={{ margin: 0 }}>Craft images and videos from text.</p>
            ) : null}
            {pipeline == "ENHANCE" ? (
              <p style={{ margin: 0 }}>
                Process images and videos. Upscaling, interpolation and
                inpainting coming soon!
              </p>
            ) : null}
            {pipeline == "ANIMATE" ? (
              <p style={{ margin: 0 }}>
                Create, extend or restyle videos. Lightning quick and directable
                AnimateDiff+SparseCtrl coming soon!
              </p>
            ) : null}
          </div>
          {/* Switch between base models, like SDXL or SD1.5 */}
          <ModelSelector
            models={models}
            model={model}
            setLoRa={setLoRa}
            setModel={setModel}
            forceUpdate={forceUpdate}
          />
          {/* Base model checkpoint selection, like RealVisXL or RealisticVision */}
          <CheckpointSelector
            thisModelInfo={thisModelInfo}
            model={model}
            setLoRa={setLoRa}
            setModel={setModel}
            forceUpdate={forceUpdate}
          />
          {/* Speedup module selection */}
          <SpeedupSelector
            thisModelInfo={thisModelInfo}
            model={model}
            setLoRa={setLoRa}
            setModel={setModel}
            forceUpdate={forceUpdate}
          />
          {/* Animation selection */}
          <AnimationSelector
            thisModelInfo={thisModelInfo}
            model={model}
            setLoRa={setLoRa}
            setModel={setModel}
            forceUpdate={forceUpdate}
          />
          {/* Prompt input */}
          <Prompt
            model={model}
            setPrompt={setPrompt}
            prompt={prompt}
            handleKeyDown={handleKeyDown}
          />
          {/* Negative prompt input */}
          <NegativePrompt
            model={model}
            setNegativePrompt={setNegativePrompt}
            negative_prompt={negative_prompt}
            handleKeyDown={handleKeyDown}
          />
          {/* AnimateDiff-Lightning supports camera direction */}
          <MotionSelector
            motions={motions}
            motion={motion}
            model={model}
            setMotion={setMotion}
          />
          {/* Style templates! */}
          <StyleSelector
            templates={templates}
            model={model}
            templateName={templateName}
            setTemplate={setTemplate}
            setTemplateName={setTemplateName}
            setNegativePrompt={setNegativePrompt}
          />
          {/* Processing LoRas */}
          <LoraSelector
            thisModelInfo={thisModelInfo}
            loRa={loRa}
            setLoRa={setLoRa}
            model={model}
          />
          {/* Submit + preview section */}
          <div
            style={{
              display: "flex",
              maxWidth: "100%",
              justifyContent: "space-evenly",
              height: "100px",
              marginBottom: "2em",
              marginTop: "2em",
            }}
          >
            {(model.pipeline == "video-to-video" && selectedVideo != "") ||
            ((model.pipeline == "image-to-video" ||
              model.pipeline == "image-to-image") &&
              selectedImage != "") ? (
              <div
                style={{
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flex: 1,
                }}
              >
                {model.pipeline == "video-to-video" ? (
                  <video
                    src={HTTP_URL + "/videos/" + selectedPreview}
                    style={{
                      objectFit: "cover",
                      maxHeight: "100px",
                      maxWidth: "100px",
                      aspectRatio: "initial",
                    }}
                  ></video>
                ) : (
                  <img
                    src={HTTP_URL + "/images/" + selectedPreview}
                    style={{
                      objectFit: "cover",
                      maxHeight: "100px",
                      maxWidth: "100px",
                      aspectRatio: "initial",
                    }}
                  ></img>
                )}
              </div>
            ) : (
              <div
                style={{
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flex: 1,
                }}
              >
                {message}
              </div>
            )}
            <div
              style={{
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                display: "flex",
                marginLeft: "1em",
                marginRight: "1em",
                flex: 1,
              }}
            >
              <div
                className="grid-button"
                style={
                  disabled
                    ? {
                        backgroundColor: "grey",
                        flex: 3,
                        height: "100%",
                        padding: 0,
                        height: "100px",
                        maxWidth: "200px",
                      }
                    : {
                        cursor: "pointer",
                        flex: 3,
                        padding: 0,
                        height: "100px",
                        maxWidth: "200px",
                        border: "3px solid rgba(56, 109, 164, 0.82)",
                      }
                }
                disabled={disabled}
                onClick={() => handleSubmit()}
              >
                Submit
              </div>
            </div>
          </div>
        </div>
        {/* Center preview */}
        <div className="max-and-center show-big-screen">
          <div
            className="show-big-screen"
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <h3 style={{ color: "#ffffff", alignSelf: "center" }}>View</h3>
          </div>
          <div
            className="show-big-screen"
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Preview
              isVideo={selectedPreview != selectedImage}
              file={selectedPreview}
              path={
                selectedPreview == selectedImage
                  ? HTTP_URL + "/images/"
                  : HTTP_URL + "/videos/"
              }
            />
          </div>
          <div
            className="show-big-screen"
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {queue.map((item, idx) => (
              <Job
                key={"queue-item-" + idx}
                model_id={item.model_id}
                startTime={item.timestamp}
              />
            ))}
            {workers.map((item, idx) => (
              <Worker
                key={"worker-" + idx}
                isBusy={item.busy}
                model_id={item.model_id}
                startTime={item.timestamp}
              />
            ))}
          </div>
        </div>
        {/* Right sidebars */}
        <div
          className="right"
          style={{
            borderRight: "2px solid rgba(0,0,0,0.2)",
            borderLeft: "2px solid rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <h3 style={{ color: "#ffffff", alignSelf: "center" }}>
              Browse results
            </h3>
          </div>
          <div
            className="hide-big-screen"
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
              minHeight: "400px",
              minWidth: "400px",
              maxHeight: "400px",
              maxWidth: "400px",
            }}
          >
            <Preview
              isVideo={selectedPreview != selectedImage}
              file={selectedPreview}
              path={
                selectedPreview == selectedImage
                  ? HTTP_URL + "/images/"
                  : HTTP_URL + "/videos/"
              }
            />
          </div>
          <div
            className="max-and-center"
            style={{ flexDirection: "row", display: "flex" }}
          >
            <SideBar
              setSource={setImgSource}
              sources={images}
              isVideo={false}
              path={HTTP_URL + "/images/"}
              selectedImage={selectedPreview}
              title={"Images"}
            />
            <SideBar
              setSource={setVidSource}
              sources={videos}
              isVideo={true}
              path={HTTP_URL + "/videos/"}
              selectedImage={selectedPreview}
              title={"Videos"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
