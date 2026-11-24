/* =========================================================
   Liftwise - script.js
   All the behaviour of the website:
     1.  Data (splits, exercises, body drawings)
     2.  Saved data (per user, stored in this browser)
     3.  Small helpers
     4.  Page switching (the "multi-page" feel)
     5.  Home and Workouts pages
     6.  Log page (logger)
     7.  Progress page (week, streak, bars)
     8.  Rest timer and chime
     9.  Click and typing events
     10. Login, sign up, log out
     11. Start-up
   Loaded at the end of index.html with <script src="script.js">.
   ========================================================= */


// If anything in this file crashes, show the error in the red message bar at the top of the page.
window.addEventListener("error", function (e) {
  const bar = document.getElementById("loadmsg"), out = document.getElementById("loaderr");
  if (bar && !bar.hidden && out) out.textContent = "(Error: " + e.message + ")";
});

/* ---------------------------------------------------------
   1. DATA
   --------------------------------------------------------- */

// The four workout splits: n = name, d = description, c = color used in the design.
const SPL = {
  push: { n: "Push day",  d: "Chest, shoulders and triceps.", c: "#ff5a4e",
          w: "Beginners who want a simple 3-day routine.",        t: "45–60 min" },
  pull: { n: "Pull day",  d: "Back and biceps.",               c: "#3a5bff",
          w: "Anyone building a stronger back and better posture.", t: "45–60 min" },
  legs: { n: "Leg day",   d: "Quads and hamstrings.",          c: "#12a888",
          w: "Lifters with energy to spare, as squats are demanding.", t: "50–70 min" },
  full: { n: "Full body", d: "One move for every major muscle group.", c: "#ffb938",
          w: "People who can only train 2 to 3 days a week.",     t: "60–75 min" }
};

// Every exercise as [id, split, name, target muscle]. Add more rows to grow the catalog.
const EX = [
  ["bp", "push", "Barbell bench press",      "Chest"],
  ["ip", "push", "Incline dumbbell press",   "Chest"],
  ["sp", "push", "Overhead shoulder press",  "Shoulders"],
  ["tp", "push", "Triceps rope pushdown",    "Triceps"],
  ["lp", "pull", "Lat pulldown",             "Back"],
  ["sr", "pull", "Seated cable row",         "Back"],
  ["dc", "pull", "Dumbbell curl",            "Biceps"],
  ["fp", "pull", "Face pull",                "Rear delts"],
  ["sq", "legs", "Back squat",               "Quads"],
  ["lg", "legs", "Leg press",                "Quads"],
  ["rd", "legs", "Romanian deadlift",        "Hamstrings"],
  ["lc", "legs", "Lying leg curl",           "Hamstrings"],
  ["gs", "full", "Goblet squat",             "Quads"],
  ["pu", "full", "Push-up",                  "Chest"],
  ["or", "full", "One-arm dumbbell row",     "Back"],
  ["pl", "full", "Plank",                    "Core"]
];

