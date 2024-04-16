var express = require("express"),
  http = require("http"),
  path = require("path"),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  methodOverride = require("method-override");

var app = express();
const fs = require("fs");
const request = require("request");

const { WebSocket, WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const cors = require("cors");

const broadcasterUri = process.env.HOST || "127.0.0.1";
const broadcasterPort = 1937;
const imagePath = "/var/www/images";
const videoPath = "/var/www/videos";
const port = 42069;

const gpus = process.env.GPUS || 1;
const maxQueueSize = 5;
const workers = [];
// {
//   id: 0,
//   busy: false,
//   pipeline: "image-to-video",
//   model_id: "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
//   timestamp: null,
//   locked: true,
// }
const queue = [];
while (workers.length < gpus) {
  workers.push({
    id: workers.length,
    busy: false,
    pipeline: null,
    model_id: null,
    timestamp: null,
    locked: false,
  });
}

const imageContents = fs.readdirSync(imagePath);
let imageFiles = imageContents.filter((filename) => {
  return fs.statSync(`${imagePath}/${filename}`).isFile();
});
let imageFilesSorted = imageFiles.sort((a, b) => {
  let aStat = fs.statSync(`${imagePath}/${a}`),
    bStat = fs.statSync(`${imagePath}/${b}`);

  return (
    new Date(aStat.birthtime).getTime() - new Date(bStat.birthtime).getTime()
  );
});

const videoContents = fs.readdirSync(videoPath);
let videoFiles = videoContents.filter((filename) => {
  return fs.statSync(`${videoPath}/${filename}`).isFile();
});
let videoFilesSorted = videoFiles.sort((a, b) => {
  let aStat = fs.statSync(`${videoPath}/${a}`),
    bStat = fs.statSync(`${videoPath}/${b}`);

  return (
    new Date(aStat.birthtime).getTime() - new Date(bStat.birthtime).getTime()
  );
});

let wsServer;

app.set("port", process.env.PORT || port);
app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());

if (app.get("env") == "development") {
  app.locals.pretty = true;
}

app.get("/videos/:file", (req, res) => {
  console.log("Req video " + req.params.file);
  res.sendFile(path.join(videoPath + "/" + req.params.file));
});

app.get("/images/:file", (req, res) => {
  console.log("Req image " + req.params.file);
  res.sendFile(path.join(imagePath + "/" + req.params.file));
});

app.get("/getIndex", (req, res) => {
  res.send({
    images: imageFilesSorted,
    videos: videoFilesSorted,
  });
});

const onResult = (resData, pipeline) => {
  // {"images":[{"seed":2115279848,"url":"/stream/3ba0604f/1c0138fe.png"}]}
  if (resData.images) {
    for (const image of resData.images) {
      let filename = image.url.substring(image.url.lastIndexOf("/") + 1);
      let filepath;
      if (
        pipeline == "" ||
        pipeline == "text-to-image" ||
        pipeline == "image-to-image"
      ) {
        filepath = imagePath + "/" + filename;
      } else if (
        pipeline == "image-to-video" ||
        pipeline == "text-to-video" ||
        pipeline == "video-to-video"
      ) {
        filepath = videoPath + "/" + filename;
      }
      console.log(filename, filepath, image.url);

      // Download
      const file = fs.createWriteStream(filepath);
      const request = http
        .get(
          {
            hostname: broadcasterUri,
            path: image.url,
            port: broadcasterPort,
          },
          function (response) {
            // Save
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
              file.close();
              console.log("Download Completed");
              // Index
              if (
                pipeline == "" ||
                pipeline == "text-to-image" ||
                pipeline == "image-to-image"
              ) {
                imageFilesSorted.push(filename);
                wsServer.broadcast(JSON.stringify({ newImage: filename }));
              } else if (
                pipeline == "image-to-video" ||
                pipeline == "text-to-video" ||
                pipeline == "video-to-video"
              ) {
                videoFilesSorted.push(filename);
                wsServer.broadcast(JSON.stringify({ newVideo: filename }));
              }
            });
          }
        )
        .on("error", function (err) {
          // Handle errors
          console.log(err);
        });
    }
  }
};

