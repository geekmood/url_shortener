import express from "express";
import dotenv from "dotenv";
import http from "http";
import urlValidator, { shortUrlValidator } from "./middleware/urlValidator.js";
import urlEncoder, { getOriginalURL } from "./lib/urlEncoder.js";
import { Server } from "socket.io";
import { urlResponseMaker } from "./lib/urlEncoder.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();

app.use(express.json());

// Socket handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Event receiver that receives the event from the client to shorten the URL.
  // It will call `emitWithRetry` function to respond the client with a separate protocol
  // with 3 possible retires, each after 5 seconds
  socket.on("requestShortenURL", async (url) => {
    const response = await urlEncoder(url);
    if (response !== false && response !== null) {
      const shortenedUrlData = urlResponseMaker(response);
      emitWithRetry(socket, shortenedUrlData, 0);
    } else if (response === false) {
      socket.emit("error", "The provided URL is already present in the system");
    } else {
      socket.emit(
        "error",
        "Might be your Redis Server is not working. Please check that your Redis is running"
      );
    }
  });
});

// POST method, for testing the working of the URL shortening in HTTP protocol. The default is the socket one.
app.post("/url", urlValidator, async (req, res) => {
  const response = await urlEncoder(req.body.url);
  if (response !== false && response !== null) {
    res.status(201).json({ shortenedURL: urlResponseMaker(response) });
  } else if (response == false) {
    res
      .status(403)
      .json({ error: "The provided URL is already present in the system" });
  } else {
    res.status(403).json({
      error:
        "Might be your Redis Server is not working. Please double check that your Redis is running",
    });
  }
});

// Get request for getting the response for the shortened URL.
app.get("/:shortURL", shortUrlValidator, async (req, res) => {
  const originalURL = await getOriginalURL(req.params.shortURL);
  if (originalURL !== null) {
    return res.status(200).json({ url: originalURL });
  } else
    return res
      .status(404)
      .json({ error: "The given Short URL doesn't exist in our system" });
});

// Separate function for emitting the response in the socket, in case of failure.
function emitWithRetry(socket, data, attempt) {
  const MAX_RETRIES = 3;
  const RETRY_TIMEOUT = 5000;

  socket.emit("shortenedURL", data, (acknowledged) => {
    if (!acknowledged) {
      console.log(
        `Attempt ${attempt + 1}: No acknowledgment received. Retrying...`
      );
      if (attempt < MAX_RETRIES) {
        setTimeout(
          () => emitWithRetry(socket, data, attempt + 1),
          RETRY_TIMEOUT
        );
      } else {
        console.log("Failed to get acknowledgment after maximum retries.");
      }
    } else {
      console.log("Client acknowledged receipt of the shortened URL.");
    }
  });
}

server.listen(process.env.PORT || 4000, () => {
  console.log("Server running on Port: ", process.env.PORT);
});