// Extra details for each exercise, matched by id:
//   eq = equipment, lv = difficulty, sec = other muscles worked, sr = suggested starting sets x reps,
//   st = how-to steps, cu = form cues, img = optional photo/GIF link (leave "" to use images/ID.gif or images/ID.jpg)
const INFO = {
  bp: { eq: "Barbell, bench, rack", lv: "Intermediate", sec: "Triceps, front shoulders", sr: "3 × 6–10 reps", img: "",
        st: ["Lie on the bench with your eyes under the bar and your feet flat on the floor.",
             "Grip the bar slightly wider than your shoulders, unrack it and lower it to your mid-chest.",
             "Press the bar up until your arms are straight."],
        cu: ["Pull your shoulder blades together and keep your feet planted.",
             "Use a spotter or the rack's safety bars.",
             "Lower under control; don't bounce the bar off your chest."] },
  ip: { eq: "Dumbbells, incline bench", lv: "Beginner", sec: "Shoulders, triceps", sr: "3 × 8–12 reps", img: "",
        st: ["Set the bench to a low incline (about 30 to 45 degrees) and sit with the dumbbells on your thighs.",
             "Lie back and press the dumbbells up over your upper chest.",
             "Lower until your elbows are about level with your body, then press up again."],
        cu: ["Keep your wrists stacked over your elbows.",
             "Angle your elbows about 45 degrees from your body, not straight out.",
             "Move slowly in both directions."] },
  sp: { eq: "Dumbbells or barbell", lv: "Intermediate", sec: "Triceps, upper chest", sr: "3 × 8–10 reps", img: "",
        st: ["Stand or sit tall with the weights at shoulder height.",
             "Press straight up until your arms are fully extended.",
             "Lower back to shoulder height with control."],
        cu: ["Squeeze your glutes and brace your abs so you don't lean back.",
             "Press in a straight line over your head.",
             "Start light until the movement feels smooth."] },
  tp: { eq: "Cable machine, rope", lv: "Beginner", sec: "Forearms", sr: "3 × 10–15 reps", img: "",
        st: ["Attach the rope to a high pulley and hold both ends with your elbows at your sides.",
             "Push down until your arms are straight, spreading the rope slightly at the bottom.",
             "Let your hands rise until your forearms are about parallel to the floor."],
        cu: ["Keep your elbows pinned to your sides.",
             "Don't lean over the weight; stay tall.",
             "Choose a weight you can control for every rep."] },
  lp: { eq: "Cable machine, wide bar", lv: "Beginner", sec: "Biceps, rear shoulders", sr: "3 × 8–12 reps", img: "",
        st: ["Sit with your thighs under the pads and grip the bar slightly wider than your shoulders.",
             "Lean back a little and pull the bar down to your upper chest.",
             "Let your arms straighten slowly until you feel a stretch in your back."],
        cu: ["Lead with your elbows, not your hands.",
             "Keep your chest up and don't swing.",
             "Don't pull the bar behind your neck."] },
  sr: { eq: "Cable machine, handle", lv: "Beginner", sec: "Biceps, rear shoulders", sr: "3 × 8–12 reps", img: "",
        st: ["Sit with your feet on the platform and your knees slightly bent, holding the handle.",
             "Pull the handle to your stomach and squeeze your shoulder blades together.",
             "Return slowly until your arms are straight."],
        cu: ["Keep your back flat and your chest tall.",
             "Don't rock your body to move the weight.",
             "Pause for a moment at the end of each pull."] },
  dc: { eq: "Dumbbells", lv: "Beginner", sec: "Forearms", sr: "3 × 10–12 reps", img: "",
        st: ["Stand with a dumbbell in each hand, arms by your sides and palms facing forward.",
             "Curl the weights up toward your shoulders.",
             "Lower them slowly until your arms are straight."],
        cu: ["Keep your elbows at your sides.",
             "Don't swing your body to lift the weight.",
             "Control the lowering part, it works the muscle too."] },
  fp: { eq: "Cable machine, rope", lv: "Beginner", sec: "Upper back, shoulders", sr: "3 × 12–15 reps", img: "",
        st: ["Set the pulley at about face height and hold the rope with both hands.",
             "Pull the rope toward your face, with your elbows high and wide.",
             "Squeeze your shoulder blades, then return slowly."],
        cu: ["Use a light weight; this is a posture exercise.",
             "Pull the rope ends apart as you bring them back.",
             "Keep your ribs down and don't lean back."] },
  sq: { eq: "Barbell, squat rack", lv: "Intermediate", sec: "Glutes, core", sr: "3 × 5–8 reps", img: "",
        st: ["Rest the bar on your upper back with your feet about shoulder width apart.",
             "Sit down and back until your thighs are about parallel to the floor.",
             "Drive up through your whole foot to stand."],
        cu: ["Keep your back flat and your chest up.",
             "Let your knees track in line with your toes.",
             "Set the safety bars and begin with a light weight."] },
  lg: { eq: "Leg press machine", lv: "Beginner", sec: "Glutes", sr: "3 × 10–12 reps", img: "",
        st: ["Sit with your back against the seat and your feet shoulder width apart on the platform.",
             "Lower the platform until your knees are bent about 90 degrees.",
             "Press back up without locking your knees."],
        cu: ["Don't lock your knees at the top.",
             "Keep your hips and lower back pressed into the seat.",
             "Push through your whole foot."] },
  rd: { eq: "Barbell or dumbbells", lv: "Intermediate", sec: "Glutes, lower back", sr: "3 × 8–10 reps", img: "",
        st: ["Stand holding the weight in front of your thighs with your knees slightly bent.",
             "Push your hips back and slide the weight down your legs until you feel a hamstring stretch.",
             "Drive your hips forward to stand tall."],
        cu: ["Keep your back flat and the weight close to your legs.",
             "Stop lowering when you feel the stretch, not when you touch the floor.",
             "Move at the hips, not by rounding your back."] },
  lc: { eq: "Leg curl machine", lv: "Beginner", sec: "Calves", sr: "3 × 10–15 reps", img: "",
        st: ["Lie face down with the pad just above your heels.",
             "Curl your heels toward your glutes.",
             "Lower slowly to the start."],
        cu: ["Keep your hips pressed into the pad.",
             "Don't jerk the weight up.",
             "Use a weight that lets you control the way down."] },
  gs: { eq: "Dumbbell or kettlebell", lv: "Beginner", sec: "Glutes, core", sr: "3 × 8–12 reps", img: "",
        st: ["Hold the weight against your chest with your feet slightly wider than your shoulders.",
             "Squat down between your knees.",
             "Stand back up by pushing through your heels."],
        cu: ["Keep your chest up and your elbows inside your knees.",
             "Keep your heels on the floor.",
             "Keep your back flat all the way down."] },
  pu: { eq: "Bodyweight", lv: "Beginner", sec: "Triceps, shoulders, core", sr: "3 × 6–12 reps", img: "",
        st: ["Place your hands slightly wider than your shoulders with your body in a straight line.",
             "Lower your chest toward the floor.",
             "Push back up until your arms are straight."],
        cu: ["Keep a straight line from your head to your heels.",
             "Keep your elbows about 45 degrees from your body.",
             "Too hard? Do them from your knees or with your hands on a bench."] },
  or: { eq: "Dumbbell, bench", lv: "Beginner", sec: "Biceps, rear shoulders", sr: "3 × 8–12 reps each side", img: "",
        st: ["Rest one hand and one knee on a bench and hold a dumbbell in the other hand.",
             "Pull the dumbbell toward your hip.",
             "Lower it slowly until your arm is straight."],
        cu: ["Keep your back flat and roughly parallel to the floor.",
             "Don't twist your body to lift the weight.",
             "Pull with your back, not just your arm."] },
  pl: { eq: "Bodyweight", lv: "Beginner", sec: "Shoulders, glutes", sr: "3 × 20–40 seconds", img: "",
        st: ["Rest on your forearms with your elbows under your shoulders.",
             "Straighten your legs so your body forms one line.",
             "Hold the position and keep breathing."],
        cu: ["Squeeze your abs and glutes.",
             "Don't let your hips sag or lift too high.",
             "Stop the set when your form starts to slip."] }
};

