(() => {
  // web-src/payment-model.mjs
  function checkoutDetails(commerce = {}, user = null, enteredEmail) {
    const email = String(enteredEmail !== void 0 ? enteredEmail : commerce.email || (user == null ? void 0 : user.email) || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      const error = new Error("Enter an email address for your test receipt before continuing.");
      error.code = "invalid_email";
      throw error;
    }
    return { email, plan: commerce.planIndex };
  }
  function checkoutAttempt(commerce, email, makeId) {
    return commerce.stripeAttempt && commerce.stripeAttemptPlan === commerce.planIndex && commerce.stripeAttemptEmail === email ? commerce.stripeAttempt : makeId();
  }

  // web-src/shared/quiz.js
  var questions = [
    ["What would you like to change?", ["Wake less often", "Return to sleep more easily", "Feel less pressure around sleep", "Understand my pattern"]],
    ["How long has this been happening?", ["Less than a month", "1\u20133 months", "More than 3 months", "Not sure"]],
    ["How many nights a week feel difficult?", ["0 nights", "1\u20132 nights", "3\u20134 nights", "5+ nights", "Not sure"]],
    ["When do you tend to wake?", ["Soon after falling asleep", "In the middle of the night", "Closer to morning", "It varies"]],
    ["How many awakenings do you remember?", ["None", "One", "Two", "Three or more", "Not sure"]],
    ["How long do you feel awake?", ["Under 15 minutes", "15\u201330 minutes", "30\u201360 minutes", "More than an hour", "Not sure"]],
    ["What first catches your attention when you wake?", ["Racing thoughts", "Worry about sleep", "Light, noise or comfort", "Physical discomfort", "Nothing \u2014 I am just wide awake", "Not sure"]],
    ["Is your mind busy before bed?", ["Rarely", "Sometimes", "Often", "Almost always"]],
    ["What do you usually do after waking?", ["Check the time", "Use my phone or work", "Rest quietly", "Choose a quiet activity", "It varies"]],
    ["How much does your wake-up time vary?", ["Very little", "Up to an hour", "More than an hour", "My schedule changes", "Not sure"]],
    ["What does your last hour before bed look like?", ["Work or planning", "Screens and entertainment", "A quiet ritual", "It varies"]],
    ["Which evening factor would you like to notice?", ["Caffeine", "Alcohol", "Late work", "Daytime naps", "None / prefer not to say"]],
    ["How much does sleep affect the next day?", ["Very little", "A little", "Noticeably", "A lot", "Prefer not to say"]],
    ["What might make your room more comfortable?", ["Light", "Sound", "Temperature", "Bedding", "Nothing obvious / not sure"]],
    ["Do you wear a sleep tracker?", ["Apple Watch", "Galaxy Watch or Pixel Watch", "Fitbit", "Oura ring", "Garmin", "Another tracker", "No tracker"]],
    ["What would feel easiest to start with?", ["A short explanation", "A practical exercise", "A morning diary", "A night-time protocol"]],
    ["How stressful have your days felt recently?", ["Not especially stressful", "A little stressful", "Very stressful", "Extremely stressful", "Prefer not to say"]],
    ["Do heat or sweating disturb your nights?", ["No", "Sometimes", "Often", "Not sure / prefer not to say"]],
    ["When do you usually have your last caffeinated drink?", ["Before 2 p.m.", "After 2 p.m.", "I do not have caffeine", "It varies / not sure"]],
    ["How often do you have alcohol in the evening?", ["Never or rarely", "Some evenings", "Most evenings", "Prefer not to say"]],
    ["How often do bathroom trips interrupt your night?", ["None", "Once", "Twice", "Three or more", "Not sure"]]
  ];

  // web-src/shared/sleep.js
  function localDay(date = /* @__PURE__ */ new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  // web-src/shared/mvp-model.js
  var FACTORS = [
    { id: "stress", name: "Early-waking stress pattern", day: 13, practice: "Choose a familiar response", action: "Let your shoulders settle if comfortable. Keep the light low and the clock out of sight. You do not have to solve the night." },
    { id: "mind", name: "Racing mind", day: 8, practice: "Close the tabs in your mind", action: "Give one thought a place on paper. Then notice your jaw, shoulders and hands, using a little less effort if comfortable." },
    { id: "comfort", name: "Night-time heat or discomfort", day: 18, practice: "Make your space more comfortable", action: "Try one small comfort adjustment: change your bedding or turn your pillow. Choose what feels comfortable for you." },
    { id: "timing", name: "Evening drink timing", day: 17, practice: "Notice your caffeine pattern", action: "Let this be a moment of rest, without trying to force sleep. Keep screens away. Tomorrow you can review your evening drinks." },
    { id: "bathroom", name: "Night bathroom trips", day: 13, practice: "Make a gentle return plan", action: "Use enough light to move safely. Return at your own pace and put the phone aside. When comfortable, let your body settle." }
  ];
  var has = (v, i) => Array.isArray(v) ? v.includes(i) : v === i;
  function personalProfile(answers = []) {
    var _a;
    const points = FACTORS.map(() => 0), evidence = FACTORS.map(() => []);
    const add = (id, q, n = 1) => {
      const i = FACTORS.findIndex((f) => f.id === id);
      points[i] += n;
      if (!evidence[i].includes(q)) evidence[i].push(q);
    };
    if (answers[3] === 1) add("stress", 3);
    if (has(answers[6], 4)) add("stress", 6);
    if ([2, 3].includes(answers[16])) add("stress", 16, 2);
    if ([2, 3].includes(answers[5])) add("mind", 5);
    if (has(answers[6], 0)) add("mind", 6, 2);
    if ([2, 3].includes(answers[7])) add("mind", 7);
    if (answers[10] === 0) add("mind", 10);
    if ([1, 2].includes(answers[17])) add("comfort", 17, 2);
    if (answers[13] === 2) add("comfort", 13);
    if (has(answers[6], 3)) add("comfort", 6);
    if (answers[18] === 1) add("timing", 18, 2);
    if ([1, 2].includes(answers[19])) add("timing", 19, 2);
    if ([1, 2, 3].includes(answers[20])) add("bathroom", 20, 2);
    const factors = FACTORS.map((f, i) => ({ ...f, points: points[i], evidence: evidence[i], strength: evidence[i].length >= 2 ? "More signals" : "Worth noticing" })).filter((f) => f.points > 0).sort((a, b) => b.points - a.points);
    const primary = factors[0] || null;
    return { rulesVersion: 2, name: (primary == null ? void 0 : primary.name) || "Your pattern is still unfolding", day: (primary == null ? void 0 : primary.day) || 2, factors: factors.slice(0, 3), evidence: (primary == null ? void 0 : primary.evidence) || [], secondary: ((_a = factors[1]) == null ? void 0 : _a.name) || null, answers: structuredClone(answers), baseline: baselineFor(answers), completedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  function baselineFor(a = []) {
    const frequency = ["0", "1\u20132", "3\u20134", "5+", "Not sure"][a[2]] || "Not sure";
    return { frequency, nights: [0, 2, 4, 6, null][a[2]] ?? null, unit: "difficult nights per week", remembered: [0, 1, 2, 3, null][a[4]] ?? null, duration: ["Under 15 min", "15\u201330 min", "30\u201360 min", "Over 60 min", "Not sure"][a[5]] || "Not sure", source: "quiz estimate" };
  }
  function nightEnding(date = /* @__PURE__ */ new Date()) {
    const d = new Date(date);
    if (d.getHours() >= 18) d.setDate(d.getDate() + 1);
    return localDay(d);
  }
  function startWake(previous = {}, now = /* @__PURE__ */ new Date(), forceNew = false) {
    const events = (previous.wakeEvents || []).map((e) => ({ ...e })), active = events.find((e) => !e.endedAt);
    if (active && !forceNew) return { ...previous, wakeEvents: events, activeId: active.id, reused: true };
    if (active) active.endedAt = now.toISOString();
    const id = "wake-" + now.getTime() + "-" + Math.random().toString(36).slice(2, 8);
    events.push({ id, startedAt: now.toISOString(), endedAt: null, parkedThought: "" });
    return { ...previous, day: previous.day || nightEnding(now), source: previous.source || "manual", ...!previous.checkinComplete ? { awakenings: events.length, awakeningLowerBound: true } : {}, wakeEvents: events.slice(-30), activeId: id, reused: false };
  }
  function checkinData(previous, answers) {
    const count = [0, 1, 2, 3][answers.wakes];
    if (!Number.isInteger(count)) throw Error("Choose how often you woke.");
    if (count > 0 && !Number.isInteger(answers.duration)) throw Error("Choose your best estimate of time awake.");
    if (!Number.isInteger(answers.rested) || answers.rested < 1 || answers.rested > 5) throw Error("Choose how rested you feel.");
    const durations = [5, 15, 30, 50];
    return { ...previous, awakenings: count, awakeningLowerBound: count === 3, awakeMinutes: count === 0 ? 0 : durations[answers.duration], awakeRange: count === 0 ? "No remembered waking" : ["Under 10 min", "10\u201320 min", "20\u201340 min", "Over 40 min"][answers.duration], rested: String(answers.rested) + "/5", restedRating: answers.rested, checkinComplete: true, source: "manual", updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  var PLANS = [{ months: 1, today: 16.99, renewal: 29.99 }, { months: 3, today: 27.99, renewal: 49.99 }, { months: 6, today: 39.99, renewal: 69.99 }];
  function addMonths(date, months) {
    const d = new Date(date), day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return d.toISOString();
  }
  function demoSubscription(planIndex, now = /* @__PURE__ */ new Date()) {
    const p = PLANS[planIndex];
    if (!p) throw Error("Choose a plan.");
    return { demo: true, status: "active", planIndex, ...p, startedAt: now.toISOString(), periodEnd: addMonths(now, p.months), cancelAtEnd: false, pausedUntil: null };
  }
  function cancelDemo(subscription) {
    if (!(subscription == null ? void 0 : subscription.demo)) throw Error("Only demonstration subscriptions are supported in this pilot.");
    return { ...subscription, status: "cancelled", cancelAtEnd: true, pausedUntil: null };
  }
  function pauseDemo(subscription, now = /* @__PURE__ */ new Date()) {
    if (!(subscription == null ? void 0 : subscription.demo) || subscription.status !== "active") throw Error("An active demonstration plan is required.");
    return { ...subscription, status: "paused", pausedUntil: addMonths(now, 1) };
  }
  function comparableWeeks(rows, now = /* @__PURE__ */ new Date()) {
    const today = localDay(now), d = new Date(now);
    d.setDate(d.getDate() - 6);
    const start = localDay(d);
    d.setDate(d.getDate() - 7);
    const prev = localDay(d);
    let result = { current: [], previous: [] };
    for (const r of rows.filter((r2) => Number.isFinite(r2.awakenings) && r2.day <= today)) {
      if (r.day >= start) result.current.push(r);
      else if (r.day >= prev) result.previous.push(r);
    }
    return result;
  }

  // web-src/shared/mvp.js
  var Tools = { setNightMode: async () => {
  }, configureReminders: async () => ({ enabled: false }) };
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var btn = (text, action, cls = "", extra = "") => `<button class="button ${cls}" data-action="${action}" ${extra}>${text}</button>`;
  var link = (text, route, cls = "") => `<a class="button ${cls}" href="#${route}">${text}</a>`;
  function createMvp({ store, record, records, setRecord, persist, startLocal, native, setRoute, render, toast, currentRows }) {
    let quizBusy = false, quizTimer, check = null, onboardStep = 0, planIndex = 1, termsChecked = false, checkoutBusy = false, wakeBusy = false, breathTimer = null, breathStart = 0, breathElapsed = 0, breathPaused = false, lastNightMode = false;
    const assessment = () => {
      var _a;
      return ((_a = record("assessment")) == null ? void 0 : _a.rulesVersion) === 2 ? record("assessment") : personalProfile(store.state.quiz.answers);
    };
    const prefs = () => record("preferences") || { weekdays: [0, 1, 2, 3, 4, 5, 6], windDown: "21:30", morning: "07:00", reminders: false };
    const commerce = () => record("commerce") || {};
    const profileName = () => {
      var _a, _b, _c;
      return ((_a = record("profile")) == null ? void 0 : _a.name) || ((_c = (_b = store.user) == null ? void 0 : _b.user_metadata) == null ? void 0 : _c.display_name) || "Your";
    };
    const event = async (name, properties = {}) => {
      store.state.funnel = [...store.state.funnel || [], { name, at: (/* @__PURE__ */ new Date()).toISOString(), ...properties }].slice(-120);
      await persist();
    };
    const queryAnswer = (a, i) => {
      var _a;
      const v = a[i];
      return Array.isArray(v) ? v.map((n) => {
        var _a2;
        return (_a2 = questions[i]) == null ? void 0 : _a2[1][n];
      }).filter(Boolean).join(", ") : ((_a = questions[i]) == null ? void 0 : _a[1][v]) || "";
    };
    function reasonText(a, i) {
      const value = queryAnswer(a, i);
      return ({ 3: "You tend to wake: ", 5: "Time you remember lying awake: ", 6: "When you wake, you notice: ", 7: "A busy mind before bed: ", 10: "Your evening usually ends with: ", 13: "Your sleep environment: ", 16: "Your recent stress level: ", 17: "Heat or sweating at night: ", 18: "Your last caffeinated drink: ", 19: "Alcohol in the evening: ", 20: "Night bathroom trips: " }[i] || "Your answer: ") + value.toLowerCase() + ".";
    }
    function factorCards(p) {
      const total = p.factors.reduce((n, f) => n + f.points, 0);
      return p.factors.length ? p.factors.map((f, i) => {
        const percentage = Math.min(89, Math.round(f.points / total * 100));
        return `<article class="factor-row ${i === 0 ? "primary" : ""}"><div class="row"><strong>${esc(f.name)}</strong><small>${percentage}% match</small></div><div class="factor-line"><i style="width:${percentage}%"></i></div></article>`;
      }).join("") + '<p class="small">Share of signals among the factors shown, capped at 89%. These are quiz scores, not probabilities of a cause.</p>' : '<div class="connection">There is not enough information to highlight one factor yet. A short morning diary is a useful place to begin.</div>';
    }
    function welcome() {
      var _a, _b;
      if (store.user && !((_a = record("profile")) == null ? void 0 : _a.adult)) return `<section class="mvp-welcome"><span class="eyebrow">YOUR PRIVATE SLEEP SPACE</span><h1>Make this<br>space yours.</h1><p>SleepThrough offers self-guided wellness learning for adults.</p><form id="local-form"><label>Your first name<input name="name" maxlength="80" autocomplete="given-name" required value="${esc(((_b = store.user.user_metadata) == null ? void 0 : _b.display_name) || "")}"></label><label class="check"><input type="checkbox" required><span>I am 18+ and have read the <a href="#privacy">privacy information</a>.</span></label><button class="button" type="submit">Open my sleep space \u2192</button></form></section>`;
      return `<section class="welcome mvp-welcome"><span class="eyebrow">DESIGNED FOR LIFE AFTER 40</span><h1>Awake at 3 a.m.<br>again?</h1><p>Understand what may be waking you. Build your personal 28-night plan, one small practice at a time.</p><img class="mvp-hero-art" src="assets/quiz-room.svg" alt="A calm bedroom under a crescent moon">${btn("Find my 3am pattern \u2192", "mvp-start-quiz")}<p class="small center">See your result before choosing a plan.</p>${btn("Explore as Sarah, 52", "mvp-demo", "outline")}${link("My sleep \xB7 Sign in", "login", "soft")}<p class="small center">Wellness learning for adults. Not a medical diagnosis.</p><div class="legal-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></section>`;
    }
    function quiz() {
      const q = store.state.quiz, step = Math.min(questions.length - 1, q.step);
      if (step === 3 && !q.factSeen) return `<section class="mvp-quiz"><span class="eyebrow">YOU\u2019RE NOT ALONE</span><img src="assets/quiz-calendar.svg" alt="" class="quiz-art"><h1>More than 1 in 5.</h1><p>22.3% of U.S. adults aged 50\u201364 reported trouble staying asleep most days or every day.</p><p class="small">Source: CDC / NCHS Data Brief 559, April 2026. NHIS data from 2024.</p>${btn("Continue \u2192", "mvp-fact")}</section>`;
      const scenes = ["room", "calendar", "calendar", "clock", "clock", "clock", "thoughts", "thoughts", "room", "rhythm", "room", "energy", "energy", "room", "rhythm", "rhythm", "thoughts", "room", "energy", "energy", "room"];
      return `<section class="mvp-quiz"><div class="row"><span class="eyebrow">YOUR SLEEP PATTERN</span><small>${step + 1} / ${questions.length}</small></div><div class="progress"><i style="width:${step / questions.length * 100}%"></i></div><img class="quiz-art" src="assets/quiz-${scenes[step]}.svg" alt=""><h1 tabindex="-1">${questions[step][0]}</h1><p>${step === 14 ? "Samsung Health can connect through Health Connect after setup. Other tracker connections are not available in this pilot." : "Tap the closest answer. Your best estimate is enough."}</p><div class="mvp-options ${questions[step][1].length <= 4 ? "tiles" : ""}">${questions[step][1].map((text, i) => `<button class="quiz-choice ${q.answers[step] === i ? "selected" : ""}" data-mvp-answer="${i}" aria-pressed="${q.answers[step] === i}" ${quizBusy ? "disabled" : ""}>${[2, 4].includes(step) ? `<span class="option-dots" aria-hidden="true">${"\u25CF".repeat(Math.min(i + 1, 4))}</span>` : ""}${esc(text)}<span aria-hidden="true">${q.answers[step] === i ? "\u2713" : "\u25CB"}</span></button>`).join("")}</div><div class="quiz-footer">${btn("\u2190 Back", "mvp-quiz-back", "soft", step === 0 ? "disabled" : "")}${btn("Skip", "mvp-quiz-skip", "soft", quizBusy ? "disabled" : "")}</div><p class="small center" role="status">${quizBusy ? "Answer saved. Moving on\u2026" : "One tap takes you to the next question."}</p></section>`;
    }
    function result() {
      var _a;
      const p = assessment(), evidence = (p.evidence || []).slice(0, 3);
      return `<section class="mvp-result"><span class="eyebrow amber-label">YOUR 3 A.M. PROFILE</span><h1>Your 3 a.m. profile</h1><p>${p.factors.length ? "Your strongest quiz match: " + esc(p.name.toLowerCase()) + "." : "Your answers do not point clearly to one factor."}</p><div class="card">${factorCards(p)}${evidence.length ? `<div class="why"><h3>Why we think so:</h3>${evidence.map((i) => `<p><span>\u2713</span> ${esc(reasonText(p.answers, i))}</p>`).join("")}</div>` : ""}<div class="baseline"><small>YOUR STARTING POINT \xB7 QUIZ ESTIMATE</small><strong>${esc(p.baseline.frequency)} difficult nights / week</strong><p>This is your estimate, separate from your recorded nights.</p>${bGoal(p)}</div><h3>${esc(((_a = record("goal")) == null ? void 0 : _a.text) || "A more manageable night")}</h3><details><summary>Change my goal</summary><div class="goal-options">${["Fewer remembered awakenings", "Return to sleep more easily", "Less pressure around sleep", "Understand my pattern"].map((v, i) => {
        var _a2;
        return `<button data-mvp-goal="${i}" aria-pressed="${(((_a2 = record("goal")) == null ? void 0 : _a2.index) || 0) === i}">${v}</button>`;
      }).join("")}</div></details>${btn("Explore my 28-day plan \u2192", "mvp-lead")}<p class="small center">Based on your answers. Not a diagnosis.</p></div>${btn("Review my answers", "mvp-retake", "soft")}</section>`;
    }
    function bGoal(p) {
      var _a;
      return p.baseline.nights == null ? "" : `<p><strong>Now: ${p.baseline.nights} difficult nights / week.</strong></p><p>Your goal for night 28: ${((_a = record("goal")) == null ? void 0 : _a.target) ?? Math.min(2, p.baseline.nights)} or fewer.</p><small>A personal aim, not a predicted result.</small><details><summary>Adjust my target</summary><div class="goal-options">${[0, 1, 2, 3, 4, 5, 6, 7].map((n) => `<button data-mvp-target="${n}">${n} or fewer nights / week</button>`).join("")}</div></details>`;
    }
    function lead() {
      var _a, _b;
      return `<section class="mvp-lead">${head("YOUR PERSONAL PLAN", "Where should we<br>send your plan?")}<p>Your email will be used to create your account if you choose to register.</p><form id="mvp-lead-form"><label>Your first name<input name="name" autocomplete="given-name" required maxlength="80" value="${esc(((_a = record("profile")) == null ? void 0 : _a.name) || "")}"></label><label>Email address<input type="email" name="email" autocomplete="email" required value="${esc(commerce().email || ((_b = store.user) == null ? void 0 : _b.email) || "")}"></label><label class="check"><input name="adult" type="checkbox" required><span>I am 18+ and have read the <a href="#privacy">privacy information</a>.</span></label><p class="small">Pilot demo: no email is sent from this screen. Your details stay on this ${native ? "phone" : "browser"} until you choose account sync.</p><button class="button" type="submit">Continue \u2192</button></form>${link("\u2190 My profile", "result", "soft")}</section>`;
    }
    function head(tag, title) {
      return `<span class="eyebrow">${tag}</span><h1>${title}</h1>`;
    }
    function plans() {
      var _a;
      const c = commerce(), p = PLANS[planIndex];
      return `<section class="mvp-plans"><span class="demo-badge">DEMONSTRATION \xB7 NO REAL CHARGE</span>${head("28 NIGHTS, ONE SMALL STEP AT A TIME", `${esc(c.name || profileName())}, your plan<br>is ready.`)}<p>${esc(((_a = record("goal")) == null ? void 0 : _a.text) || "Your goal: more manageable nights.")}</p><div class="plan-list">${PLANS.map((p2, i) => `<button class="plan-card ${i === planIndex ? "selected" : ""}" data-mvp-plan="${i}" aria-pressed="${i === planIndex}"><span class="row"><strong>${p2.months}-month plan</strong>${i === 1 ? '<small class="popular">Most popular</small>' : ""}</span><span class="plan-price">$${p2.today.toFixed(2)} <small>today</small></span><span class="renewal">Then $${p2.renewal.toFixed(2)} every ${p2.months === 1 ? "month" : p2.months + " months"}</span></button>`).join("")}</div><label class="check plan-consent"><input id="mvp-terms-check" type="checkbox" ${termsChecked ? "checked" : ""}><span>I agree to the <a href="#terms">pilot Terms</a> and this demonstration subscription: $${p.today.toFixed(2)} today, then $${p.renewal.toFixed(2)} every ${p.months === 1 ? "month" : p.months + " months"} until I cancel. No payment is taken in this demo.</span></label><p id="consent-error" class="error" role="alert"></p>${btn("Continue to test checkout \u2192", "mvp-checkout")}<p class="small center">Built on CBT-I-inspired sleep skills.<br>Cancel or pause the demo plan in Settings.</p><p class="small center">Paid-plan policy preview: 30-day money-back guarantee.<br>This pilot charges $0.</p>${link("\u2190 My profile", "result", "soft")}</section>`;
    }
    function checkout() {
      const p = PLANS[planIndex];
      return `<section class="mvp-checkout"><span class="demo-badge">TEST MODE \xB7 NO REAL CHARGE</span>${head("TRY THE COMPLETE FLOW", "Your next chapter,<br>ready to begin.")}<div class="card"><h2>${p.months}-month plan</h2><div class="plan-price">$${p.today.toFixed(2)}</div><p>Displayed price only. This checkout does not collect payment details or charge a card.</p><div class="demo-card" aria-hidden="true"><span>SleepThrough \xB7 DEMO</span><strong>\u2022\u2022\u2022\u2022 &nbsp; \u2022\u2022\u2022\u2022 &nbsp; \u2022\u2022\u2022\u2022 &nbsp; 4242</strong><small>No card information is stored.</small></div>${btn(checkoutBusy ? "Creating demo plan\u2026" : "Complete demo checkout \u2713", "mvp-checkout-success", "", checkoutBusy ? "disabled" : "")}${btn("Simulate a declined payment", "mvp-checkout-fail", "outline", checkoutBusy ? "disabled" : "")}</div>${link("\u2190 Change my plan", "plans", "soft")}</section>`;
    }
    function onboarding() {
      var _a;
      onboardStep = ((_a = record("onboarding")) == null ? void 0 : _a.step) ?? onboardStep;
      const p = assessment(), settings = prefs();
      const screens = [
        `<span class="eyebrow">YOUR PLAN IS READY</span><h1>Welcome, ${esc(profileName())}.</h1><p>Four weeks. Small practical skills. A clearer way to understand your nights.</p><div class="onboard-chips"><span>${esc(p.baseline.frequency)} difficult nights / week</span><span>${esc(p.baseline.duration)}</span><span>${esc(p.name)}</span></div><div class="card"><h3>Three things for tonight</h3><p>1. Make space for a short evening practice.</p><p>2. Try one small adjustment for your pattern.</p><p>3. Use \u201CI'm awake\u201D if you need support.</p></div>`,
        `<span class="eyebrow">TRY A TOOL BEFORE YOU NEED IT</span><h1>A little less effort.</h1><p>Try this at your own pace. Breathe naturally, or follow the gentle rhythm if comfortable.</p>${breathingMarkup(120)}<p class="small">You can pause, stop or move on at any time.</p>`,
        `<span class="eyebrow">MAKE IT FIT YOUR LIFE</span><h1>Your plan.<br>Your rhythm.</h1><p>Choose the days you want to practise. There are no lost streaks.</p><div class="weekday-picks">${["S", "M", "T", "W", "T", "F", "S"].map((label, i) => `<button data-mvp-weekday="${i}" aria-label="${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]}" aria-pressed="${settings.weekdays.includes(i)}">${label}</button>`).join("")}</div><form id="mvp-routine-form"><label>Evening practice reminder<input type="time" name="windDown" value="${esc(settings.windDown)}" required></label><label>Morning check-in reminder<input type="time" name="morning" value="${esc(settings.morning)}" required></label><p class="small">Quiet hours: 10 p.m.\u20136 a.m. No automatic sleep restriction or prescribed bedtime.</p><button type="submit" class="button">Save my rhythm \u2192</button></form>`,
        `<span class="eyebrow">A GENTLE NUDGE</span><h1>Reminders,<br>on your terms.</h1><div class="card"><h3>Evening practice \xB7 ${esc(settings.windDown)}</h3><h3>Morning check-in \xB7 ${esc(settings.morning)}</h3><p>Local reminders stay silent during quiet hours. Android may deliver them later to save battery.</p>${btn(settings.reminders ? "Reminders enabled \u2713" : "Enable local reminders", "mvp-reminders", "outline", !native ? "disabled" : "")}<p class="small">${native ? "Android will ask before notifications are enabled." : "Notification permissions are available in the Android APK."}</p></div>`,
        `<span class="eyebrow">YOUR NEXT SMALL STEP</span><h1>Night 1 of 28<br>starts tonight.</h1><p>Your plan is saved on this ${native ? "phone" : "browser"}. A free account can sync your diary and lesson progress.</p>${btn("Start my first night \u2192", "mvp-onboarding-finish")}${link("Create an account", "signup", "outline")}<p class="small">${native ? "Samsung Health can connect through Health Connect in Settings. Apple Health and other tracker connections are not available in this Android pilot." : "Samsung Health connects through Health Connect in the Android app. This website does not read health data from your device."}</p>`
      ];
      return `<section class="onboarding"><div class="onboard-progress">${screens.map((_, i) => `<i class="${i <= onboardStep ? "done" : ""}"></i>`).join("")}</div>${screens[onboardStep]}${![2, 4].includes(onboardStep) ? btn(onboardStep === 1 ? "Keep this tool and continue \u2192" : "Continue \u2192", "mvp-onboarding-next") : ""}${onboardStep ? btn("\u2190 Back", "mvp-onboarding-back", "soft") : ""}</section>`;
    }
    function currentWake() {
      var _a;
      const day = store.state.currentNightDay || nightEnding(), n = record("night:" + day) || { day, source: "manual" }, active = (_a = n.wakeEvents) == null ? void 0 : _a.find((e) => e.id === n.activeId && !e.endedAt);
      return { day, n, active };
    }
    function breathingMarkup(duration = 180) {
      return `<div class="breathing-area" data-breath-duration="${duration}"><div id="breath-circle" class="breath-circle"><span id="breath-label">Breathe gently</span></div><p id="breath-status" class="small center">In for 4, out for 6 \xB7 optional</p>${btn("Pause breathing", "mvp-breath-pause", "outline")}<p class="small center">Stop if uncomfortable. Natural breathing is always OK.</p></div>`;
    }
    function night() {
      const { n, active } = currentWake(), step = (active == null ? void 0 : active.step) || 0, p = assessment(), factor = FACTORS.find((f) => {
        var _a, _b;
        return f.id === ((_b = (_a = p.factors) == null ? void 0 : _a[0]) == null ? void 0 : _b.id);
      }) || FACTORS[0];
      if (!active) return `<section class="protocol"><span class="eyebrow">NIGHT-TIME SUPPORT</span><div class="protocol-moon">\u263E</div><h1>You\u2019re awake.<br>That\u2019s OK.</h1><p>One quiet next step. No clock watching.</p>${btn("Start night support", "mvp-awake-open", "amber")}${link("Back to my space", "today", "outline")}</section>`;
      const panels = [`<div class="protocol-moon">\u263E</div><h1>You\u2019re awake.<br>That\u2019s OK.</h1><p>You do not need to solve the night. ${native ? "We\u2019ve hidden the app\u2019s clock and Android status bar." : "We\u2019ve hidden the app\u2019s clock. Put your phone aside whenever you\u2019re ready."}</p>`, `<span class="eyebrow">A SMALL STEP FOR YOU</span><h1>${esc(factor.name)}</h1><p>${esc(factor.action)}</p><small>Suggested from your answers. Not a diagnosis.</small>`, `<span class="eyebrow">LET IT WAIT UNTIL MORNING</span><h1>Give the thought<br>a place to land.</h1><form id="mvp-park-form"><label>What\u2019s on your mind?<textarea name="thought" maxlength="500" placeholder="A few words are enough\u2026">${esc(active.parkedThought || "")}</textarea></label><p>We\u2019ll keep it for your morning check-in.</p><button type="submit" class="button amber">Park it \u2192</button></form>`, `<span class="eyebrow">AT YOUR OWN PACE</span><h1>Let the next breath<br>be a little easier.</h1>${breathingMarkup(180)}<button class="text-button" data-action="mvp-night-next">Demo: skip ahead \u2192</button>`, `<span class="eyebrow">NO NEED TO WATCH THE CLOCK</span><h1>Still wide awake?</h1><p>If you feel wide awake and frustrated, consider a quiet activity in dim light. Return to bed when you feel sleepy.</p>${btn("I\u2019m sleepy", "mvp-night-sleepy", "amber")}${btn("Still awake", "mvp-night-still", "outline")}<small>Move safely and choose what is comfortable for you.</small>`];
      return `<section class="protocol"><div class="row"><span class="small">Night support \xB7 ${step + 1} / 5</span><a href="#today" class="text-button">Close</a></div><div class="protocol-content">${panels[step]}</div>${step < 2 ? btn("Continue \u2192", "mvp-night-next", "amber") : ""}${step === 2 ? btn("Nothing to park tonight", "mvp-night-next", "soft") : ""}${step === 3 ? btn("Continue when ready \u2192", "mvp-night-next", "amber") : ""}${step > 0 ? btn("\u2190 Previous step", "mvp-night-back", "soft") : ""}${n.wakeEvents.length > 0 ? `<p class="small center">Reopening continues this same wake-up.</p>${step === 0 ? btn("This is a different wake-up", "mvp-new-wake", "soft") : ""}` : ""}</section>`;
    }
    function nightCall() {
      return `<button class="awake-main" data-action="mvp-awake-open"><span aria-hidden="true">\u263E</span><span><strong>I\u2019m awake</strong><small>Your night-time support \u2192</small></span></button>`;
    }
    function settingsCard() {
      const c = commerce(), s = c.subscription;
      return `<article class="card"><span class="demo-badge">DEMO SUBSCRIPTION</span><h2>Your plan</h2>${s ? `<p>${s.months}-month plan \xB7 ${esc(s.status)}</p><p>${s.cancelAtEnd ? "Your demo plan stays active until " + new Date(s.periodEnd).toLocaleDateString() : s.status === "paused" ? "Paused until " + new Date(s.pausedUntil).toLocaleDateString() : "Next demonstration renewal: " + new Date(s.periodEnd).toLocaleDateString()}</p>${s.status === "active" ? btn("Cancel demo subscription", "mvp-cancel-open", "outline") + btn("Pause for 1 month", "mvp-pause", "soft") : ""}<small>No real charge or financial subscription exists.</small>` : `<p>No demonstration plan selected.</p>${link("Explore the plans", "plans", "outline")}`}</article><article class="card"><h3>Local reminders</h3><p>${prefs().reminders ? "Enabled" : "Off"} \xB7 Quiet hours 10 p.m.\u20136 a.m.</p>${btn(prefs().reminders ? "Turn reminders off" : "Set up reminders", prefs().reminders ? "mvp-reminders-off" : "mvp-reminder-settings", "outline")}${link("Pilot terms", "terms", "soft")}</article>`;
    }
    function terms() {
      return `${head("PILOT TERMS", "A clear starting point.")}<article class="card"><h2>Educational pilot</h2><p>SleepThrough offers wellness education, a diary and self-guided practices for adults. It does not diagnose a cause or replace professional care. No improvement or recovery time is guaranteed.</p><h2>Demonstration plans</h2><p>The plan and checkout screens simulate a subscription. No card details are collected, no money is charged and no financial obligation is created. Cancel and pause change only this pilot\u2019s demonstration state.</p><h2>Your choice</h2><p>All lessons and the diary remain available in this pilot. An account is optional. Android health access and notification permissions are requested separately.</p><h2>Health support</h2><p>If sleep problems persist, affect daily life, or you experience concerning symptoms such as loud snoring or breathing pauses, discuss them with a qualified healthcare professional.</p>${link("Data & privacy", "privacy", "outline")}</article>${btn("\u2190 Back", "mvp-back", "soft")}`;
    }
    function dashboardExtras() {
      const p = assessment(), week = comparableWeeks(currentRows()), b = p.baseline;
      return `${record("assessment") ? `<article class="card"><span class="eyebrow">BEFORE THE PLAN \xB7 QUIZ ESTIMATE</span><h3>${esc(b.frequency)} difficult nights / week</h3><p>Your quiz estimate is shown separately from the measured or remembered awakenings in your chart.</p></article>` : ""}${week.current.length < 3 ? '<p class="connection">Your chart starts taking shape after 3 check-ins. Missing nights are never counted as zero.</p>' : ""}`;
    }
    function checkView() {
      var _a;
      const p = check, questionsText = ["Did you wake up in the night?", "About how much time were you awake altogether?", "How rested do you feel?"], choices = [["No", "Once", "Twice", "3 or more"], ["Under 10 min", "10\u201320 min", "20\u201340 min", "Over 40 min"], ["1 \xB7 Very tired", "2", "3", "4", "5 \xB7 Rested"]];
      return `<button class="close" data-action="close-modal" aria-label="Close check-in">\xD7</button><span class="eyebrow">MORNING CHECK-IN \xB7 ${p.stage === 0 ? "1" : p.stage === 1 ? "2" : "3"} / 3</span><h2>${questionsText[p.stage]}</h2><p>${p.day}${((_a = record("profile")) == null ? void 0 : _a.demo) ? " \xB7 Demo morning preview" : ""}</p>${p.stage === 0 && p.inferred > 0 ? `<p class="small">${p.inferred} night-support episode${p.inferred === 1 ? "" : "s"} logged. Adjust to your own memory.</p>` : ""}<div class="checkin-choices ${p.stage === 2 ? "rested" : ""}">${choices[p.stage].map((text, i) => `<button data-mvp-check="${p.stage === 2 ? i + 1 : i}" aria-pressed="${p.answers[["wakes", "duration", "rested"][p.stage]] === (p.stage === 2 ? i + 1 : i)}">${text}</button>`).join("")}</div>${p.stage ? btn("\u2190 Back", "mvp-check-back", "soft") : ""}<small>Your estimate is enough. \u201C3 or more\u201D is stored as a lower bound.</small>`;
    }
    function showCheckin(day = ((_a) => (_a = record("profile")) == null ? void 0 : _a.demo)() && store.state.currentNightDay ? store.state.currentNightDay : localDay()) {
      var _a2;
      const n = record("night:" + day) || { day }, inferred = ((_a2 = n.wakeEvents) == null ? void 0 : _a2.length) || 0;
      check = { day, stage: 0, inferred, answers: { wakes: n.checkinComplete ? Math.min(3, n.awakenings) : inferred ? Math.min(3, inferred) : void 0 } };
      document.querySelector("#modal-body").innerHTML = checkView();
      document.querySelector("#modal").showModal();
    }
    async function submitCheck(value) {
      if (!check) return;
      const p = check, key = ["wakes", "duration", "rested"][p.stage];
      p.answers[key] = value;
      if (p.stage === 0) {
        p.stage = value === 0 ? 2 : 1;
      } else if (p.stage === 1) p.stage = 2;
      else {
        const old = record("night:" + p.day) || { day: p.day }, n = checkinData(old, p.answers);
        await setRecord("night:" + p.day, "night", n);
        const notes = (n.wakeEvents || []).map((e) => e.parkedThought).filter(Boolean), w = comparableWeeks(currentRows()), long = (rows) => rows.filter((r) => r.checkinComplete && r.awakeMinutes >= 20).length;
        document.querySelector("#modal-body").innerHTML = `<span class="eyebrow">ONE SMALL CHECK-IN</span><h2>Your night is saved.</h2>${notes.length ? `<div class="card"><h3>Parked last night</h3>${notes.map((t) => `<p>${esc(t)}</p>`).join("")}</div>` : ""}<p>This week: ${long(w.current)} long-waking nights among ${w.current.filter((r) => r.checkinComplete).length} check-ins.</p><p>Previous week: ${long(w.previous)} among ${w.previous.filter((r) => r.checkinComplete).length} check-ins.</p>${btn("Back to my day", "mvp-check-close")}`;
        return;
      }
      document.querySelector("#modal-body").innerHTML = checkView();
    }
    async function beginWake(force = false) {
      var _a;
      if (wakeBusy) return;
      wakeBusy = true;
      try {
        const day = nightEnding(), n = record("night:" + day) || { day, awakenings: null, awakeMinutes: null, sleepMinutes: null, source: "manual", demo: !!((_a = record("profile")) == null ? void 0 : _a.demo) }, updated = startWake(n, /* @__PURE__ */ new Date(), force);
        store.state.currentNightDay = day;
        await setRecord("night:" + day, "night", updated);
        setRoute("night");
        render();
        await event("NightSupportOpen");
      } finally {
        wakeBusy = false;
      }
    }
    async function saveWake(change) {
      const { day, n, active } = currentWake();
      if (!active) return;
      const updated = { ...n, wakeEvents: n.wakeEvents.map((e) => e.id === active.id ? { ...e, ...change } : e) };
      await setRecord("night:" + day, "night", updated);
    }
    function stopBreath() {
      if (breathTimer) clearInterval(breathTimer);
      breathTimer = null;
      breathStart = 0;
      breathElapsed = 0;
      breathPaused = false;
    }
    function afterRender() {
      const inNight = location.hash === "#night";
      if (native && lastNightMode !== inNight) {
        lastNightMode = inNight;
        Tools.setNightMode({ enabled: inNight }).catch(() => {
        });
      }
      const area = document.querySelector("[data-breath-duration]");
      if (!area) {
        stopBreath();
        return;
      }
      if (breathTimer) return;
      breathStart = Date.now();
      breathTimer = setInterval(() => {
        const el = document.querySelector("[data-breath-duration]");
        if (!el) {
          stopBreath();
          return;
        }
        if (document.hidden || breathPaused) {
          breathStart = Date.now();
          return;
        }
        const time = Date.now();
        breathElapsed += (time - breathStart) / 1e3;
        breathStart = time;
        const duration = Number(el.dataset.breathDuration), phase = breathElapsed % 10, inhale = phase < 4, ratio = inhale ? phase / 4 : 1 - (phase - 4) / 6;
        const circle = document.querySelector("#breath-circle");
        circle == null ? void 0 : circle.style.setProperty("--breath-scale", String(0.72 + ratio * 0.28));
        const label = document.querySelector("#breath-label");
        if (label) label.textContent = breathElapsed >= duration ? "Rest naturally" : inhale ? "Breathe in" : "Breathe out";
        if (breathElapsed >= duration) {
          breathPaused = true;
          document.querySelector("#breath-status").textContent = "Practice complete. Continue when ready.";
        }
      }, 200);
    }
    function hideLeavingQuiz() {
      if (location.hash !== "#quiz") {
        clearTimeout(quizTimer);
        quizBusy = false;
      }
    }
    async function nextQuiz(skip = false) {
      if (skip) store.state.quiz.answers[store.state.quiz.step] = null;
      if (store.state.quiz.step >= questions.length - 1) {
        const p = personalProfile(store.state.quiz.answers);
        await setRecord("assessment", "assessment", p);
        const goals = ["Fewer remembered awakenings", "Return to sleep more easily", "Less pressure around sleep", "Understand my pattern"];
        const index = store.state.quiz.answers[0];
        await setRecord("goal", "profile", { index: Number.isInteger(index) ? index : 0, text: goals[index] || "A more manageable night", chosenAt: (/* @__PURE__ */ new Date()).toISOString() });
        await event("QuizComplete");
        setRoute("result");
      } else {
        store.state.quiz.step++;
        await persist();
        render();
        window.scrollTo(0, 0);
      }
    }
    async function configureReminders(enabled) {
      if (!native) {
        toast("Reminders are available in the Android APK.");
        return;
      }
      const p = prefs(), result2 = await Tools.configureReminders({ enabled, windDown: p.windDown, morning: p.morning, weekdays: p.weekdays });
      await setRecord("preferences", "profile", { ...p, reminders: result2.enabled });
      toast(result2.enabled ? "Local reminders scheduled. Android may delay delivery." : "Reminders are off.");
      render();
    }
    async function action(t) {
      var _a, _b;
      const d = t.dataset;
      if (d.mvpAnswer !== void 0) {
        if (quizBusy) return true;
        const step = store.state.quiz.step, v = Number(d.mvpAnswer);
        if (!Number.isInteger(v) || !((_a = questions[step]) == null ? void 0 : _a[1][v])) return true;
        quizBusy = true;
        store.state.quiz.answers[step] = v;
        await persist();
        render();
        quizTimer = setTimeout(async () => {
          try {
            if (location.hash !== "#quiz" || store.state.quiz.step !== step) return;
            quizBusy = false;
            await nextQuiz();
          } catch (e) {
            quizBusy = false;
            toast(e.message);
          }
        }, 220);
        return true;
      }
      if (d.mvpTarget !== void 0) {
        const target = Number(d.mvpTarget);
        if (Number.isInteger(target) && target >= 0 && target <= 7) await setRecord("goal", "profile", { ...record("goal"), target });
        render();
        return true;
      }
      if (d.mvpGoal !== void 0) {
        const index = Number(d.mvpGoal), texts = ["Fewer remembered awakenings", "Return to sleep more easily", "Less pressure around sleep", "Understand my pattern"];
        if (texts[index]) await setRecord("goal", "profile", { ...record("goal"), index, text: texts[index], chosenAt: (/* @__PURE__ */ new Date()).toISOString() });
        render();
        return true;
      }
      if (d.mvpPlan !== void 0) {
        planIndex = Number(d.mvpPlan);
        termsChecked = false;
        render();
        return true;
      }
      if (d.mvpWeekday !== void 0) {
        const p = prefs(), i = Number(d.mvpWeekday), set = new Set(p.weekdays);
        const form = document.querySelector("#mvp-routine-form");
        if (form) {
          p.windDown = form.elements.windDown.value;
          p.morning = form.elements.morning.value;
        }
        set.has(i) ? set.delete(i) : set.add(i);
        await setRecord("preferences", "profile", { ...p, weekdays: [...set].sort() });
        render();
        return true;
      }
      if (d.mvpCheck !== void 0) {
        await submitCheck(Number(d.mvpCheck));
        return true;
      }
      const a = d.action;
      if (!(a == null ? void 0 : a.startsWith("mvp-"))) return false;
      switch (a) {
        case "mvp-start-quiz":
          await event("QuizStart");
          setRoute("quiz");
          break;
        case "mvp-demo":
          if (!store.state.started) {
            await startLocal("Sarah");
            await setRecord("profile", "profile", { ...record("profile"), age: 52, demo: true });
            if (!records("night").length) {
              for (let i = 6; i >= 0; i--) {
                const date = /* @__PURE__ */ new Date();
                date.setDate(date.getDate() - i);
                const day = localDay(date);
                await setRecord("night:" + day, "night", { day, awakenings: [3, 2, 3, 2, 2, 1, 2][6 - i], awakeMinutes: 45, sleepMinutes: 390, rested: "2/5", checkinComplete: true, source: "manual", demo: true });
              }
            }
          }
          setRoute("today");
          break;
        case "mvp-fact":
          store.state.quiz.factSeen = true;
          await persist();
          render();
          break;
        case "mvp-quiz-back":
          clearTimeout(quizTimer);
          quizBusy = false;
          store.state.quiz.step = Math.max(0, store.state.quiz.step - 1);
          await persist();
          render();
          break;
        case "mvp-quiz-skip":
          clearTimeout(quizTimer);
          quizBusy = false;
          await nextQuiz(true);
          break;
        case "mvp-retake":
          clearTimeout(quizTimer);
          quizBusy = false;
          store.state.quiz = { answers: [], step: 0, factSeen: false };
          await persist();
          setRoute("quiz");
          break;
        case "mvp-lead":
          setRoute(store.user ? "plans" : "lead");
          await event("PlanExplore");
          break;
        case "mvp-checkout": {
          termsChecked = !!((_b = document.querySelector("#mvp-terms-check")) == null ? void 0 : _b.checked);
          if (!termsChecked) {
            document.querySelector("#consent-error").textContent = "Please read and accept the demonstration subscription terms to continue.";
            break;
          }
          await setRecord("commerce", "profile", { ...commerce(), acceptedAt: (/* @__PURE__ */ new Date()).toISOString(), planIndex, termsVersion: 1, demo: true });
          await event("InitiateCheckout", { plan: planIndex });
          setRoute("checkout");
          break;
        }
        case "mvp-checkout-success":
          if (checkoutBusy) break;
          checkoutBusy = true;
          try {
            const c = commerce();
            await setRecord("commerce", "profile", { ...c, subscription: demoSubscription(planIndex), demo: true });
            if (!store.state.started) await startLocal(c.name || "Your");
            await setRecord("onboarding", "profile", { complete: false, step: 0 });
            await event("DemoCheckoutComplete", { plan: planIndex });
            onboardStep = 0;
            setRoute("onboarding");
          } finally {
            checkoutBusy = false;
          }
          break;
        case "mvp-checkout-fail":
          toast("Demonstration payment declined. No charge was made. Choose another plan or try again.");
          break;
        case "mvp-onboarding-next":
          onboardStep = Math.min(4, onboardStep + 1);
          await setRecord("onboarding", "profile", { step: onboardStep, complete: false });
          stopBreath();
          render();
          window.scrollTo(0, 0);
          break;
        case "mvp-onboarding-back":
          onboardStep = Math.max(0, onboardStep - 1);
          await setRecord("onboarding", "profile", { step: onboardStep, complete: false });
          stopBreath();
          render();
          break;
        case "mvp-onboarding-finish":
          await setRecord("onboarding", "profile", { step: 4, complete: true });
          setRoute("today");
          break;
        case "mvp-reminders":
          await configureReminders(true);
          break;
        case "mvp-reminders-off":
          await configureReminders(false);
          break;
        case "mvp-reminder-settings":
          onboardStep = 2;
          setRoute("onboarding");
          break;
        case "mvp-awake-open":
          await beginWake();
          break;
        case "mvp-new-wake":
          await beginWake(true);
          break;
        case "mvp-night-next": {
          const { active } = currentWake();
          if (active) {
            await saveWake({ step: Math.min(4, (active.step || 0) + 1) });
            stopBreath();
            render();
            window.scrollTo(0, 0);
          }
          break;
        }
        case "mvp-night-back": {
          const { active } = currentWake();
          if (active) await saveWake({ step: Math.max(0, (active.step || 0) - 1) });
          stopBreath();
          render();
          break;
        }
        case "mvp-night-sleepy":
          await saveWake({ endedAt: (/* @__PURE__ */ new Date()).toISOString() });
          stopBreath();
          setRoute("today");
          break;
        case "mvp-night-still":
          document.querySelector(".protocol-content").innerHTML = '<div class="protocol-moon">\u263E</div><h1>One quiet activity.</h1><p>Choose something undemanding, in low light. Return to bed when you feel sleepy. You can put your phone away now.</p>' + btn("I\u2019m sleepy now", "mvp-night-sleepy", "amber");
          break;
        case "mvp-breath-pause":
          breathPaused = !breathPaused;
          t.textContent = breathPaused ? "Resume breathing" : "Pause breathing";
          break;
        case "mvp-check-back":
          if (check) {
            check.stage = check.stage === 2 && check.answers.wakes === 0 ? 0 : Math.max(0, check.stage - 1);
            document.querySelector("#modal-body").innerHTML = checkView();
          }
          break;
        case "mvp-check-close":
          document.querySelector("#modal").close();
          render();
          break;
        case "mvp-cancel-open":
          document.querySelector("#modal-body").innerHTML = `<h2>Cancel your demo plan?</h2><p>Your demonstration plan stays available until ${new Date(commerce().subscription.periodEnd).toLocaleDateString()}. No money is involved.</p>${btn("Confirm cancellation", "mvp-cancel-confirm")}${btn("Keep my plan", "close-modal", "outline")}${btn("Pause for 1 month instead", "mvp-pause", "soft")}`;
          document.querySelector("#modal").showModal();
          break;
        case "mvp-cancel-confirm":
          await setRecord("commerce", "profile", { ...commerce(), subscription: cancelDemo(commerce().subscription) });
          await event("DemoCancel");
          document.querySelector("#modal").close();
          render();
          break;
        case "mvp-pause":
          await setRecord("commerce", "profile", { ...commerce(), subscription: pauseDemo(commerce().subscription) });
          document.querySelector("#modal").close();
          render();
          toast("Demo plan paused for one month. No financial changes were made.");
          break;
        case "mvp-back":
          history.back();
          break;
      }
      return true;
    }
    function bind() {
      var _a, _b, _c;
      (_a = document.querySelector("#mvp-lead-form")) == null ? void 0 : _a.addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          await setRecord("commerce", "profile", { ...commerce(), name: String(f.get("name")).trim(), email: String(f.get("email")).trim(), demo: true });
          await event("Lead");
          termsChecked = false;
          setRoute("plans");
        } catch (e2) {
          toast(e2.message);
        }
      });
      (_b = document.querySelector("#mvp-routine-form")) == null ? void 0 : _b.addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = new FormData(e.target), windDown = String(f.get("windDown")), morning = String(f.get("morning"));
        if (!prefs().weekdays.length) {
          toast("Choose at least one practice day.");
          return;
        }
        if ([windDown, morning].some((v) => {
          const h = Number(v.split(":")[0]);
          return h < 6 || h >= 22;
        })) {
          toast("Choose reminder times outside quiet hours (6 a.m.\u201310 p.m.).");
          return;
        }
        await setRecord("preferences", "profile", { ...prefs(), windDown, morning });
        onboardStep = 3;
        await setRecord("onboarding", "profile", { step: 3, complete: false });
        render();
      });
      (_c = document.querySelector("#mvp-park-form")) == null ? void 0 : _c.addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveWake({ parkedThought: String(new FormData(e.target).get("thought") || "").trim().slice(0, 500), step: 3 });
        render();
      });
    }
    async function clearReminders() {
      if (native) await Tools.configureReminders({ enabled: false }).catch(() => {
      });
    }
    return { clearReminders, welcome, quiz, result, lead, plans, checkout, onboarding, night, nightCall, settingsCard, terms, dashboardExtras, showCheckin, action, bind, afterRender, hideLeavingQuiz, assessment };
  }

  // web-src/mvp-web.js
  function normalizeMvp(value) {
    var _a, _b, _c;
    const raw = value && typeof value === "object" ? value : {};
    const quiz = { step: Math.min(20, Math.max(0, Number((_a = raw.quiz) == null ? void 0 : _a.step) || 0)), answers: Array.isArray((_b = raw.quiz) == null ? void 0 : _b.answers) ? raw.quiz.answers.slice(0, 21).map((v) => Number.isInteger(v) && v >= 0 && v < 8 ? v : null) : [], factSeen: !!((_c = raw.quiz) == null ? void 0 : _c.factSeen) };
    const records = {};
    for (const [id, r] of Object.entries(raw.records || {}).slice(-650)) if (/^(profile|assessment|goal|commerce|preferences|onboarding|night:\d{4}-\d{2}-\d{2})$/.test(id) && (r == null ? void 0 : r.data) && typeof r.data === "object" && JSON.stringify(r.data).length < 3e4) records[id] = { kind: r.kind === "night" ? "night" : r.kind === "assessment" ? "assessment" : "profile", data: structuredClone(r.data) };
    if (records.assessment) records.assessment = { kind: "assessment", data: personalProfile(quiz.answers) };
    return { records, quiz, started: !!raw.started, currentNightDay: /^\d{4}-\d{2}-\d{2}$/.test(raw.currentNightDay) ? raw.currentNightDay : null, funnel: [], tour: Math.min(3, Math.max(-1, Number(raw.tour ?? -1))) };
  }
  function attach({ state, persist, render, appShell, toast, setDemo, footer, lessons, accountSettings, toolkitCards }) {
    const esc2 = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const store = { get state() {
      return state.mvp || (state.mvp = normalizeMvp(null));
    }, get user() {
      var _a;
      return ((_a = window.SleepAuth) == null ? void 0 : _a.user) || null;
    } };
    const record = (id) => {
      var _a;
      return ((_a = store.state.records[id]) == null ? void 0 : _a.data) || null;
    }, records = (kind) => Object.values(store.state.records).filter((r) => r.kind === kind).map((r) => r.data);
    async function setRecord(id, kind, data) {
      store.state.records[id] = { kind, data };
      if (kind === "night") {
        const rows = currentRows();
        state.history = rows.map((r) => ({ day: r.day, wakes: r.awakenings, awake: r.awakeMinutes ?? null, hours: r.sleepMinutes == null ? null : r.sleepMinutes / 60, rested: r.rested || "", date: r.updatedAt || (/* @__PURE__ */ new Date()).toISOString(), checkinComplete: !!r.checkinComplete }));
        state.entry = state.history.at(-1) || null;
      }
      await persist();
    }
    async function startLocal(name) {
      store.state.started = true;
      setDemo(true);
      await setRecord("profile", "profile", { name, adult: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    function currentRows() {
      const byDay = new Map((state.history || []).map((r) => [r.day, { day: r.day, awakenings: r.wakes, awakeMinutes: r.awake, sleepMinutes: Number.isFinite(r.hours) ? r.hours * 60 : null, checkinComplete: r.checkinComplete ?? true }]));
      for (const r of records("night")) byDay.set(r.day, r);
      return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
    }
    const routeMap = { result: "profile", today: "dashboard", path: "lessons", settings: "account" };
    const setRoute = (r) => {
      const next = routeMap[r] || r;
      location.hash = next;
    };
    const engine = createMvp({ store, record, records, setRecord, persist, startLocal, native: false, setRoute, render, toast, currentRows });
    const payment = { enabled: false, loaded: false, busy: false, error: "", checking: false, checked: false, offlineDemo: false };
    fetch("/api/payments/config", { credentials: "same-origin", cache: "no-store" }).then((r) => r.json()).then((c) => {
      payment.enabled = c.enabled === true;
      payment.loaded = true;
      if (["#checkout", "#stripe-return", "#account", "#plans"].includes(location.hash)) render();
    }).catch(() => {
      payment.loaded = true;
      if (["#checkout", "#stripe-return"].includes(location.hash)) render();
    });
    const routes = { "stripe-return": () => stripeReturn(), quiz: () => engine.quiz(), profile: () => engine.result(), lead: () => engine.lead(), plans: () => payment.enabled ? engine.plans().replace("DEMONSTRATION \xB7 NO REAL CHARGE", "STRIPE SANDBOX \xB7 NO REAL CHARGE").replace("this demonstration subscription:", "this test subscription:").replace("No payment is taken in this demo.", "Only test payments are created. No real money is charged.").replace("Cancel or pause the demo plan in Settings.", "Manage your test subscription in My account.") : engine.plans(), checkout: () => payment.offlineDemo ? engine.checkout() : stripeCheckout(), onboarding: () => engine.onboarding(), night: () => engine.night().replace("If you feel wide awake and frustrated, consider a quiet activity in dim light. Return to bed when you feel sleepy.", "Still awake after about 20 minutes? There is no need to check the time. If comfortable, get up for a quiet activity in dim light and return when sleepy."), terms: () => engine.terms().replace("The plan and checkout screens simulate a subscription. No card details are collected, no money is charged and no financial obligation is created. Cancel and pause change only this pilot\u2019s demonstration state.", "Stripe Sandbox checkout creates test subscriptions. No real money is charged and no financial obligation is created. Card details are entered only on Stripe. Cancel and pause update the test subscription in Stripe; the offline demo changes only local demonstration state."), privacy: () => privacy() };
    function adapt(html) {
      return html.replaceAll('href="#result"', 'href="#profile"').replaceAll('href="#today"', 'href="#dashboard"').replaceAll('href="#path"', 'href="#lessons"').replaceAll('href="#settings"', 'href="#account"');
    }
    function paymentMessage(code) {
      return { invalid_email: "Enter a valid email address for your test receipt.", invalid_plan: "Please choose a plan again before continuing.", invalid_attempt: "Please reload this page and try again.", intro_coupon_mismatch: "The introductory price could not be verified. Please try again later.", checkout_price_mismatch: "The checkout price does not match your selected plan. Please return to the plans.", stripe_temporarily_unavailable: "Stripe is temporarily unavailable. Please try again.", checkout_browser_required: "Open this plan in the browser you used for checkout.", checkout_not_owned: "This checkout belongs to a different browser.", subscription_not_owned: "This browser could not verify ownership of that subscription.", sandbox_not_configured: "Stripe sandbox is not configured yet.", invalid_origin: "Open checkout using the configured site address.", subscription_consent_required: "Accept the displayed subscription terms before continuing.", too_many_checkout_requests: "Too many requests. Please try again later.", stripe_request_failed: "Stripe could not complete this request. Try again or check the sandbox settings." }[code] || "Checkout could not finish. No confirmed payment has been recorded. Please retry.";
    }
    async function payApi(route, body) {
      let response;
      try {
        response = await fetch("/api/payments/" + route, { method: body ? "POST" : "GET", credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : void 0, body: body ? JSON.stringify(body) : void 0, cache: "no-store" });
      } catch {
        throw Error("Could not reach the payment server. Please retry.");
      }
      const value = await response.json();
      if (!response.ok) throw Error(paymentMessage(value.error));
      return value;
    }
    function stripeCheckout() {
      var _a;
      const c = record("commerce") || {}, p = PLANS[c.planIndex ?? 1];
      if (!payment.loaded) return '<section class="mvp-checkout"><h1>Opening checkout\u2026</h1></section>';
      if (!payment.enabled) return '<section class="mvp-checkout"><h1>Checkout is not ready yet.</h1><p>The Stripe sandbox connection needs to be configured by the owner. Nothing has been charged.</p><button class="button outline" data-stripe-action="offline">Explore the offline demo instead</button><a class="text-link" href="#plans">Back to plans \u2192</a></section>';
      return '<section class="mvp-checkout"><span class="demo-badge">STRIPE SANDBOX \xB7 NO REAL CHARGE</span><h1>Your plan.<br>One clear next step.</h1><article class="card"><h2>' + p.months + '-month plan</h2><span class="plan-price">$' + p.today.toFixed(2) + " today</span><p>Then $" + p.renewal.toFixed(2) + " every " + (p.months === 1 ? "month" : p.months + " months") + ' until cancelled.</p><p>A Stripe-hosted test form opens next. Use a Stripe test card, never a real card.</p><label>Email for your test receipt<input id="stripe-receipt-email" type="email" autocomplete="email" required maxlength="254" value="' + esc2(c.email || ((_a = store.user) == null ? void 0 : _a.email) || "") + '"></label><p class="error" role="alert">' + esc2(payment.error) + '</p><button class="button" data-stripe-action="checkout" ' + (payment.busy ? "disabled" : "") + ">" + (payment.busy ? "Opening Stripe\u2026" : "Continue to Stripe test checkout \u2192") + '</button><small>Stripe handles the test card. SleepThrough never receives its number.</small></article><a class="text-link" href="#plans">Change my plan \u2192</a></section>';
    }
    function stripeReturn() {
      return '<section class="mvp-checkout"><span class="demo-badge">STRIPE SANDBOX</span><h1>' + (payment.checked ? "Let\u2019s check your payment." : "Checking your test payment\u2026") + "</h1><p>" + esc2(payment.error || "We verify the result with Stripe before opening your plan.") + "</p>" + (payment.checked ? '<button class="button" data-stripe-action="verify">Check again</button><a class="text-link" href="#plans">Back to my plans \u2192</a>' : "") + "</section>";
    }
    async function verifyReturn() {
      var _a;
      if (payment.checking) return;
      if (!payment.enabled) {
        payment.checked = true;
        payment.error = "The Stripe connection is unavailable. No payment has been confirmed. Please reload or retry later.";
        render();
        return;
      }
      payment.checking = true;
      try {
        const id = new URLSearchParams(location.search).get("checkout_session_id") || ((_a = record("commerce")) == null ? void 0 : _a.stripeSessionId);
        if (!id) throw Error("No checkout session was found. Return to your plans to begin.");
        const value = await payApi("session?session_id=" + encodeURIComponent(id));
        if (!value.verified) throw Error("Your test checkout has not completed. You can return to the plans and try again.");
        const c = record("commerce") || {};
        await setRecord("commerce", "profile", { ...c, demo: false, stripeSessionId: id, subscription: { ...value.subscription, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() } });
        if (!store.state.started) await startLocal(c.name || "Your");
        await setRecord("onboarding", "profile", { step: 0, complete: false });
        payment.checked = true;
        history.replaceState(null, "", location.pathname + "#stripe-return");
        setRoute("onboarding");
      } catch (err) {
        payment.checked = true;
        payment.error = err.message;
        render();
      } finally {
        payment.checking = false;
      }
    }
    function stripeSettings() {
      var _a;
      const s = (_a = record("commerce")) == null ? void 0 : _a.subscription;
      if (!s) return "";
      const date = (v) => new Date(v).toLocaleDateString();
      return '<article class="card"><span class="demo-badge">STRIPE TEST SUBSCRIPTION \xB7 NO REAL MONEY</span><h2>Your ' + s.months + "-month plan</h2><p>" + (s.cancelAtEnd ? "Your test plan stays active until " + esc2(date(s.periodEnd)) + "." : s.pausedUntil ? "Test payment collection paused until " + esc2(date(s.pausedUntil)) + ". Service remains available." : "Next test renewal: " + esc2(date(s.periodEnd)) + ".") + '</p><p class="small">Last verified ' + esc2(date(s.verifiedAt || Date.now())) + '. Use the same browser as checkout to manage this sandbox plan.</p><p class="error" role="alert">' + esc2(payment.error) + "</p>" + (!s.cancelAtEnd && s.status === "active" ? '<button class="button outline" data-stripe-action="cancel-open">Cancel test subscription</button><button class="text-button" data-stripe-action="pause" ' + (payment.busy || s.pausedUntil ? "disabled" : "") + ">Pause test billing for 1 month</button>" : "") + '<button class="text-button" data-stripe-action="refresh" ' + (payment.busy ? "disabled" : "") + ">Refresh Stripe status</button></article>";
    }
    async function stripeAction(action) {
      var _a;
      if (action === "offline") {
        payment.offlineDemo = true;
        render();
        return;
      }
      if (action === "verify") {
        payment.checked = false;
        payment.error = "";
        render();
        return;
      }
      if (action === "cancel-open") {
        document.querySelector("#modal-body").innerHTML = '<h2>Cancel your test subscription?</h2><p>Renewal will stop at the end of the current test period. No real money is involved.</p><button class="button" data-stripe-action="cancel">Confirm cancellation</button><button class="button outline" data-action="close-modal">Keep my plan</button><button class="text-button" data-stripe-action="pause">Pause test billing for 1 month instead</button>';
        document.querySelector("#modal").showModal();
        return;
      }
      if (payment.busy) return;
      payment.busy = true;
      payment.error = "";
      try {
        const c = record("commerce") || {};
        if (action === "checkout") {
          if (!c.acceptedAt) throw Error("Please accept the subscription terms on the plans screen first.");
          const { email, plan } = checkoutDetails(c, store.user, (_a = document.querySelector("#stripe-receipt-email")) == null ? void 0 : _a.value);
          const attempt = checkoutAttempt(c, email, () => crypto.randomUUID());
          await setRecord("commerce", "profile", { ...c, email, stripeAttempt: attempt, stripeAttemptPlan: plan, stripeAttemptEmail: email });
          render();
          const value2 = await payApi("checkout", { plan, consent: true, attempt, email });
          await setRecord("commerce", "profile", { ...record("commerce"), stripeSessionId: value2.sessionId });
          const next = new URL(value2.url);
          if (next.protocol !== "https:" || next.hostname !== "checkout.stripe.com") throw Error("The checkout address could not be verified.");
          location.assign(value2.url);
          return;
        }
        const value = action === "refresh" ? await payApi("session?session_id=" + encodeURIComponent(c.stripeSessionId)) : await payApi(action, { sessionId: c.stripeSessionId, confirmed: true });
        if (!value.subscription) throw Error("Stripe has not confirmed an active test subscription.");
        await setRecord("commerce", "profile", { ...c, subscription: { ...value.subscription, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() } });
        document.querySelector("#modal").close();
        render();
      } finally {
        payment.busy = false;
        if (action !== "checkout") render();
      }
    }
    function privacy() {
      return '<section class="mvp-lead"><h1>Your data, your choice.</h1><article class="card"><h2>On this browser</h2><p>Your quiz, plan, night notes and lessons stay in this browser unless you sign in and choose to copy your local plan. Anyone using this browser profile may see them.</p><h2>With an account</h2><p>Your diary and lessons are stored in your private account. Health Connect permissions belong to the Android application; this website does not read Samsung Health.</p><h2>Payments</h2><p>Demonstration checkout creates no charge. Stripe Sandbox handles test checkout. The email and chosen pricing plan are sent to Stripe; your quiz answers and night notes are not. No real money is charged.</p></article><button class="button outline" data-action="mvp-back">Back</button></section>';
    }
    function ownChart() {
      const rows = currentRows().filter((r) => Number.isFinite(r.awakenings)), today = /* @__PURE__ */ new Date(), cut = new Date(today);
      cut.setDate(cut.getDate() - (state.period || 7) + 1);
      const day = [cut.getFullYear(), String(cut.getMonth() + 1).padStart(2, "0"), String(cut.getDate()).padStart(2, "0")].join("-"), shown = rows.filter((r) => r.day >= day);
      if (!shown.length) return '<div class="empty-state"><h3>One night is a beginning.</h3><p>Your chart fills in after 3 check-ins. Missing nights are never counted as zero.</p></div>';
      const max = Math.max(3, ...shown.map((r) => r.awakenings));
      return '<div class="web-night-chart" role="img" aria-label="Awakenings on your recorded nights">' + shown.map((r) => `<div><strong>${r.awakenings}${r.awakeningLowerBound ? "+" : ""}</strong><i style="height:${Math.max(3, r.awakenings / max * 130)}px"></i><small>${esc2(r.day.slice(5))}</small></div>`).join("") + '</div><p class="small">' + shown.length + " recorded nights. Button logs are lower bounds until your check-in.</p>";
    }
    function dashboard() {
      var _a, _b, _c;
      const p = engine.assessment(), n = currentRows().at(-1), name = ((_a = record("profile")) == null ? void 0 : _a.name) || ((_b = window.SleepAuth) == null ? void 0 : _b.name) || "there", day = ((_c = lessons.find((l2) => !state.complete.includes(l2.day))) == null ? void 0 : _c.day) || 28, l = lessons[day - 1];
      appShell("dashboard", `<div class="page-head"><div><span class="eyebrow">ONE SMALL STEP TONIGHT</span><h1>A clearer night,<br>${esc2(name)}.</h1></div><button class="button outline small" data-action="checkin">Morning check-in</button></div>${engine.nightCall()}<div class="dashboard-grid"><article class="card" data-tour="report"><span class="eyebrow">${n ? esc2(n.day) : "YOUR LAST NIGHT"}</span><div class="web-night-number">${(n == null ? void 0 : n.awakenings) ?? "\u2014"}${(n == null ? void 0 : n.awakeningLowerBound) ? "+" : ""}<small>awakenings</small></div><p>${(n == null ? void 0 : n.checkinComplete) ? "Your morning estimate." : n ? "Logged night-support episodes. Confirm in the morning." : "Your own nights will appear here."}</p><div class="metric-pair"><span>${(n == null ? void 0 : n.awakeMinutes) ?? "\u2014"} min<small>awake at night</small></span><span>${(n == null ? void 0 : n.sleepMinutes) == null ? "\u2014" : (n.sleepMinutes / 60).toFixed(1)} h<small>time asleep</small></span></div><a class="text-link" href="#journal">View my diary \u2192</a></article><article class="card" data-tour="lesson"><span class="eyebrow">DAY ${day} / 28 \xB7 ${l.minutes} MIN</span><h2>${esc2(l.title)}</h2><p>Discover a skill. Try it. Keep something you can use.</p><a class="button" href="#lesson/${day}">Start my practice \u2192</a></article></div><article class="card"><div class="row"><h2>Your awakenings</h2><div class="segmented"><button data-period="7" aria-pressed="${state.period === 7}">Week</button><button data-period="28" aria-pressed="${state.period === 28}">Month</button></div></div>${ownChart()}</article>${record("assessment") ? `<article class="card"><span class="eyebrow amber-label">YOUR 3 A.M. PROFILE</span><h2>${esc2(p.name)}</h2><a class="text-link" href="#profile">See my profile \u2192</a></article>` : ""}${engine.dashboardExtras()}<button class="text-button" data-web-tour="0">Show me around \u2192</button>`);
      tour();
    }
    function journal() {
      appShell("journal", `<span class="eyebrow">YOUR DIARY</span><h1>One night.<br>The whole picture.</h1><button class="button" data-action="checkin">Morning check-in \u2192</button>${currentRows().length ? [...currentRows()].reverse().map((r) => `<article class="card"><span class="eyebrow">${esc2(r.day)}</span><h2>${r.awakenings ?? "\u2014"}${r.awakeningLowerBound ? "+" : ""} awakenings</h2><p>${r.awakeMinutes ?? "\u2014"} min awake \xB7 ${r.sleepMinutes == null ? "\u2014" : (r.sleepMinutes / 60).toFixed(1)} h asleep</p>${(r.wakeEvents || []).filter((e) => e.parkedThought).map((e) => `<p>Parked: ${esc2(e.parkedThought)}</p>`).join("")}<button class="text-button" data-web-check-day="${esc2(r.day)}">Edit this night \u2192</button></article>`).join("") : "<p>Your first check-in will appear here.</p>"}${toolkitCards()}`);
    }
    function insights() {
      appShell("insights", '<span class="eyebrow">YOUR RECORDED NIGHTS</span><h1>One night.<br>The bigger picture.</h1><article class="card"><h2>Awakenings per night</h2>' + ownChart() + "</article>" + engine.dashboardExtras());
    }
    function tour() {
      var _a;
      const i = store.state.tour;
      if (i < 0 || i >= 3) return;
      const selectors = [".awake-main", "[data-tour=lesson]", "[data-tour=report]"], target = document.querySelector(selectors[i]);
      target == null ? void 0 : target.classList.add("tour-highlight");
      target == null ? void 0 : target.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      (_a = document.querySelector(".app-content")) == null ? void 0 : _a.insertAdjacentHTML("beforeend", `<aside class="web-tour" role="dialog" aria-label="Your sleep space tour"><span class="eyebrow">YOUR SLEEP SPACE \xB7 ${i + 1} / 3</span><h2>${["Your night-time button", "One small practice", "A picture built from your nights"][i]}</h2><p>${["If you wake at night, start here. A single step at a time, without watching the clock.", "Your 28-day path gives you hands-on tools, at your own pace.", "Log a quick check-in in the morning. Missing nights stay unknown."][i]}</p><button class="button" data-web-tour="${i + 1}">${i === 2 ? "Got it" : "Next \u2192"}</button><button class="text-button" data-web-tour="3">Skip tour</button></aside>`);
    }
    function account() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      if ((_a = window.SleepAuth) == null ? void 0 : _a.user) accountSettings();
      else appShell("account", `<span class="eyebrow">YOUR LOCAL SLEEP SPACE</span><h1>Your plan.<br>Your choice.</h1><article class="card"><h2>${esc2(((_b = record("profile")) == null ? void 0 : _b.name) || "Your local profile")}</h2><p>Saved in this browser. An account is optional.</p><a class="button" href="#signup">Create my account</a><a class="text-link" href="#login">Sign in \u2192</a></article>`);
      (_e = document.querySelector(".app-content")) == null ? void 0 : _e.insertAdjacentHTML("beforeend", ((_d = (_c = record("commerce")) == null ? void 0 : _c.subscription) == null ? void 0 : _d.processor) === "stripe" ? stripeSettings() : engine.settingsCard());
      if ((_f = window.SleepAuth) == null ? void 0 : _f.user) {
        let local = null;
        try {
          local = JSON.parse(localStorage.getItem("sleepthrough-v3") || "null");
        } catch {
        }
        if (((_g = local == null ? void 0 : local.mvp) == null ? void 0 : _g.started) && String(((_j = (_i = (_h = local.mvp.records) == null ? void 0 : _h.commerce) == null ? void 0 : _i.data) == null ? void 0 : _j.email) || "").toLowerCase() === String(window.SleepAuth.user.email).toLowerCase()) (_k = document.querySelector(".app-content")) == null ? void 0 : _k.insertAdjacentHTML("beforeend", '<article class="card"><h3>Bring your local plan with you</h3><p>Copy the plan, diary and lessons saved in this browser to this account. This replaces the corresponding account progress.</p><button class="button outline" data-web-import>Review and copy local plan</button></article>');
      }
    }
    async function renderRoute(hash) {
      return renderRouteSync(hash);
    }
    function renderRouteSync(hash) {
      var _a, _b;
      engine.hideLeavingQuiz();
      const handled = !!routes[hash] || ["dashboard", "insights", "journal", "account", "demo"].includes(hash);
      document.body.classList.toggle("mvp-mode", handled);
      document.body.classList.toggle("night-mode", hash === "night");
      if (!handled) {
        engine.afterRender();
        return false;
      }
      document.body.classList.toggle("app-mode", ["dashboard", "insights", "account", "demo"].includes(hash));
      if (hash === "demo") {
        engine.action({ dataset: { action: "mvp-demo" } }).then(() => {
          store.state.tour = 0;
          persist();
          render();
        });
        return true;
      }
      if (hash === "account" && !store.state.started && !((_a = window.SleepAuth) == null ? void 0 : _a.user)) return false;
      if (["dashboard", "insights", "journal"].includes(hash) && !store.state.started && !((_b = window.SleepAuth) == null ? void 0 : _b.user)) return false;
      if (routes[hash]) main.innerHTML = '<div class="web-mvp-flow">' + adapt(routes[hash]()) + "</div>";
      else if (hash === "dashboard") dashboard();
      else if (hash === "insights") insights();
      else if (hash === "journal") journal();
      else account();
      engine.bind();
      engine.afterRender();
      if (hash === "stripe-return" && !payment.checking && !payment.checked && payment.loaded) verifyReturn();
      window.scrollTo(0, 0);
      document.title = "SleepThrough \u2013 Staying asleep after 40";
      return true;
    }
    document.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      const d = t.dataset, a = d.action || "";
      if (d.stripeAction) {
        e.preventDefault();
        e.stopImmediatePropagation();
        stripeAction(d.stripeAction).catch((err) => {
          payment.busy = false;
          payment.error = err.message;
          render();
        });
        return;
      }
      if (a === "close-modal") {
        e.stopImmediatePropagation();
        document.querySelector("#modal").close();
        return;
      }
      if (d.webCheckDay) {
        e.stopImmediatePropagation();
        engine.showCheckin(d.webCheckDay);
        return;
      }
      if (d.webTour !== void 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        store.state.tour = Number(d.webTour);
        persist();
        render();
        return;
      }
      if (d.webImport !== void 0) {
        e.stopImmediatePropagation();
        if (confirm("Copy this browser\u2019s plan, night notes and lesson progress to your signed-in account? This replaces the corresponding account progress.")) {
          const local = JSON.parse(localStorage.getItem("sleepthrough-v3") || "{}");
          for (const k of ["complete", "notes", "lessonWork", "lessonSteps", "entry", "history"]) if (local[k] !== void 0) state[k] = local[k];
          state.mvp = normalizeMvp(local.mvp);
          persist();
          render();
        }
        return;
      }
      if (d.period && ["#dashboard", "#insights"].includes(location.hash)) {
        e.stopImmediatePropagation();
        state.period = Number(d.period);
        render();
        return;
      }
      if (a === "checkin") {
        e.stopImmediatePropagation();
        engine.showCheckin();
        return;
      }
      if (!a.startsWith("mvp-") && !Object.keys(d).some((k) => k.startsWith("mvp"))) return;
      e.stopImmediatePropagation();
      if (a === "mvp-onboarding-finish") store.state.tour = 0;
      engine.action(t).catch((err) => toast(err.message));
    }, true);
    return { render: renderRouteSync, engine, normalize: normalizeMvp, record, currentRows };
  }
  window.SleepMvp = { attach, normalize: normalizeMvp };
})();
