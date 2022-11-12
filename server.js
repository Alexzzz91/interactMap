import express from "express";

const app = express();

app.use(express.static("dist"));

app.set("trust proxy", 1);

app.get("/healthcheck", (req, res) => {
  res.end("ok");
});

app.get("*", function(req, res){
  res.sendFile("dist/index.html");
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});