// The body drawing is built from simple shapes (SVG). Each key is one body part.
const SHAPES = {
  hd: '<circle cx="50" cy="14" r="10"/>',                                   // head
  sh: '<circle cx="31" cy="35" r="8"/><circle cx="69" cy="35" r="8"/>',     // shoulders
  ch: '<rect x="35" y="30" width="30" height="22" rx="8"/>',                // chest
  co: '<rect x="39" y="54" width="22" height="28" rx="6"/>',                // core (stomach)
  ar: '<rect x="19" y="40" width="10" height="26" rx="5"/><rect x="71" y="40" width="10" height="26" rx="5"/>' +
      '<rect x="16" y="68" width="9" height="26" rx="4"/><rect x="75" y="68" width="9" height="26" rx="4"/>', // arms
  th: '<rect x="36" y="86" width="13" height="36" rx="6"/><rect x="51" y="86" width="13" height="36" rx="6"/>', // thighs
  lg: '<rect x="37" y="124" width="11" height="30" rx="5"/><rect x="52" y="124" width="11" height="30" rx="5"/>' // lower legs
};

// Which body parts to highlight for each target muscle.
const TARGETS = {
  "Chest": ["ch"], "Shoulders": ["sh"], "Triceps": ["ar"], "Biceps": ["ar"],
  "Back": ["ch", "co"], "Rear delts": ["sh"], "Quads": ["th"], "Hamstrings": ["th"], "Core": ["co"]
};

// Returns the body drawing as an SVG string.
//   m = target muscle, c = highlight color, all = highlight everything, base = color of the other parts
function body(m, c, all, base) {
  const hi = all ? Object.keys(SHAPES) : TARGETS[m] || [];   // list of parts to highlight
  const label = all ? "Full body" : m + " highlighted";       // text for screen readers
  let svg = '<svg viewBox="0 0 100 160" role="img" aria-label="' + label + '">';
  Object.keys(SHAPES).forEach(k => {
    const on = hi.includes(k);                                // is this part highlighted?
    // Highlighted parts use the color at full strength; others use the text color, faded
    svg += '<g fill="' + (on ? c : (base || "currentColor")) + '" opacity="' + (on ? 1 : .35) + '">' + SHAPES[k] + '</g>';
  });
  // Muscles seen from behind get a small "back view" caption
  if (["Back", "Rear delts", "Hamstrings", "Triceps"].includes(m)) {
    svg += '<text x="50" y="159" font-size="7" text-anchor="middle" fill="currentColor" opacity=".6">back view</text>';
  }
  return svg + "</svg>";
}

// Barbell drawing shown under the body illustration on the home and login pages.
const BAR = '<svg class="bb" viewBox="0 0 300 60" width="100%" height="60">' +
  '<rect x="20" y="28" width="260" height="5" rx="2" fill="#c9c8f5"/>' +
  '<g fill="#ff5a4e"><rect x="40" y="8" width="12" height="45" rx="4"/><rect x="248" y="8" width="12" height="45" rx="4"/></g>' +
  '<g fill="#ffb938"><rect x="56" y="14" width="10" height="33" rx="4"/><rect x="234" y="14" width="10" height="33" rx="4"/></g></svg>';


/* ---------------------------------------------------------
   2. SAVED DATA (localStorage keeps data inside this browser)
   --------------------------------------------------------- */

// Safe storage helpers. They use localStorage, and if the browser blocks it
// (private mode, strict settings) they fall back to memory, which lasts until the page is reloaded.
const MEM = {};          // the memory fallback
let canSave = true;      // becomes false if localStorage is blocked
function sget(k) { try { return localStorage.getItem(k); } catch (e) { canSave = false; return MEM[k] === undefined ? null : MEM[k]; } }
function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { canSave = false; MEM[k] = v; } }
function sdel(k) { try { localStorage.removeItem(k); } catch (e) { canSave = false; delete MEM[k]; } }

let U = null;   // the logged-in user {email, name}, or null when nobody is logged in
let S = null;   // the current user's data: {split, unit, log:[exercises], days:{date: volume}}

// A fresh, empty set of data.
const DEF = () => ({ split: "push", unit: "kg", log: [], days: {} });

// Load the data that belongs to the logged-in user (or start empty).
function load() {
  S = DEF();
  if (U) {
    try {
      const raw = sget("lw:d:" + U.email);   // each user has their own storage key
      if (raw) S = Object.assign(S, JSON.parse(raw));
    } catch (e) { /* storage blocked or broken: just keep the empty data */ }
  }
}

// Save the current user's data. Called after every change.
const save = () => {
  if (U) {
    try { sset("lw:d:" + U.email, JSON.stringify(S)); } catch (e) {}
  }
};


/* ---------------------------------------------------------
   3. SMALL HELPERS
   --------------------------------------------------------- */

const $  = s => document.querySelector(s);                  // find ONE element, e.g. $("#grid")
const $$ = s => [...document.querySelectorAll(s)];          // find ALL matching elements as an array

