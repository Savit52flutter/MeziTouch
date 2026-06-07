const { createServer } = require("node:http");
const { parse } = require("node:url");
const path = require("node:path");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const dir = path.join(__dirname, "..");

const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (error) {
        console.error("Request error", req.url, error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;

    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port} (pid ${process.pid})`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js", error);
    process.exit(1);
  });
