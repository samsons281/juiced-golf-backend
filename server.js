const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
function getNextSaturday() {
  const today = new Date();
  const next = new Date(today);
  let days = (6 - today.getDay() + 7) % 7;
  if (days === 0) days = 7;
  next.setDate(today.getDate() + days);
  return next.toISOString().split("T")[0];
}

app.get("/", (req, res) => {
  res.send("Juiced Golf backend running");
});

app.get("/api/tee-times", async (req, res) => {
  const date = getNextSaturday();

  // MOCK LIVE DATA (fast + reliable)
const results = {
  "Cog Hill": { time: "6:10 AM" },
  "Orchard Valley": { time: "Not found" },
  "Prairie Bluff": { time: "6:20 AM" },
  "Mistwood": { time: "6:12 AM" },
  "Village Links of Glen Ellyn": { time: "Not found" },
  "The Preserve at Oak Meadows": { time: "Not found" },
  "Maple Meadows": { time: "Closed / renovation" },
  "Arrowhead": { time: "Not found" },
  "Prairie Landing": { time: "Not found" },
  "The Sanctuary": { time: "Not found" },
  "George Dunne": { time: "Not found" },
  "Wedgewood Golf Course": { time: "Not found" },
  "Naperbrook GC": { time: "Not found" },
  "Springbrook GC": { time: "Not found" },
  "Bolingbrook Golf Club": { time: "6:25 AM" },
  "Broken Arrow GC": { time: "Not found" },
  "Phillips Park GC": { time: "Not found" },
  "Blackberry Oaks GC": { time: "Not found" },
  "Bliss Creek GC": { time: "Not found" }
};

  res.json({
    date,
    results
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));