// Turn a Date into text like "2026-11-22". Used as the key for saved workout days.
const key = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

// Show a short message at the bottom of the screen for 2.4 seconds.
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("on");                                    // CSS slides it into view
  clearTimeout(toast.h);                                    // restart the timer if another toast arrives
  toast.h = setTimeout(() => t.classList.remove("on"), 2400);
}


/* ---------------------------------------------------------
   4. PAGE SWITCHING
   Each page is a <section class="view" id="v-NAME">. The address (#NAME) decides which one is visible.
   --------------------------------------------------------- */

const V = ["home", "workouts", "logger", "progress", "about", "login", "signup"];   // all page names

function route() {
  const h = location.hash.slice(1);                         // address without the "#"
  let v = V.includes(h) ? h : "home";                       // unknown address -> home

  // Gatekeeper: logged-out visitors can only see login / sign up; logged-in users skip them.
  try {
    if (!U && v !== "login" && v !== "signup") { v = "login"; history.replaceState(null, "", "#login"); }
    else if (U && (v === "login" || v === "signup")) { v = "home"; history.replaceState(null, "", "#home"); }
  } catch (e) {}

  V.forEach(n => { $("#v-" + n).hidden = n !== v; });       // show the chosen page, hide the rest

  // Highlight the menu link of the current page
  $$("[data-n]").forEach(a => {
    if (a.dataset.n === v) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  scrollTo(0, 0);                                           // start at the top of the new page
  document.title = "Liftwise – " + v[0].toUpperCase() + v.slice(1);   // browser tab title
}


/* ---------------------------------------------------------
   5. HOME AND WORKOUTS PAGES
   --------------------------------------------------------- */

// Draw the big body + barbell illustration on the home, login and sign-up pages.
["heroArt", "loginArt", "signupArt"].forEach(id => {
  $("#" + id).innerHTML = body("", "#ff5a4e", true, "#fff").replace("<svg", '<svg height="270" style="color:#fff"') + BAR;
});

// Build the four split cards on the home page.
$("#spc").innerHTML = Object.entries(SPL).map(([k, s]) =>
  '<button class="spc" style="--c:' + s.c + '" data-go="' + k + '">' +
    body(EX.find(e => e[1] === k)[3], s.c) +                // body drawing of the split's first muscle
    '<b>' + s.n + '</b><span>' + s.d + '</span></button>'
).join("");

// Build the split tabs, the muscle filter and the exercise cards.
function renderSplit() {
  // Tabs: aria-pressed="true" marks the selected split
  $("#tabs").innerHTML = Object.entries(SPL).map(([k, s]) =>
    '<button style="--c:' + s.c + '" data-s="' + k + '" aria-pressed="' + (k === S.split) + '">' + s.n + '</button>'
  ).join("");

  // Note about the chosen split: what it trains, who it suits and how long it takes
  const sp = SPL[S.split];
  $("#cap").style.setProperty("--c", sp.c);
  $("#cap").innerHTML = "<b>" + sp.d + "</b><span><i>Suits:</i> " + sp.w + "</span><span><i>Typical time:</i> " + sp.t + "</span>";

  // Muscle filter lists only the muscles of the chosen split
  const muscles = [...new Set(EX.filter(e => e[1] === S.split).map(e => e[3]))];
  const mf = $("#mf"), current = mf.value;
  mf.innerHTML = '<option value="">All muscles</option>' + muscles.map(m => "<option>" + m + "</option>").join("");
  mf.value = muscles.includes(current) ? current : "";      // keep the old choice if it still exists

  renderGrid();
}

// Build the exercise cards, using the search box and muscle filter.
function renderGrid() {
  const q = $("#q").value.toLowerCase();                    // search text
  const m = $("#mf").value;                                 // chosen muscle ("" = all)
  const c = SPL[S.split].c;                                 // split color
  const list = EX.filter(e => e[1] === S.split && (!m || e[3] === m) && e[2].toLowerCase().includes(q));

  if (!list.length) {                                       // nothing matches: friendly message
    $("#grid").innerHTML = '<p class="empty">No exercises match. Clear the search or choose All muscles.</p>';
    return;
  }
  $("#grid").innerHTML = list.map(e => card(e, c)).join("");
}

// Builds the HTML of ONE exercise card (e = exercise row, c = split color).
function card(e, c) {
  const f = INFO[e[0]];                                       // extra details for this exercise
  const added = S.log.some(x => x.id === e[0]);               // already in the session?
  const src = f.img || "images/" + e[0] + ".gif";             // photo/GIF to try first
  return '<article class="ex" style="--c:' + c + '">' +
    // Picture area: the muscle map is always there; a photo or GIF is laid on top when the file exists
    '<div class="ph">' + body(e[3], c) +
      '<img src="' + src + '" alt="' + e[2] + ' demonstration" loading="lazy" onerror="photoFallback(this,\'' + e[0] + '\')"></div>' +
    '<div class="in"><h3>' + e[2] + '</h3>' +
    // Difficulty and equipment chips
    '<div class="chips"><span class="chip lv-' + f.lv.toLowerCase() + '">' + f.lv + '</span><span class="chip">' + f.eq + '</span></div>' +
    // Quick facts: target muscle, other muscles, suggested starting range
    '<dl class="facts">' +
      '<div><dt>Target</dt><dd><span class="tag' + (S.split === "full" ? " full" : "") + '">' + e[3] + '</span></dd></div>' +
      '<div><dt>Also works</dt><dd>' + f.sec + '</dd></div>' +
      '<div><dt>Start with</dt><dd><b>' + f.sr + '</b></dd></div></dl>' +
    // Native <details>: opens and closes by itself, no JavaScript needed
    '<details><summary>How to do it</summary><ol>' + f.st.map(x => "<li>" + x + "</li>").join("") + '</ol>' +
      '<p class="cues-h">Form cues</p><ul class="cues">' + f.cu.map(x => "<li>" + x + "</li>").join("") + '</ul></details>' +
    '<button class="btn sm" data-add="' + e[0] + '">' + (added ? "Added" : "Add exercise") + '</button></div></article>';
}

// If images/ID.gif is missing, try images/ID.jpg; if that is missing too, remove the image so the muscle map shows.
function photoFallback(img, id) {
  if (!img.dataset.t) { img.dataset.t = 1; img.src = "images/" + id + ".jpg"; }
  else img.remove();
}


/* ---------------------------------------------------------
   6. LOG PAGE (logger)
   --------------------------------------------------------- */

const nm = id => EX.find(e => e[0] === id)[2];              // exercise id -> exercise name

// Redraw the session: one block per exercise, with column headings above the sets.
function renderLog() {
  // Session date shown at the top, for example "Mon, 23 Nov 2026"
  $("#sdate").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  if (!S.log.length) {
    $("#log").innerHTML = '<p class="empty">No exercises in this session yet. Add some from the Workouts page.</p>';
  } else {
    $("#log").innerHTML = S.log.map((x, i) =>
      '<div class="log"><div class="row"><div><small class="lab">Exercise</small><b>' + nm(x.id) + '</b></div>' +
      '<button class="x" data-rm="' + i + '" aria-label="Remove ' + nm(x.id) + '">×</button></div>' +
      '<div class="sets">' +
        // Column headings: Set | Reps | Weight | (delete button column)
        '<small>Set</small><small>Reps</small><small>Weight (' + S.unit + ')</small><span></span>' +
        x.sets.map((s, j) =>
          '<span>' + (j + 1) + '</span>' +
          // data-i = exercise number, data-j = set number, data-f = field (r = reps, w = weight)
          '<input type="number" min="0" inputmode="numeric" placeholder="Reps" aria-label="Reps, set ' + (j + 1) + '" value="' + s.r + '" data-i="' + i + '" data-j="' + j + '" data-f="r">' +
          '<input type="number" min="0" step="0.5" inputmode="decimal" placeholder="' + S.unit + '" aria-label="Weight in ' + S.unit + ', set ' + (j + 1) + '" value="' + s.w + '" data-i="' + i + '" data-j="' + j + '" data-f="w">' +
          '<button class="x" data-ds="' + i + ',' + j + '" aria-label="Delete set ' + (j + 1) + '">×</button>'
        ).join("") + '</div>' +
      '<button class="btn ghost sm" data-as="' + i + '">Add set</button></div>'
    ).join("");
  }
  // Mark the selected unit (kg or lbs) on the switch
  $$("[data-u]").forEach(b => b.setAttribute("aria-pressed", b.dataset.u === S.unit));
  vol();          // update the session summary numbers
  renderGrid();   // update the "Add exercise" / "Added" buttons
}

// Session summary: exercises, sets with reps entered, and total volume (reps x weight).
function vol() {
  const v = S.log.reduce((total, x) => total + x.sets.reduce((sum, s) => sum + (+s.r || 0) * (+s.w || 0), 0), 0);
  const sets = S.log.reduce((n, x) => n + x.sets.filter(s => +s.r > 0).length, 0);
  $("#sEx").textContent = S.log.length;
  $("#sSets").textContent = sets;
  $("#vol").textContent = Math.round(v).toLocaleString() + " " + S.unit;
  return v;
}


/* ---------------------------------------------------------
   7. PROGRESS PAGE
   --------------------------------------------------------- */

function week() {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));    // go back to this week's Monday
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const vols = [], keys = [];
  let done = 0;                                             // number of sessions this week

  for (let i = 0; i < 7; i++) {                             // loop over Monday ... Sunday
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const k = key(d);
    keys.push(k);
    const entry = S.days[k];                                // saved workout for that day (if any)
    vols.push(entry ? entry.v : 0);
    if (entry) done++;
  }
  const max = Math.max(1, ...vols);                         // tallest bar (at least 1 to avoid dividing by 0)

  // One box per day: green border if saved, bar height = volume compared with the tallest bar
  $("#wk").innerHTML = keys.map((k, i) =>
    '<div class="day' + (S.days[k] ? " done" : "") + (k === key(now) ? " now" : "") + '">' +
    '<b>' + names[i] + '</b><div class="vb"><i style="height:' + (vols[i] / max * 100) + '%"></i></div>' +
    '<small>' + (S.days[k] ? vols[i].toLocaleString() : "Rest") + '</small></div>'
  ).join("");

  // Goal: 4 sessions a week = 100%
  const pct = Math.min(100, Math.round(done / 4 * 100));
  $("#wkTxt").textContent = done + " of 4 sessions done";
  $("#wkPct").textContent = pct + "% consistency";
  $("#bar").style.width = pct + "%";
  $("#sWeek").textContent = done + "/4";
  $("#sAll").textContent = Object.keys(S.days).length;      // all saved sessions ever

  // "Last workout" summary: the most recent saved day (keys sort correctly because they are YYYY-MM-DD)
  const saved = Object.keys(S.days).sort();
  if (saved.length) {
    const lk = saved[saved.length - 1], le = S.days[lk];
    const [ly, lm, ld] = lk.split("-").map(Number);
    $("#lwDate").textContent = new Date(ly, lm - 1, ld).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    $("#lwVol").textContent = "Session volume: " + le.v.toLocaleString() + " " + le.u +
      (le.ex && le.ex.length ? " · Exercises: " + le.ex.map(x => nm(x.id)).join(", ") : "");
  } else {
    $("#lwDate").textContent = "No workouts saved yet";
    $("#lwVol").textContent = "Press Save workout on the Log page after a session.";
  }

  // Streak = how many days in a row (counting back from today, or yesterday if today is not saved yet)
  let streak = 0;
  const d = new Date();
  if (!S.days[key(d)]) d.setDate(d.getDate() - 1);
  while (S.days[key(d)]) { streak++; d.setDate(d.getDate() - 1); }
  $("#sStreak").textContent = streak;

  renderHistory();   // exercise summary and workout history below
}