const queueJob = () => {
  let thisJob = null;
  if (!queue.length) {
    console.log("No jobs to queue.");
    return;
  }
  // Check inactive workers for warm models
  var workerIdx = workers.length;
  while (workerIdx--) {
    if (workers[workerIdx].busy) {
      continue;
    }
    // Check if there's job request for the preloaded model
    var i = queue.length;
    while (i--) {
      if (
        queue[i].pipeline == workers[workerIdx].pipeline &&
        queue[i].model_id == workers[workerIdx].model_id
      ) {
        thisJob = queue.splice(i, 1)[0];
        console.log("Found warm model in available worker.");
        break;
      }
    }
    if (thisJob) {
      break;
    }
  }
  if (thisJob && workerIdx >= 0 && workerIdx < workers.length) {
    mint(workerIdx, thisJob);
    return;
  }
  // Check for any inactive worker without a preloaded model
  workerIdx = workers.length;
  while (workerIdx--) {
    if (
      workers[workerIdx].busy ||
      workers[workerIdx].pipeline ||
      workers[workerIdx].model_id
    ) {
      continue;
    }
    console.log("Found available worker without loaded model.");
    thisJob = queue.pop();
    break;
  }
  if (thisJob && workerIdx >= 0 && workerIdx < workers.length) {
    mint(workerIdx, thisJob);
    return;
  }
  // And take any free worker with a loaded model
  workerIdx = workers.length;
  while (workerIdx--) {
    if (workers[workerIdx].busy) {
      continue;
    }
    console.log("Found available worker with preloaded model.");
    thisJob = queue.pop();
    for (const worker of workers) {
      // Locked workers cannot switch models
      if (worker.busy || worker.locked) {
        continue;
      }
      // Since we don't know which model will get unloaded, mark all dynamic workers as unloaded
      worker.pipeline = null;
      worker.model_id = null;
    }
    break;
  }

  if (thisJob && workerIdx >= 0 && workerIdx < workers.length) {
    mint(workerIdx, thisJob);
    return;
  }

  console.log("Waiting for a worker to become idle...");
};

const mint = (workerIdx, job) => {
  if (workers[workerIdx].busy) {
    return;
  }
  workers[workerIdx].busy = true;
  workers[workerIdx].pipeline = job.pipeline;
  if (job.pipeline == "text-to-image" && job.animate_module != "") {
    job.pipeline = "text-to-video";
  }
  workers[workerIdx].model_id = job.model_id;
  workers[workerIdx].timestamp = Date.now();
  wsServer.broadcast(
    JSON.stringify({
      queue: queue,
      workers: workers,
      maxQueueSize: maxQueueSize,
    })
  );
  let data;
  let options;
  if (job.source) {
    const formData = {
      prompt: job.prompt,
      model_id: job.model_id,
      base_model_id: job.base_model_id,
      negative_prompt: job.negative_prompt,
      width: job.width,
      height: job.height,
      motion: job.motion,
      speedup_module: job.speedup_module,
      animate_module: job.animate_module,
    };
    if (pipeline == "video-to-video") {
      formData.video = fs.createReadStream(job.source);
    } else {
      formData.image = fs.createReadStream(job.source);
    }
    const options = {
      method: "POST",
      url:
        "http://" + broadcasterUri + ":" + broadcasterPort + "/" + job.pipeline,
      strictSSL: false,
      formData: formData,
    };
    request(options, function (err, res, body) {
      workers[workerIdx].busy = false;
      wsServer.broadcast(
        JSON.stringify({
          queue: queue,
          workers: workers,
          maxQueueSize: maxQueueSize,
        })
      );
      if (err) {
        console.log(err);
        return;
      }
      onResult(JSON.parse(body), job.pipeline);
      queueJob();
    });
  } else {
    data = JSON.stringify({
      prompt: job.prompt,
      model_id: job.model_id,
      base_model_id: job.base_model_id,
      negative_prompt: job.negative_prompt,
      width: job.width,
      height: job.height,
      motion: job.motion,
      speedup_module: job.speedup_module,
      animate_module: job.animate_module,
    });
    options = {
      hostname: broadcasterUri,
      path: "/" + job.pipeline,
      port: broadcasterPort,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const request = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        workers[workerIdx].busy = false;
        wsServer.broadcast(
          JSON.stringify({
            queue: queue,
            workers: workers,
            maxQueueSize: maxQueueSize,
          })
        );
        try {
          onResult(JSON.parse(responseData), job.pipeline);
        } catch (err) {
          console.log(responseData);
          console.log(err);
          return;
        }
        queueJob();
      });
    });

    request.on("error", (error) => {
      workers[workerIdx].busy = false;
      wsServer.broadcast(
        JSON.stringify({
          queue: queue,
          workers: workers,
          maxQueueSize: maxQueueSize,
        })
      );
      console.error("Error:", error);
      queueJob();
    });

    request.write(data);
    request.end();
  }
};

