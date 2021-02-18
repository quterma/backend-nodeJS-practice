/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config.js");
const fs = require("fs");

// const _data = require("./lib/data.js");

// // TESTING
// // @TODO delete this
// _data.delete("test", "newFile", err => {
// 	console.log("This was the error: ", err);
// });

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// Start the server
httpServer.listen(config.httpPort, () => {
	console.log(`The server is listening on port ${config.httpPort}.`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
	key: fs.readFileSync("./https/key.pem"),
	cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

// Start the server
httpsServer.listen(config.httpsPort, () => {
	console.log(`The server is listening on port ${config.httpsPort}.`);
});

// All the server logic for both http and https server
const unifiedServer = (req, res) => {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, "");

	// Get the query string as an object
	const queryStringObject = parsedUrl.query;

	// Get the HTTP method
	const method = req.method.toLowerCase();

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder("utf-8");
	let buffer = "";
	req.on("data", data => {
		buffer += decoder.write(data);
	});
	req.on("end", () => {
		buffer += decoder.end();

		// Choose the handler this request should go to. If one is not found, use the notFound handler.
		const chosenHandler = router[trimmedPath] ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		const data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: buffer,
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, (statusCode, payload) => {
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof statusCode == "number" ? statusCode : 200;

			// Use the payload called back by the handler, or default to an empty object
			payload = typeof payload == "object" ? payload : {};

			// Convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader("Content-Type", "application/json");
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the request path
			console.log("Returning this response: ", statusCode, payloadString);
		});
	});
};

// Define the handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
	callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
	callback(404);
};

// Define a request router
const router = {
	ping: handlers.ping,
};
