/*
  Contains state, mutators and layout of the app
*/
import React, { useState } from "react";
import "./style.css";
import HeaderForm from "../../components/Header";
import SideBar from "../../components/SideBar";
import Preview from "../../components/Preview";
import useApi from "../../hooks/Api";
import Worker from "../../components/Worker";
import Job from "../../components/Job";

// Load env variable or assume local default host+port for backend
const HTTP_URL = process.env.REACT_APP_HTTP_URL || "http://127.0.0.1:42069";
const WS_URL = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:42069";

// Random prompt button which does not exist yet
const examplePrompts = [""];

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
      "{prompt}, wildlife photography, photograph, high quality, wildlife, f 1.8, soft focus, 8k, national geographic, award - winning photograph by nick nichols",
    negative_prompt:
      "photo, deformed, black and white, realism, disfigured, low contrast",
  },
  {
    name: "Anime",
    template:
      "anime artwork of {prompt} . anime style, key visual, vibrant, studio anime, highly detailed",
    negative_prompt:
      "photo, deformed, black and white, realism, disfigured, low contrast",
  },
  {
    name: "Cinematic",
    template:
      "cinematic film still of {prompt} . shallow depth of field, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
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
    name: "Isometric",
    template:
      "isometric style {prompt} . vibrant, beautiful, crisp, detailed, ultra detailed, intricate",
    negative_prompt:
      "deformed, mutated, ugly, disfigured, blur, blurry, noise, noisy, realistic, photographic",
  },
  {
    name: "Landscape",
    template:
      "{prompt}, close shot 35 mm, realism, octane render, 8k, exploration, cinematic, artstation, 35 mm camera, unreal engine, hyper detailed, photo - realistic maximum detail, volumetric light, moody cinematic epic concept art, realistic matte painting, hyper photorealistic, epic, artstation, movie concept art, cinematic composition, ultra - detailed, realistic",
    negative_prompt: "",
  },
  {
    name: "Photo",
    template:
      "cinematic photo of {prompt} . 35mm photograph, film, bokeh, soft light, professional, 4k, extremely detailed, Nikon D850, (35mm|50mm|85mm), award winning photography",
    negative_prompt:
      "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly",
  },
  {
    name: "PixelArt",
    template:
      "pixel-art of {prompt} . low-res, blocky, pixel art style, 8-bit graphics",
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
  const [pipelineName, setPipelineName] = useState("txt2img");
  const [pipeline, setPipeline] = useState("text-to-image");
  // Model names to display on the UI and send to the worker
  const [modelName, setModelName] = useState("SDXL++");
  const [model, setModel] = useState(
    "stabilityai/stable-diffusion-xl-base-1.0"
  );
  // Hidden property which auto-adjusts resolution based on workflow
  const [quality, setQuality] = useState("HD");
  // Prompt given by user
  const [prompt, setPrompt] = useState(
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
  );
  // Negative prompt set by style
  const [negative_prompt, setNegativePrompt] = useState("");
  // Motion LoRa to request from the AI worker
  const [motion, setMotion] = useState("");
  // Template/style name to display and pattern to apply on the prompt
  const [template, setTemplate] = useState("{prompt}");
  const [templateName, setTemplateName] = useState("None");
  // Path to source asset to display in the preview window
  const [selectedPreview, setPreview] = useState("");
  // Path to source asset to use as input for the AI worker
  const [selectedImage, setImage] = useState("");
  // WS API connection variables
  const [maxQueue, workers, queue, images, videos] = useApi(HTTP_URL, WS_URL);

  // Adjusts (hidden) params on pipeline change
  function handlePipelineChange(newVal, newName) {
    if (newVal == "text-to-image") {
      setModel("stabilityai/stable-diffusion-xl-base-1.0");
      setModelName("SDXL++");
      setQuality("HD");
    }
    if (newVal == "image-to-image") {
      setModel("timbrooks/instruct-pix2pix");
      setModelName("pix2pix");
      setQuality("HD");
    }
    if (newVal == "image-to-video") {
      setModel("stabilityai/stable-video-diffusion-img2vid-xt-1-1");
      setModelName("SVD XT");
      setQuality("SD");
    }
    if (newVal == "text-to-video") {
      setModel("ByteDance/AnimateDiff-Lightning");
      setModelName("AnimateDiff");
      setQuality("SD");
    } else {
      setMotion("");
    }
    setPipeline(newVal);
    setPipelineName(newName);
  }

  // Adjusts (hidden) params on model change
  function handleModelChange(newVal) {
    if (pipeline == "text-to-image") {
      if (newVal == "stabilityai/stable-diffusion-xl-base-1.0") {
        setQuality("HD");
      } else {
        setQuality("SD");
      }
    }
    setModel(newVal);
  }

  function handlePromptChange(newVal) {
    setPrompt(newVal);
  }

  // Replaces "template" with {words} in it with their corresponding value in data (obj)
  function replaceMe(template, data) {
    const pattern = /{\s*(\w+?)\s*}/g;
    return template.replace(pattern, (_, token) => data[token] || "");
  }

  // Take state and request job from API
  function handleSubmit() {
    fetch(HTTP_URL + "/tokenize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: replaceMe(template, { prompt: prompt }),
        negative_prompt: negative_prompt,
        motion: motion,
        model_id: model,
        image: selectedImage,
        pipeline: pipeline,
        quality: quality,
      }),
    }).then((res) => {
      console.log(res);
    });
  }

  // Sets job image source and preview source
  function setImgSource(newVal) {
    setImage(newVal || "");
    setPreview(newVal || "");
  }

  // Clears job image source and sets preview source
  function setVidSource(newVal) {
    setImage("");
    setPreview(newVal || "");
  }

  // Lil message to help the user out
  let message;
  let disabled = false;
  if (queue.length >= maxQueue) {
    disabled = true;
    message = "Queue is full";
  }
  if (pipeline == "image-to-image" || pipeline == "image-to-video") {
    if (!selectedPreview == selectedImage) {
      disabled = true;
      message = "Select a source image";
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
        <HeaderForm
          pipeline={pipeline}
          setPipeline={setPipeline}
          pipelineName={pipelineName}
          setPipelineName={setPipelineName}
          model={model}
          setModel={setModel}
          modelName={modelName}
          setModelName={setModelName}
          setQuality={setQuality}
          setMotion={setMotion}
          handlePipelineChange={handlePipelineChange}
          handleModelChange={handleModelChange}
        />
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
          <h3 style={{ color: "#ffffff", alignSelf: "center" }}>
            Create {pipeline}
          </h3>
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
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
                value={
                  pipeline == "image-to-video" &&
                  model == "stabilityai/stable-video-diffusion-img2vid-xt-1-1"
                    ? "This model supports no text input"
                    : prompt
                }
                placeholder={"Prompt"}
                style={{
                  width: "100%",
                  height: "100%",
                  marginLeft: "0.2em",
                  marginRight: "0.2em",
                }}
                onChange={(e) => handlePromptChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={
                  pipeline == "image-to-video" &&
                  model == "stabilityai/stable-video-diffusion-img2vid-xt-1-1"
                }
              />
            </div>
            {pipeline == "text-to-video" &&
            model == "ByteDance/AnimateDiff-Lightning" ? (
              <p style={{ color: "#ffffff", alignSelf: "center" }}>Motion</p>
            ) : null}
            {pipeline == "text-to-video" &&
            model == "ByteDance/AnimateDiff-Lightning" ? (
              <div className="grid">
                <div className="grid-grid">
                  {motions.map((item, idx) => (
                    <div
                      key={item.name + "-motion-" + idx}
                      className={
                        motion == item.motion
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
                        setMotion(item.motion);
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {model != "timbrooks/instruct-pix2pix" ? (
              <p style={{ color: "#ffffff", alignSelf: "center" }}>Style</p>
            ) : (
              <p style={{ color: "#ffffff", alignSelf: "center" }}>
                Be descriptive! This model is trained to edit images from
                human-provided instructions. For example, your prompt can be
                “turn the clouds rainy”.
              </p>
            )}
            {model != "timbrooks/instruct-pix2pix" ? (
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
            ) : null}

            <div
              style={{
                color: "#ffffff",
                alignSelf: "center",
                width: "100%",
                height: "0.5em",
                marginBottom: "0.5em",
                borderBottom: "1px solid rgba(56, 60, 62, 0.7)",
                height: "100%",
                flex: 1,
              }}
            />

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-evenly",
                height: "50px",
                marginBottom: "1em",
              }}
            >
              {(pipeline == "image-to-video" || pipeline == "image-to-image") &&
              selectedImage != "" ? (
                <div
                  style={{
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flex: 1,
                  }}
                >
                  <img
                    src={HTTP_URL + "/images/" + selectedPreview}
                    style={{
                      objectFit: "cover",
                      maxHeight: "70px",
                      maxWidth: "70px",
                      aspectRatio: "initial",
                    }}
                  ></img>
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
                          flex: 1,
                          height: "100%",
                          padding: 0,
                        }
                      : {
                          cursor: "pointer",
                          flex: 1,
                          height: "100%",
                          padding: 0,
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