app.post("/tokenize", (req, res) => {
  const prompt = req.body.prompt || "";
  const negative_prompt = req.body.negative_prompt || "";
  const motion = req.body.motion || "";
  const image = req.body.image;
  let model_id = req.body.model;
  let base_model_id = req.body.baseModel || "";
  let pipeline = req.body.pipeline;
  let speedup_module = req.body.speedup_module || "";
  let animate_module = req.body.animate_module || "";

  if (!model_id || !pipeline || model_id == "" || pipeline == "") {
    res.sendStatus(400);
    return;
  }

  if (queue.length >= maxQueueSize) {
    res.sendStatus(400);
    return;
  }

  let width = 512;
  let height = 512;
  if (pipeline == "image-to-video"){
    if (model_id == "ali-vilab/i2vgen-xl"){
      width = 768;
      height = 768;
    }else if (model_id == "stabilityai/stable-video-diffusion-img2vid-xt-1-1"){
      width = 1024;
      height = 576;
    }
  } else if (pipeline == "text-to-image"){
    if (model_id == "stabilityai/stable-diffusion-xl-base-1.0"){
      width = 1024;
      height = 1024;
    }else if (model_id == "runwayml/stable-diffusion-v1-5"){
      width = 768;
      height = 768;
    }
  }

  // For certain SDXL-based modules, request the dedicated models.
  // For other Turbo/Lightning modes, load in the LoRas
  if (model_id == "stabilityai/stable-diffusion-xl-base-1.0") {
    if (speedup_module == "Turbo") {
      speedup_module = "";
      if (base_model_id == "Lykon/dreamshaper-xl-1-0"){
        base_model_id = ""
        model_id = "Lykon/dreamshaper-xl-v2-turbo"
      }else{
        base_model_id = ""
        model_id = "stabilityai/sdxl-turbo"
      }
    }else if (speedup_module == "Lightning") {
      speedup_module = "";
      if (base_model_id == "Lykon/dreamshaper-xl-1-0"){
        base_model_id = ""
        model_id = "Lykon/dreamshaper-xl-lightning"
      }else{
        base_model_id = ""
        model_id = "ByteDance/SDXL-Lightning"
      }
    }else{
      if (base_model_id == "Lykon/dreamshaper-xl-1-0"){
        base_model_id = ""
        model_id = "Lykon/dreamshaper-xl-1-0"
      }
    }
  }else if (animate_module != "") {
    if (base_model_id == ""){
      base_model_id == "runwayml/stable-diffusion-v1-5"
    }
    if (animate_module == "LCM"){
      model_id = "wangfuyun/AnimateLCM"
    }else if (animate_module == "AnimateDiff"){
      model_id = "ByteDance/AnimateDiff"
    }else if (animate_module == "AnimateDiffLightning"){
      model_id = "ByteDance/AnimateDiff-Lightning"
    }
  } else if (base_model_id != ""){
    // Since we don't support hot-swapping base models at the moment
    // request it as a dedicated model in the pipeline, which is supported.
    // model_id = base_model_id;
    // base_model_id = "";
  }
  if (model_id == "stabilityai/stable-video-diffusion-img2vid-xt-1-1"){
    if (speedup_module == "LCM") {
      model_id = "wangfuyun/AnimateLCM-SVD-xt";
      base_model_id = "";
    }
  }

  if (pipeline == "image-to-image" || pipeline == "image-to-video") {
    if (!image || image == "") {
      console.log("img2X requires image");
      res.sendStatus(400);
      return;
    }
    queue.unshift({
      prompt: prompt,
      negative_prompt: negative_prompt,
      motion: motion,
      model_id: model_id,
      base_model_id: base_model_id,
      source: imagePath + "/" + image,
      pipeline: pipeline,
      speedup_module: speedup_module,
      animate_module: animate_module,
      width: width,
      height: height,
      timestamp: Date.now(),
    });
    wsServer.broadcast(
      JSON.stringify({
        queue: queue,
        workers: workers,
        maxQueueSize: maxQueueSize,
      })
    );
    res.sendStatus(200);
    queueJob();
  } else if (pipeline == "video-to-video") {
    if (!image || image == "") {
      console.log("vid2X requires video");
      res.sendStatus(400);
      return;
    }
    queue.unshift({
      prompt: prompt,
      negative_prompt: negative_prompt,
      motion: motion,
      model_id: model_id,
      base_model_id: base_model_id,
      source: videoPath + "/" + image,
      pipeline: pipeline,
      speedup_module: speedup_module,
      animate_module: animate_module,
      width: width,
      height: height,
      timestamp: Date.now(),
    });
    wsServer.broadcast(
      JSON.stringify({
        queue: queue,
        workers: workers,
        maxQueueSize: maxQueueSize,
      })
    );
    res.sendStatus(200);
    queueJob();
  } else {
    queue.unshift({
      prompt: prompt,
      negative_prompt: negative_prompt,
      motion: motion,
      model_id: model_id,
      base_model_id: base_model_id,
      source: null,
      pipeline: pipeline,
      speedup_module: speedup_module,
      animate_module: animate_module,
      width: width,
      height: height,
      timestamp: Date.now(),
    });
    wsServer.broadcast(
      JSON.stringify({
        queue: queue,
        workers: workers,
        maxQueueSize: maxQueueSize,
      })
    );
    res.sendStatus(200);
    queueJob();
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const server = http.createServer(app);
wsServer = new WebSocketServer({ server });

// Maintain active connections and users
const clients = {};
const users = {};
let editorContent = null;
let userActivity = [];

// Handle new client connections
wsServer.on("connection", function handleNewConnection(connection) {
  const userId = uuidv4();
  console.log("Received a new connection");

  clients[userId] = connection;
  console.log(`${userId} connected.`);

  connection.on("message", (message) => {
    const msg = JSON.parse(message);
    console.log(userId + " sent message ", msg);
    if (msg.getState) {
      connection.send(
        JSON.stringify({
          queue: queue,
          workers: workers,
          maxQueueSize: maxQueueSize,
        })
      );
    }
  });
});

wsServer.broadcast = function broadcast(msg) {
  console.log(msg);
  wsServer.clients.forEach(function each(client) {
    client.send(msg);
  });
};

server.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
