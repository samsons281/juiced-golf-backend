const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");
const app = express();
app.use(cors());
const PORT = process.env.PORT || 10000;

const courses = [
  { name: "Cog Hill", url: "https://coghillgolf.com/" },
  { name: "Orchard Valley", url: "https://www.orchardvalleygolf.com/" },
  { name: "Prairie Bluff", url: "https://prairiebluffgc.com/" },
  { name: "Mistwood", url: "https://www.mistwoodgc.com/" },
  { name: "Village Links of Glen Ellyn", url: "https://villagelinksgolf.com" },
  { name: "The Preserve at Oak Meadows", url: "https://dupagegolf.com/oak-meadows/" },
  { name: "Maple Meadows", url: "https://dupagegolf.com/maple-meadows-closed-for-renovation/" },
  { name: "Arrowhead", url: "https://arrowheadgolfclub.org/" },
  { name: "Prairie Landing", url: "https://prairielanding.com/" },
  { name: "The Sanctuary", url: "https://sanctuarygolfcourse.com/" },
  { name: "George Dunne", url: "https://georgedunne.forestpreservegolf.com/" },
  { name: "Wedgewood Golf Course", url: "https://golfjoliet.com/" },
  { name: "Naperbrook GC", url: "https://golfnaperville.org/" },
  { name: "Springbrook GC", url: "https://golfnaperville.org/" },
  { name: "Bolingbrook Golf Club", url: "https://www.bolingbrookgolfclub.com/" },
  { name: "Broken Arrow GC", url: "https://www.golfbrokenarrow.com/" },
  { name: "Phillips Park GC", url: "https://www.phillipsparkaurora.com/" },
  { name: "Blackberry Oaks GC", url: "https://blackberryoaks.com/" },
  { name: "Bliss Creek GC", url: "https://www.blisscreekgolf.com/" }
];

function nextSaturdayISO() {
  const today = new Date();
  const d = new Date(today);
  let daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  if (daysUntilSaturday === 0) daysUntilSaturday = 7;
  d.setDate(today.getDate() + daysUntilSaturday);
  return d.toISOString().slice(0, 10);
}
function normalizeTime(text) {
  const m = text.match(/\b(0?[5-9]|10|11):([0-5][0-9])\s*(AM|am)\b/);
  return m ? `${m[1]}:${m[2]} AM` : null;
}
function mins(t){ const m=t&&t.match(/(\d{1,2}):(\d{2})/); return m?parseInt(m[1])*60+parseInt(m[2]):9999; }

async function scrapeCourse(course, dateISO, browser) {
  const page = await browser.newPage({ userAgent:"Mozilla/5.0 Chrome/120 Safari/537.36" });
  try {
    await page.goto(course.url, { waitUntil:"domcontentloaded", timeout:25000 });
    await page.waitForTimeout(2500);
    const text = await page.locator("body").innerText({ timeout:10000 });
    const rows = text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const hits = [];
    for (const row of rows) {
      const time = normalizeTime(row);
      if (!time) continue;
      const lower = row.toLowerCase();
      const available = !lower.includes("sold") && !lower.includes("unavailable") && !lower.includes("closed");
      const eighteen = lower.includes("18") || lower.includes("eighteen") || !lower.includes("9");
      if (available && eighteen) hits.push({ time, raw: row });
    }
    hits.sort((a,b)=>mins(a.time)-mins(b.time));
    if (hits.length) return { time:hits[0].time, date:dateISO, status:"live", source:course.url, detail:hits[0].raw };
    return { time:null, date:dateISO, status:"needs_adapter", source:course.url, detail:"No public tee time text found. Course likely needs a booking-engine-specific adapter." };
  } catch(e) {
    return { time:null, date:dateISO, status:"error", source:course.url, detail:e.message };
  } finally { await page.close().catch(()=>{}); }
}

app.get("/", (req,res)=>res.json({ ok:true, endpoint:"/api/tee-times" }));
app.get("/api/tee-times", async (req,res)=>{
  const dateISO = req.query.date || nextSaturdayISO();
  const results = {};
  let browser;
  try {
    browser = await chromium.launch({ headless:true, args:["--no-sandbox","--disable-setuid-sandbox"] });
    for (const c of courses) results[c.name] = await scrapeCourse(c, dateISO, browser);
    res.json({ date:dateISO, updatedAt:new Date().toISOString(), results });
  } catch(e) { res.status(500).json({ error:e.message, results }); }
  finally { if (browser) await browser.close().catch(()=>{}); }
});
app.listen(PORT, ()=>console.log("Juiced Golf scraper running on " + PORT));