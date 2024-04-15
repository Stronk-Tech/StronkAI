import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

export default function useApi(HTTP_URL, WS_URL) {
  // Max amount of active jobs. Given by backend API
  const [maxQueue, setMaxQueue] = useState(0);
  // Max amount of active jobs. Given by backend API
  const [workers, setWorkers] = useState([]);
  // Max amount of active jobs. Given by backend API
  const [queue, setQueue] = useState([]);
  // Max amount of active jobs. Given by backend API
  const [images, setImages] = useState([]);
  // Max amount of active jobs. Given by backend API
  const [videos, setVideos] = useState([]);
  // Open WebSocket connection to get job queue, worker status and notified of completed jobs
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      onOpen: () => {
        console.log("WebSocket connection established.");
        sendJsonMessage({ getState: true });
      },
      retryOnError: true,
      shouldReconnect: () => true,
    }
  );

  // Run when the connection state (readyState) changes
  useEffect(() => {
    console.log("Connection state changed");
  }, [readyState]);

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (!lastJsonMessage) return;
    const msg = lastJsonMessage;
    // Mutate state based on object passed
    if (msg.hasOwnProperty("maxQueueSize")) {
      setMaxQueue(msg.maxQueueSize);
    }
    if (msg.queue) {
      setQueue(msg.queue);
    }
    if (msg.workers) {
      setWorkers(msg.workers);
    }
    if (msg.newImage) {
      setImages((images) => [...images, msg.newImage]);
    }
    if (msg.newVideo) {
      setVideos((videos) => [...videos, msg.newVideo]);
    }
  }, [lastJsonMessage]);

  // On first load, retrieve file index on server. This gets updated over the WebSocket.
  useEffect(() => {
    function getIndex() {
      fetch(HTTP_URL + "/getIndex", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          setImages(data.images);
          setVideos(data.videos);
        })
        .catch((error) => console.error(error));
    }

    getIndex();
  }, []);

  return [maxQueue, workers, queue, images, videos];
}
