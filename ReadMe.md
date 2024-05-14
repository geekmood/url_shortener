# URL Shortening Server

This project is a URL shortening server built using Node.js, Express, and Socket.IO. It allows clients to send URLs to be shortened and receive the shortened URLs asynchronously using a WebSocket connection. The server also supports standard HTTP requests for testing and direct interactions.

## Features

- **URL Shortening**: Convert long URLs into manageable shortened URLs.
- **Asynchronous Communication**: Utilize Socket.IO for real-time communication and ensure delivery even in unstable network conditions.
- **No Database Dependency**: Use Redis for fast in-memory data storage and retrieval.
- **Error Handling**: Comprehensive error responses for better debugging and user experience.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: You will need Node.js to run the server and its dependencies. Download and install it from [Node.js official website](https://nodejs.org/).
- **Redis**: As this project uses Redis for storing URLs, make sure you have Redis installed on your machine. You can find installation instructions on the [Redis website](https://redis.io/download).
- **npm** (Node Package Manager): Comes with Node.js, but you can check if it's installed by running `npm -v` in your terminal.

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/url-shortening-server.git
cd url-shortening-server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set environment variables**

- Create a .env file in the root directory of the project and add the following:

```bash
PORT=4000
BASE_URL=http://localhost:4000
REDIS_URL=redis://localhost:6379
```

- Make sure to replace the values as per your configuration.

## Running the Server

To start the server, run the following command:

```bash
npm start
```

This will launch the server on http://localhost:4000 (or whichever port you specified in the .env file).

## Usage

### Using Socket.IO for URL Shortening

1. **Connect to the WebSocket**

```bash
const socket = io('http://localhost:4000');
```

2. **Emit a request to shorten a URL**

```bash
socket.emit('requestShortenURL', 'https://example.com');
```

3. **Listen for the shortened URL**

```bash
socket.on('shortenedURL', data => {
  console.log('Shortened URL:', data);
});
```

### Using HTTP API

#### Shorten a URL

```bash
curl -X POST http://localhost:4000/url -H "Content-Type: application/json" -d '{"url": "https://example.com"}'
```

#### Access a shortened URL

```bash
curl http://localhost:4000/yourShortenedCode
```
