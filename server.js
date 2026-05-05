const express = require("express");
const app = express();

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
    "Mistwood": { time: "6:12 AM" },
    "Prairie Bluff": { time: "6:20 AM" },
    "Bolingbrook Golf Club": { time: "6:25 AM" }
  };

  res.json({
    date,
    results
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));


