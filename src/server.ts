import app from "./app.js";
const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("HTTP server running on port " + port);
});