// Build the "Exercise summary" table and the "Workout history" list from every saved session.
function renderHistory() {
  const keys = Object.keys(S.days).sort().reverse();        // newest session first

  if (!keys.length) {                                       // nothing saved yet
    $("#xsum").innerHTML = '<p class="empty">Your exercise summary will appear here after you save a workout.</p>';
    $("#hist").innerHTML = '<p class="empty">No saved workouts yet. Log a session, then press Save workout.</p>';
    return;
  }

  /* ----- Exercise summary: one row per exercise, added up over all sessions ----- */
  const tot = {};                                           // id -> {sessions, sets, reps, best, bestU, last}
  keys.slice().reverse().forEach(k => {                     // oldest first, so "last" ends up as the newest date
    const e = S.days[k];
    (e.ex || []).forEach(x => {
      const t = tot[x.id] = tot[x.id] || { sessions: 0, sets: 0, reps: 0, best: 0, bestU: "kg", bestKg: 0, last: k };
      t.sessions++;
      t.last = k;
      x.sets.forEach(s => {
        t.sets++;
        t.reps += s.r;
        const kg = e.u === "lbs" ? s.w / 2.2046 : s.w;      // compare weights in kg so kg and lbs sessions mix fairly
        if (kg > t.bestKg) { t.bestKg = kg; t.best = s.w; t.bestU = e.u; }
      });
    });
  });
  const ids = Object.keys(tot).sort((a, b) => tot[b].sessions - tot[a].sessions);   // most done first
  const fmt = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };
  $("#xsum").innerHTML = ids.length
    ? '<table class="ht"><thead><tr><th>Exercise</th><th>Muscle</th><th>Sessions</th><th>Total sets</th><th>Total reps</th><th>Best weight</th><th>Last done</th></tr></thead><tbody>' +
      ids.map(id => {
        const t = tot[id], row = EX.find(r => r[0] === id);
        return '<tr><td><b>' + row[2] + '</b></td><td>' + row[3] + '</td><td>' + t.sessions + '</td><td>' + t.sets + '</td><td>' + t.reps +
               '</td><td>' + (t.best ? t.best + " " + t.bestU : "Bodyweight") + '</td><td>' + fmt(t.last) + '</td></tr>';
      }).join("") + '</tbody></table>'
    : '<p class="empty">Older saved sessions have no exercise details. New sessions will appear here.</p>';

  /* ----- Workout history: one expandable block per session (native <details>) ----- */
  $("#hist").innerHTML = keys.map((k, i) => {
    const e = S.days[k], exs = e.ex || [];
    const [y, m, d] = k.split("-").map(Number);
    const date = new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const nsets = exs.reduce((n, x) => n + x.sets.length, 0);
    const inner = exs.length
      ? exs.map(x => {
          const row = EX.find(r => r[0] === x.id);
          const xv = x.sets.reduce((sum, s) => sum + s.r * s.w, 0);   // volume of this exercise
          return '<div class="hx"><div class="row"><b>' + row[2] + '</b><span class="tag">' + row[3] + '</span></div>' +
            '<table class="ht"><thead><tr><th>Set</th><th>Reps</th><th>Weight (' + e.u + ')</th><th>Volume</th></tr></thead><tbody>' +
            x.sets.map((s, j) => '<tr><td>' + (j + 1) + '</td><td>' + s.r + '</td><td>' + (s.w || "Bodyweight") + '</td><td>' + Math.round(s.r * s.w) + '</td></tr>').join("") +
            '</tbody></table><small>' + (xv ? 'Exercise volume: ' + Math.round(xv).toLocaleString() + ' ' + e.u : 'Bodyweight exercise (no added weight)') + '</small></div>';
        }).join("")
      : '<p class="empty">Exercise details were not recorded for this session.</p>';
    return '<details class="sess"' + (i === 0 ? " open" : "") + '><summary><b>' + date + '</b><span>' +
      exs.length + ' exercises · ' + nsets + ' sets · ' + e.v.toLocaleString() + ' ' + e.u + '</span></summary>' + inner + '</details>';
  }).join("");
}


