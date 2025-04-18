import app from "./app.ts";
const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("HTTPS server running on port " + port);
});
