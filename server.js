import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let requests = [];
let riders = [];
let requestIdCounter = 1;
let riderIdCounter = 1;

app.post("/api/requests", (req, res) => {
  const newRequest = { ...req.body, id: requestIdCounter++ };
  requests.push(newRequest);
  res.status(201).json(newRequest);
});

app.get("/api/requests", (req, res) => res.json(requests));

app.delete("/api/requests/:id", (req, res) => {
  requests = requests.filter((r) => r.id !== parseInt(req.params.id, 10));
  res.status(204).send();
});

app.post("/api/riders", (req, res) => {
  const newRider = { ...req.body, id: riderIdCounter++ };
  riders.push(newRider);
  res.status(201).json(newRider);
});

app.get("/api/riders", (res) => res.json(riders));

app.delete("/api/riders/:id", (req, res) => {
  riders = riders.filter((r) => r.id !== parseInt(req.params.id, 10));
  res.status(204).send();
});

app.listen(3001, "127.0.0.1", () =>
  console.log("Elevator API running on http://127.0.0.1:3001"),
);