/* ---------------------------------------------------------
   8. REST TIMER
   --------------------------------------------------------- */

// Timer state: total seconds, end time, seconds left, running?, interval id
const newTimer = () => ({ total: 0, end: 0, left: 0, run: false, id: 0 });
let T = newTimer();
const CIRC = 553;                                           // length of the ring (2 x 3.14 x 88)

// Update the number and the ring.
function draw() {
  const s = Math.ceil(T.left);
  $("#clock").textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  $("#ringp").style.strokeDashoffset = T.total ? CIRC * (1 - T.left / T.total) : 0;   // ring empties as time passes
}

// Runs 5 times a second while the timer is on.
function tick() {
  T.left = Math.max(0, (T.end - Date.now()) / 1000);        // seconds remaining
  draw();
  if (T.left <= 0) {                                        // finished
    clearInterval(T.id);
    T.run = false;
    $("#pp").textContent = "Pause";
    chime();
    toast("Rest over. Time for your next set.");
  }
}

// Start a countdown of s seconds.
function start(s) {
  clearInterval(T.id);
  T.total = s;
  T.end = Date.now() + s * 1000;
  T.run = true;
  $("#pp").textContent = "Pause";
  tick();
  T.id = setInterval(tick, 200);
}

// Play three short beeps with the Web Audio API (no sound file needed).
function chime() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach((t, i) => {                        // three beeps, 0.25 seconds apart
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = i == 2 ? 1046 : 784;              // last beep is higher
      o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.25, a.currentTime + t);        // start volume
      g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + .22);   // fade out
      o.start(a.currentTime + t); o.stop(a.currentTime + t + .24);
    });
  } catch (e) { /* audio not available: stay silent */ }
}


/* ---------------------------------------------------------
   9. EVENTS (what happens when the user clicks or types)
   One click listener for the whole page ("event delegation"): it finds which button was clicked
   by looking at its id or data-* attribute.
   --------------------------------------------------------- */

document.addEventListener("click", e => {
  const t = e.target.closest("button");                     // the button that was clicked (if any)
  if (!t) return;
  const d = t.dataset;                                      // its data-* attributes

  if (t.id === "nOut") {                                    // LOG OUT
    clearInterval(T.id); T = newTimer();
    try { sdel("lw:session"); } catch (e) {}
    U = null; load(); who();
    location.hash = "login"; route();
    toast("Logged out");
  }
  else if (d.go) {                                          // split card on home: open Workouts with that split
    S.split = d.go; save(); renderSplit(); location.hash = "workouts";
  }
  else if (d.s) {                                           // split tab on Workouts
    S.split = d.s; save(); renderSplit();
  }
  else if (d.add) {                                         // "Add to today"
    if (S.log.some(x => x.id === d.add)) { toast("Already in your session"); return; }
    S.log.push({ id: d.add, sets: [{ r: "", w: "" }] });    // new exercise with one empty set
    save(); renderLog(); toast("Added to your session");
  }
  else if (d.rm) {                                          // remove an exercise
    S.log.splice(+d.rm, 1); save(); renderLog();
  }
  else if (d.as) {                                          // "Add set"
    S.log[+d.as].sets.push({ r: "", w: "" }); save(); renderLog();
  }
  else if (d.ds) {                                          // delete one set
    const [i, j] = d.ds.split(",").map(Number);
    S.log[i].sets.splice(j, 1);
    if (!S.log[i].sets.length) S.log[i].sets.push({ r: "", w: "" });   // always keep one set
    save(); renderLog();
  }
  else if (d.u && d.u !== S.unit) {                         // switch kg <-> lbs and convert the numbers
    const f = d.u === "lbs" ? 2.2046 : 1 / 2.2046;
    S.log.forEach(x => x.sets.forEach(s => { if (s.w !== "") s.w = Math.round(s.w * f * 2) / 2; }));
    S.unit = d.u; save(); renderLog();
  }
  else if (d.t) {                                           // 60s / 90s / 120s timer buttons
    start(+d.t);
  }
  else if (t.id === "pp") {                                 // Pause / Resume
    if (!T.total || T.left <= 0) return;                    // nothing running yet
    if (T.run) { clearInterval(T.id); T.run = false; t.textContent = "Resume"; }
    else { T.end = Date.now() + T.left * 1000; T.run = true; t.textContent = "Pause"; T.id = setInterval(tick, 200); }
  }
  else if (t.id === "rs") {                                 // Reset the timer
    clearInterval(T.id); T = newTimer(); $("#pp").textContent = "Pause"; draw();
  }
  else if (t.id === "clear") {                              // Clear today's log
    S.log = []; save(); renderLog();
  }
  else if (t.id === "save") {                               // Save workout: counts today in the week
    if (!S.log.some(x => x.sets.some(s => +s.r > 0))) { toast("Add reps to at least one set first"); return; }
    // Keep a copy of what was done: each exercise with only the sets that have reps entered.
    const done = S.log
      .map(x => ({ id: x.id, sets: x.sets.filter(s => +s.r > 0).map(s => ({ r: +s.r, w: +s.w || 0 })) }))
      .filter(x => x.sets.length);
    // Saving again on the same day replaces that day's session.
    S.days[key(new Date())] = { v: Math.round(vol()), u: S.unit, ex: done };
    save(); week(); toast("Workout saved. Nice work!");
  }
  else if (t.id === "theme") {                              // Theme button: switch light/dark
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";         // CSS reacts to data-theme on <html>
  }
});

// Typing in a reps or weight box updates the saved data right away (no redraw, so the cursor stays).
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.f) {
    S.log[+t.dataset.i].sets[+t.dataset.j][t.dataset.f] = t.value;
    save(); vol();
  }
});

$("#q").addEventListener("input", renderGrid);              // typing in the search box
$("#mf").addEventListener("change", renderGrid);            // choosing a muscle

// Contact form: check the fields. There is no server, so nothing is really sent.
function doContact() {
  if (!$("#cn").value.trim()) return toast("Enter your name");
  if (!/^\S+@\S+\.\S+$/.test($("#ce").value)) return toast("Enter a valid email address");
  if (!$("#cm").value.trim()) return toast("Write a message");
  toast("Message checked. This demo has no server, so nothing was sent.");
  $("#cf").reset();
}

addEventListener("hashchange", route);                      // address changed (#home -> #logger ...): switch page


/* ---------------------------------------------------------
   10. LOGIN, SIGN UP, LOG OUT
   Accounts live in this browser only (a demo, not real security).
   --------------------------------------------------------- */

// All accounts: { "email": {name, salt, h(hashed password)} }
const users = () => { try { return JSON.parse(sget("lw:users") || "{}"); } catch (e) { return {}; } };
const setUsers = u => { try { sset("lw:users", JSON.stringify(u)); } catch (e) {} };

// Scramble a password with SHA-256 so the plain password is never stored.
async function hp(pw, salt) {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    return btoa(unescape(encodeURIComponent(salt + pw)));   // fallback if the browser has no crypto
  }
}

// Update the menu: hide page links when logged out, show greeting and Log out when logged in.
function who() {
  $$("[data-n]").forEach(a => { a.hidden = !U; });
  $("#nLogin").hidden = $("#nSign").hidden = !!U;
  $("#nOut").hidden = !U;
  $("#who").textContent = U ? "Hi, " + U.name.split(" ")[0] : "";
}

// Log a user in: remember them, load their data, go home.
function enter(email, name) {
  U = { email: email, name: name };
  try { sset("lw:session", email); } catch (e) {}   // stay logged in after reload
  load(); renderSplit(); renderLog(); week(); draw(); who();
  location.hash = "home"; route();
}

// SIGN UP form
// Sign up. This runs from a button click (not a form "submit"), because some preview windows block form submission.
async function doSignup() {
  const n = $("#sn").value.trim(), em = $("#se").value.trim().toLowerCase(), p = $("#sp").value, c = $("#sc").value;
  // First problem found wins; empty text means everything is fine
  const bad = !n ? "Enter your name."
    : !/^\S+@\S+\.\S+$/.test(em) ? "Enter a valid email address."
    : p.length < 6 ? "Use a password with at least 6 characters."
    : p !== c ? "The passwords don’t match."
    : users()[em] ? "An account with this email already exists. Log in instead."
    : "";
  $("#serr").textContent = bad;
  if (bad) return;

  let salt;                                                 // random extra text mixed into the password
  try { salt = crypto.getRandomValues(new Uint8Array(8)).join(""); } catch (x) { salt = String(Date.now()); }
  const all = users();
  all[em] = { name: n, salt: salt, h: await hp(p, salt) };  // save the account
  setUsers(all);
  $("#sf").reset();
  enter(em, n);
  toast("Account created. Welcome, " + n.split(" ")[0] + "!");
}

// LOG IN form
async function doLogin() {
  const em = $("#le").value.trim().toLowerCase(), p = $("#lp").value, u = users()[em];
  if (!em || !p) { $("#lerr").textContent = "Enter your email and password."; return; }
  if (!u || u.h !== await hp(p, u.salt)) { $("#lerr").textContent = "Email or password is incorrect."; return; }
  $("#lerr").textContent = "";
  $("#lf").reset();
  enter(em, u.name);
  toast("Logged in. Welcome back!");
}

// Connect the three buttons, and let the Enter key do the same inside the text fields.
$("#sBtn").addEventListener("click", doSignup);
$("#lBtn").addEventListener("click", doLogin);
$("#cBtn").addEventListener("click", doContact);
[["sf", doSignup], ["lf", doLogin], ["cf", doContact]].forEach(([id, fn]) => {
  $("#" + id).addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); fn(); }   // Enter in a text field = press the button
  });
});

// "Show password" checkboxes: data-for lists the ids of the password fields to reveal.
document.addEventListener("change", e => {
  const t = e.target;
  if (t.classList.contains("showpw")) {
    t.dataset.for.split(",").forEach(id => { $("#" + id).type = t.checked ? "text" : "password"; });
  }
});


/* ---------------------------------------------------------
   11. START-UP (runs once when the page opens)
   --------------------------------------------------------- */

{
  let email = null;
  try { email = sget("lw:session"); } catch (e) {}   // was someone logged in last time?
  const user = email && users()[email];
  if (user) U = { email: email, name: user.name };          // yes: log them in again

  load();          // load that user's data (or empty data)
  renderSplit();   // draw tabs + exercise cards
  renderLog();     // draw today's log
  week();          // draw the progress page
  draw();          // draw the timer
  who();           // set up the menu
  route();         // show the right page

  $("#loadmsg").hidden = true;                                  // everything started: hide the red message bar
  $$(".storewarn").forEach(p => { p.hidden = canSave; });       // warn if the browser blocks saving
}
