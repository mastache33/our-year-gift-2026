const D = window.DATA;
/* для друзей: личный текст и медиа заблюрены. Полная версия: ?for=lena или #lena */
const PRIV_SAFE = !/[?&]for=lena(?:&|$)/i.test(location.search) && location.hash !== "#lena";
if(PRIV_SAFE) document.body.classList.add("priv-safe");
const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля",
  "августа","сентября","октября","ноября","декабря"];
const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const MONTHS_NOM = ["январь","февраль","март","апрель","май","июнь","июль",
  "август","сентябрь","октябрь","ноябрь","декабрь"];
const SKIP_EMOJI = new Set(["️","🏻","🏼","🏽","🏾","🏿","‍"]);

function nf(n){ return (n||0).toLocaleString("ru-RU").replace(/,/g," "); }
function plural(n, forms){
  const n10=n%10, n100=n%100;
  if(n10===1 && n100!==11) return forms[0];
  if(n10>=2 && n10<=4 && (n100<10||n100>=20)) return forms[1];
  return forms[2];
}
function firstName(p){ return (p||"").split(" ")[0]; }
/* display: она — Лена (для статистики), он — Андрей. Обращения ("любовь моя", "солнце") — в текстах отдельно. */
const NAME_MAP = { [D.persons[0]]: "Лена", [D.persons[1]]: "Андрей" };
const NAME_GEN = { [D.persons[0]]: "Лены", [D.persons[1]]: "Андрея" };
function dispName(p){ return NAME_MAP[p] || firstName(p); }
function dispGen(p){ return NAME_GEN[p] || firstName(p); }
function fmtDate(iso){
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDateTime(iso){
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}
function loveCount(word){
  const f = (D.love_keywords||[]).find(x=>x[0]===word);
  return f ? f[1] : 0;
}

/* ---------- HERO ---------- */
document.getElementById("hero-dates").textContent =
  `${fmtDate(D.span.start)} — ${fmtDate(D.span.end)}`;
document.getElementById("hero-sub").textContent =
  `${D.span.days} ${plural(D.span.days,["день","дня","дней"])} · ${nf(D.totals.messages)} ${plural(D.totals.messages,["сообщение","сообщения","сообщений"])} · одна история`;

/* ---------- MEETING / STORY ---------- */
const MEET = new Date(2025, 6, 11); // 11 июля 2025 — Топь
/* живой тикающий счётчик: время не остановилось, оно продолжает идти */
const heroMeetEl = document.getElementById("hero-meet");
function tickMeet(){
  if(!heroMeetEl) return;
  const diff = Date.now() - MEET.getTime();
  const days = Math.floor(diff / 86400000);
  const hh = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,"0");
  const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2,"0");
  const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2,"0");
  heroMeetEl.innerHTML =
    `Мы знакомы уже <b>${nf(days)}</b> ${plural(days,["день","дня","дней"])}` +
    `<span class="meet-clock">${hh}:${mm}:${ss}</span> ❤`;
}
tickMeet();
setInterval(tickMeet, 1000);

/* countdown to the anniversary (this year or next) */
function nextAnniversaryText(){
  const now = new Date();
  let ann = new Date(now.getFullYear(), 6, 11, 0, 0, 0);
  if(ann - now < 0){ ann = new Date(now.getFullYear()+1, 6, 11, 0, 0, 0); }
  const ms = ann - now;
  const dLeft = Math.floor(ms / 86400000);
  const hLeft = Math.floor((ms % 86400000) / 3600000);
  if(dLeft <= 0 && hLeft <= 0) return `Сегодня ровно год) с годовщиной, солнце ❤`;
  if(dLeft === 0) return `Через ${hLeft} ${plural(hLeft,["час","часа","часов"])} — ровно год)`;
  return `До нашей годовщины: ${dLeft} ${plural(dLeft,["день","дня","дней"])}, ${hLeft} ${plural(hLeft,["час","часа","часов"])}`;
}
const cdEl = document.getElementById("hero-countdown");
if(cdEl) cdEl.textContent = nextAnniversaryText();

/* ---------- TIME ECHO ----------
   если она открывает сайт примерно в то же время дня, когда пришло её первое
   сообщение (10:55) — показываем маленькое совпадение. не привязано к дате,
   просто к часу — так шанс поймать момент выше, а эффект тот же */
(function timeEcho(){
  const el = document.getElementById("hero-time-echo");
  const fm = (D.milestones||{}).first_message;
  if(!el || !fm) return;
  const first = new Date(fm.date);
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const firstMin = first.getHours()*60 + first.getMinutes();
  const diff = Math.abs(nowMin - firstMin);
  if(diff <= 20){
    el.hidden = false;
    el.classList.add("priv-blur");
    el.textContent = `именно сейчас, год назад, ты писала мне: «${fm.text || "Привет 😄"}»`;
  }
})();

document.getElementById("story-text").innerHTML =
  `<b>11 июля 2025</b>, Топь. Ты в жёлтой худи и красной шапке, я в тельняшке —
   я тогда ещё не знал, что эта встреча всё поменяет)
   <br><br>Написали друг другу чуть позже — и понеслось. <b>${nf(D.totals.messages)}</b> сообщений,
   куча «доброе утро» и «спокойной ночи», <b>${nf(loveCount("люблю"))}</b> раз «люблю»,
   <b>${nf(loveCount("нежно"))}</b> «нежно», и это только на бумаге)
   <br><br>Ниже — весь наш год в цифрах и деталях. Листай, солнце — я тут кое-что посчитал.`;

/* ---------- BIG NUMBERS ---------- */
const totalChars = Object.values(D.totals.chars).reduce((a,b)=>a+b,0);
const bookPages = Math.round(totalChars/1800);
const bigNumbers = [
  {v:D.totals.messages, l:"сообщений друг другу"},
  {v:D.span.days, l:"дней вместе в переписке"},
  {v:loveCount("люблю"), l:`${plural(loveCount("люблю"),["раз","раза","раз"])} сказали «люблю»`},
  {v:bookPages, l:"страниц книги написали"},
];
document.getElementById("big-numbers").innerHTML = bigNumbers.map((x,i)=>
  `<div class="card reveal"><div class="num" data-count="${x.v}">0</div>
   <div class="lbl">${x.l}</div></div>`).join("");

/* ---------- BALANCE ---------- */
const persons = D.persons;
const counts = persons.map(p=>D.totals.by_person[p]||0);
const maxc = Math.max(...counts);
document.getElementById("balance-bars").innerHTML = persons.map((p,i)=>
  `<div class="bar-row reveal">
     <div class="bar-head"><span class="who">${dispName(p)}</span>
       <span class="val">${nf(counts[i])} сообщений</span></div>
     <div class="bar-track"><div class="bar-fill ${i?'b':'a'}" data-w="${Math.round(counts[i]/maxc*100)}"></div></div>
   </div>`).join("");
const st = D.starters||{};
const stA = st[persons[0]]||0, stB = st[persons[1]]||0;
document.getElementById("balance-caption").textContent =
  `Почти идеальный баланс. ${dispName(persons[0])} писала первой ${stA} ${plural(stA,["раз","раза","раз"])}, ${dispName(persons[1])} — ${stB}.`;

/* ---------- TIMELINE (by month) ---------- */
const months = Object.keys(D.by_month).sort();
const monthTotals = months.map(m=>{
  const o = D.by_month[m];
  return Object.values(o).reduce((a,b)=>a+b,0);
});
const maxM = Math.max(...monthTotals);
const peakIdx = monthTotals.indexOf(maxM);
document.getElementById("month-chart").innerHTML = months.map((m,i)=>{
  const [y,mm] = m.split("-");
  return `<div class="col ${i===peakIdx?'peak':''}">
    <div class="bar" data-h="${Math.round(monthTotals[i]/maxM*100)}"></div>
    <div class="clbl">${MONTHS_SHORT[+mm-1]}</div></div>`;
}).join("");
const [py,pm] = months[peakIdx].split("-");
document.getElementById("timeline-caption").textContent =
  `Пик — ${MONTHS_NOM[+pm-1]} ${py}: ${nf(maxM)} ${plural(maxM,["сообщение","сообщения","сообщений"])} за месяц. Тогда было не оторваться друг от друга.`;

/* ---------- CLOCK (by hour) ---------- */
const hours = Array.from({length:24},(_,h)=>D.by_hour[String(h)]||0);
const maxH = Math.max(...hours);
const peakHour = hours.indexOf(maxH);
document.getElementById("hour-chart").innerHTML = hours.map((v,h)=>
  `<div class="col ${h===peakHour?'peak':''}">
     <div class="bar" data-h="${Math.round(v/maxH*100)}"></div>
     <div class="clbl">${h}</div></div>`).join("");
document.getElementById("clock-caption").textContent =
  `Наш час пик — ${peakHour}:00. А после полуночи мы отправили друг другу ${nf(D.night_messages)} сообщений. Спать? Потом.`;

/* ---------- LOVE WORDS ---------- */
const lw = (D.love_keywords||[]).slice(0,8);
const maxLW = lw.length?lw[0][1]:1;
document.getElementById("love-words").innerHTML = lw.map(([w,c])=>
  `<div class="love-item reveal">
     <div class="lw">${w}</div>
     <div class="lt"><div class="lf" data-w="${Math.round(c/maxLW*100)}"></div></div>
     <div class="lc">${nf(c)}</div>
   </div>`).join("");

/* ---------- HER WORDS (её словечки) ---------- */
/* handpicked words + phrases that are characteristically hers, resolved via love_keywords when possible */
function keywordCount(kw){
  const f = (D.love_keywords||[]).find(x=>x[0].toLowerCase()===kw.toLowerCase());
  return f ? f[1] : null;
}
/* counts computed only across HER messages (lemma-friendly) */
const HW = [
  {w:"ммм…",       c: 104, ico:"💭"},
  {w:"мурзик",     c: 47,  ico:"🐈"},
  {w:"кайфово",    c: 30,  ico:"✨"},
  {w:"нежно",      c: 20,  ico:"🕯️"},
  {w:"обожаю",     c: 16,  ico:"💗"},
  {w:"уютно",      c: 9,   ico:"🍵"},
  {w:"заботливый", c: 15,  ico:"🤍"},
  {w:"миленький",  c: 6,   ico:"🧸"},
  {w:"котэ",       c: 4,   ico:"🐾"},
  {w:"цветочки",   c: 4,   ico:"🌷"},
];
document.getElementById("her-words-grid").innerHTML = HW.map(x=>
  `<div class="hw-item"><span>${x.ico}</span>
     <span class="hw-w">${x.w}</span><span class="hw-c">×${x.c}</span></div>`).join("");

/* ---------- FOUND POEM (собрано только из её собственных фраз) ---------- */
const FOUND_POEM = [
  "нежно нежно",
  "обожаю наши ночные разговоры",
  "мурзик мой, кайфово, уютно",
  "я очень тактильная — люблю объятия, поцелуи, прикосновения",
  "буду рядом, любить и заботиться",
  "как же я не люблю без тебя засыпать",
  "иногда в рандомный момент приходит осознание, что у меня есть ты",
  "и я так счастлива",
];
const fpEl = document.getElementById("fp-poem");
if(fpEl){
  fpEl.innerHTML = FOUND_POEM.map(l=>`<p class="fp-line priv-blur">${l}</p>`).join("") +
    `<p class="fp-line fp-last">это всё — твои слова. я просто их запомнил.</p>`;
  const fpLines = Array.from(fpEl.querySelectorAll(".fp-line"));
  if("IntersectionObserver" in window){
    const fpIo = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          fpLines.forEach((l,i)=> setTimeout(()=>l.classList.add("on"), i*220));
          fpIo.disconnect();
        }
      });
    }, {threshold:.3});
    fpIo.observe(fpEl);
  } else {
    fpLines.forEach(l=>l.classList.add("on"));
  }
}

/* ---------- EMOJI ---------- */
const emojis = (D.emojis_total||[]).filter(([e])=>!SKIP_EMOJI.has(e)&&e.trim()).slice(0,8);
document.getElementById("emoji-row").innerHTML = emojis.map(([e,c])=>
  `<div class="emoji-item reveal"><span class="e">${e}</span><div class="ec">${nf(c)}</div></div>`).join("");

/* ---------- STREAK ---------- */
document.getElementById("streak-num").setAttribute("data-count", D.streak.days);
document.getElementById("streak-dates").textContent =
  `с ${fmtDate(D.streak.start)} по ${fmtDate(D.streak.end)}`;

/* ---------- EXTRAS ---------- */
const m = D.media||{};
const extras = [
  {v:D.reactions.total, l:"реакций поставили"},
  {v:m.video_message||0, l:"кружочков записали"},
  {v:m.photo||0, l:"фотографий отправили"},
  {v:m.sticker||0, l:"стикеров прислали"},
  {v:(D.totals.words_by_person?Object.values(D.totals.words_by_person).reduce((a,b)=>a+b,0):0), l:"слов написали"},
  {v:loveCount("скучаю"), l:`${plural(loveCount("скучаю"),["раз","раза","раз"])} «скучаю»`},
];
document.getElementById("extra-cards").innerHTML = extras.map(x=>
  `<div class="card reveal"><div class="num" data-count="${x.v}">0</div>
   <div class="lbl">${x.l}</div></div>`).join("");

/* ---------- MILESTONES ---------- */
const ms = D.milestones||{};
const items = [];
if(ms.first_message){
  const photos = ms.first_message.photos || [];
  items.push({d:ms.first_message.date, t:"Самое первое сообщение", type: photos.length ? "photos" : "text",
    photos,
    x: ms.first_message.text
      ? `от ${dispGen(ms.first_message.from)} — а через 12 секунд она написала: «${ms.first_message.text}»`
      : `от ${dispGen(ms.first_message.from)}`});
}
const flHer = ms[`first_lyublyu_${persons[0]}`];
const flHim = ms[`first_lyublyu_${persons[1]}`];
if(flHer) items.push({d:flHer.date, t:`Первое «люблю» от ${dispGen(persons[0])}`, type:"text", x:`«${flHer.text}»`});
if(flHim) items.push({d:flHim.date, t:`Первое «люблю» от ${dispGen(persons[1])}`, type:"text", x:`«${flHim.text}»`});
if(ms.first_voice){
  items.push({d:ms.first_voice.date, t:"Первое голосовое", type: ms.first_voice.audio ? "audio" : "text",
    audio: ms.first_voice.audio, x:`от ${dispGen(ms.first_voice.from)} · нажми, чтобы услышать`});
}
if(ms.first_video_msg){
  items.push({d:ms.first_video_msg.date, t:"Первый кружочек", type: ms.first_video_msg.video ? "video" : "text",
    video: ms.first_video_msg.video, x:`от ${dispGen(ms.first_video_msg.from)} · нажми, чтобы посмотреть`});
}
if(D.most_reacted) items.push({d:D.most_reacted.date, t:`Сообщение с самой тёплой реакцией`, type:"text",
  x:`«${D.most_reacted.text}» · ${D.most_reacted.reactions} ❤`});
items.sort((a,b)=>new Date(a.d)-new Date(b.d));

function renderMsMedia(it){
  if(it.type==="photos" && it.photos.length){
    return `<div class="ms-photos priv-media">${it.photos.map(p=>
      `<button class="ms-photo-btn" data-src="${p}" aria-label="увеличить"><img src="${p}" loading="lazy" alt=""></button>`).join("")}</div>`;
  }
  if(it.type==="audio"){
    return `<div class="ms-audio priv-media">
      <button class="ms-audio-play" aria-label="слушать">▶</button>
      <div class="ms-audio-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <audio preload="none" src="${it.audio}"></audio>
    </div>`;
  }
  if(it.type==="video"){
    return `<div class="ms-video-wrap priv-media">
      <video class="ms-video" src="${it.video}" playsinline preload="metadata" loop></video>
      <button class="ms-video-play" aria-label="смотреть">▶</button>
    </div>`;
  }
  return "";
}

document.getElementById("milestones-list").innerHTML = items.map(it=>
  `<div class="ms reveal"><div class="ms-date">${fmtDateTime(it.d)}</div>
   <div class="ms-title">${it.t}</div>
   ${renderMsMedia(it)}
   <div class="ms-text priv-blur">${it.x}</div></div>`).join("");

/* wire up interactive milestone media */
document.querySelectorAll(".ms-audio").forEach(w=>{
  const btn = w.querySelector(".ms-audio-play");
  const audio = w.querySelector("audio");
  if(!btn || !audio) return;
  btn.addEventListener("click", ()=>{
    if(audio.paused){ audio.play(); btn.textContent = "❚❚"; w.classList.add("playing"); chime(); }
    else { audio.pause(); btn.textContent = "▶"; w.classList.remove("playing"); }
  });
  audio.addEventListener("ended", ()=>{ btn.textContent = "▶"; w.classList.remove("playing"); });
});
document.querySelectorAll(".ms-video-wrap").forEach(w=>{
  const v = w.querySelector(".ms-video");
  const btn = w.querySelector(".ms-video-play");
  if(!v || !btn) return;
  function play(){
    v.muted = false; v.currentTime = 0;
    chime();
    v.play().then(()=>{ btn.classList.add("hide"); w.classList.add("playing"); })
      .catch(()=>{ v.muted = true; v.play(); btn.classList.add("hide"); w.classList.add("playing"); });
  }
  btn.addEventListener("click", play);
  v.addEventListener("click", ()=>{ if(!v.paused){ v.pause(); btn.classList.remove("hide"); w.classList.remove("playing"); } });
  v.addEventListener("ended", ()=>{ btn.classList.remove("hide"); w.classList.remove("playing"); });
});
const msPhotoView = document.getElementById("ms-photo-view");
const msPhotoImg = document.getElementById("ms-photo-img");
function closeMsPhoto(){
  if(!msPhotoView) return;
  msPhotoView.classList.remove("on"); msPhotoView.setAttribute("aria-hidden","true");
  if(msPhotoImg) msPhotoImg.src = "";
}
function openMsPhoto(src){
  if(!msPhotoView || !msPhotoImg) return;
  msPhotoImg.src = src;
  msPhotoView.classList.add("on"); msPhotoView.setAttribute("aria-hidden","false");
  chime();
}
document.querySelectorAll(".ms-photo-btn").forEach(b=>{
  b.addEventListener("click", ()=> openMsPhoto(b.dataset.src));
});
document.getElementById("ms-photo-close")?.addEventListener("click", closeMsPhoto);
msPhotoView?.addEventListener("click", e=>{ if(e.target===msPhotoView) closeMsPhoto(); });
document.addEventListener("keydown", e=>{
  if(e.key==="Escape" && msPhotoView && msPhotoView.classList.contains("on")) closeMsPhoto();
});

/* ---------- LOVES (маленькие факты и радости, которые я запомнил) ---------- */
const LOVES = [
  {ico:"🌸", t:"Пионы",
    s:"твои любимые, безумно — «цветочками любуюсь». а вот лилии и гортензии — ни в коем случае, «падлы вредные»)"},
  {ico:"🍵", t:"Наша Гавань",
    s:"чайная, куда ты приходишь пить кофе — «в чайную с кофе пускают ?)»"},
  {ico:"🍏", t:"Сидр",
    s:"72 раза за год мы писали «сидр» — твоя работа, наша тема, наш вечер"},
  {ico:"🐈", t:"Мурзик",
    s:"твой серый мурчик, с которым ты «вырубилась в обнимку»"},
  {ico:"🌇", t:"Закаты",
    s:"«если видно закат — посмотри, там оч красиво» — ты первой их всегда замечаешь"},
  {ico:"❄️", t:"Снег и уют",
    s:"«тепло и снег идёт» — твоя любимая погода, под одеялом с чаем"},
  {ico:"🌙", t:"Ночные разговоры",
    s:"18 835 сообщений, из них 3 176 — после полуночи. Спать? Потом."},
  {ico:"🎸", t:"Когда я играю",
    s:"«хочу послушать как ты играешь ) сыграешь мне как-нибудь ?)» — сыграю, солнце"},
  {ico:"🕯️", t:"Нежность",
    s:"это твоё слово №1 — 19 раз ты его прошептала. И столько же в моей голове про тебя."},
  {ico:"♒", t:"Водолей",
    s:"«ты ж мой водолей 💋» — и да, ты правда читаешь гороскопы каждый день, я заметил"},
  {ico:"🎭", t:"Театр",
    s:"«люблю спектакли с Надей Рыбиной» — ты ходишь на них чаще, чем рассказываешь"},
  {ico:"🤗", t:"Тактильность",
    s:"«я очень тактильная) и люблю объятия, поцелуи, прикосновения..» — и я тоже, солнце"},
  {ico:"📝", t:"Список от руки",
    s:"«не люблю приложения 🤣 я по старинке, от руки список желаний на листе»"},
  {ico:"✨", t:"Комфорт и красота",
    s:"«оч долго выбираю и люблю комфорт... важно чтобы было не только удобно, но и красиво»"},
  {ico:"📖", t:"«Война и мир» в дороге",
    s:"слушаешь в аудио, когда долго за рулём — самая неожиданная твоя привычка"},
  {ico:"☕", t:"Кофе",
    s:"«у тебя есть кофе дома?» — спрашиваешь почти всегда, когда собираешься в гости"},
  {ico:"🍲", t:"Готовишь с душой",
    s:"борщ, котлетки, картошка — «но я вкусно жарю картошку 😂на крайний случай»"},
  {ico:"🎯", t:"Варпоинт",
    s:"«на др хорошо, в основном играли)) в варпоинт поиграли» — азартная и весёлая, когда отпускаешь себя"},
  {ico:"👭", t:"Маша",
    s:"твоя самая близкая подруга — почти в каждой второй истории про тебя есть она"},
];
const lovesGrid = document.getElementById("loves-grid");
if(lovesGrid){
  lovesGrid.innerHTML = LOVES.map(l=>
    `<div class="love-card"><span class="lc-ico">${l.ico}</span>
       <div class="lc-t">${l.t}</div>
       <div class="lc-s priv-blur">${l.s}</div></div>`).join("");
}

/* ---------- CONFESSIONS (самые личные, живые строки) ---------- */
const CONFESSIONS = [
  {
    who: "Ты", d: "5 ноября 2025",
    q: "Это откровенно, но скажу, думала сегодня как же было бы здорово вот так вот приходить вечером домой и всей этой вечерней домашней суетой заниматься рядом с тобой) вместе ужинать, время проводить",
    note: "ты сказала это между делом, вечером, как будто просто мысль. а я запомнил каждое слово."
  },
  {
    who: "Ты", d: "26 ноября 2025",
    q: "Я люблю тебя. И мне тоже не хватает твоего общения, твоего тела, тебя! Надо менять режим, чтобы видеться чаще и спать вместе)",
    note: "и мы правда стали чаще видеться. слышишь? это сработало."
  },
  {
    who: "Я", d: "24 января 2026",
    q: "Я очень люблю тебя, все эти дни я чувствовал себя не цельным, чего-то важного не было в моей жизни, счастья не было. Я думаю о тебе 24/7… я правда с ума схожу все эти дни, видимо, я безвозвратно люблю…",
    note: "это я написал тебе после нашей самой тяжёлой ссоры. каждое слово — правда, и сейчас тоже. " +
      "и знаешь, что случилось потом? до этого дня мы писали друг другу в среднем 63 сообщения в день — " +
      "а после стали писать 89. на 40% больше. вот что делает честный разговор."
  },
];
const cfGrid = document.getElementById("confessions-grid");
if(cfGrid){
  cfGrid.innerHTML = CONFESSIONS.map(c=>
    `<div class="cf-card">
       <div class="cf-top"><span class="cf-who">${c.who}</span><span class="cf-date">${c.d}</span></div>
       <p class="cf-quote priv-blur">«${c.q}»</p>
       <p class="cf-note priv-blur">${c.note}</p>
     </div>`).join("");
}

/* ---------- PLACES (наши места) ---------- */
const PLACES = [
  {t:"Топь", when:"11 июля 2025", ico:"🏕️",
    s:"здесь мы встретились. лес, палатки, огромная бутыль сидра и красная шапка."},
  {t:"Чайная Гавань", when:"на Котовского, 16", ico:"🍵",
    s:"твоя чайная, куда ты приходишь с «в чайную с кофе пускают ?)». наше место."},
  {t:"Наша кухня", when:"осень-зима 2025", ico:"🍕",
    s:"«будем новую пиццу делать». борщ, котлетки, картошка — и сидр, конечно."},
  {t:"«В соснах», Заимка", when:"6–8 февраля 2026", ico:"🌲",
    s:"дом, купель, сауна и мы под одеялом. одни из самых тёплых дней в холоде."},
  {t:"Ночь под одеялом", when:"каждую ночь", ico:"🌙",
    s:"3 176 сообщений после полуночи. «нежно нежно», «целую», «доброе утро»."},
];
const pg = document.getElementById("places-grid");
if(pg){
  pg.innerHTML = PLACES.map(p=>
    `<div class="place-card">
       <span class="pl-ico">${p.ico}</span>
       <div class="pl-when">${p.when}</div>
       <div class="pl-t">${p.t}</div>
       <div class="pl-s priv-blur">${p.s}</div>
     </div>`).join("");
}

/* ---------- GALLERY + LIGHTBOX ---------- */
const PHOTOS = window.PHOTOS || [];
if(PHOTOS.length){
  document.getElementById("gallery-grid").innerHTML = PHOTOS.map((p,i)=>
    `<button class="ph" data-i="${i}">
       <img loading="lazy" src="${p.thumb}" alt="${p.date||''}">
       ${p.quote ? '<span class="ph-quote-dot" aria-hidden="true">❝</span>' : ''}
     </button>`).join("");
  document.getElementById("gallery-caption").textContent = PRIV_SAFE
    ? `${PHOTOS.length} лучших моментов из ${nf((D.media&&D.media.photo)||0)} наших фотографий за год`
    : `${PHOTOS.length} лучших моментов из ${nf((D.media&&D.media.photo)||0)} наших фотографий за год · нажми на фото со значком ❝ — там твои слова`;

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-caption");
  const lbQuote = document.getElementById("lb-quote");
  let cur = 0;
  function show(i){
    cur = (i+PHOTOS.length)%PHOTOS.length;
    const p = PHOTOS[cur];
    lbImg.src = p.full;
    lbCap.textContent = p.date || "";
    if(lbQuote){
      if(p.quote){
        lbQuote.textContent = `«${p.quote}»`;
        lbQuote.classList.add("on");
      } else {
        lbQuote.textContent = "";
        lbQuote.classList.remove("on");
      }
    }
  }
  function open(i){ show(i); lb.classList.add("on"); lb.setAttribute("aria-hidden","false"); chime(); }
  function close(){ lb.classList.remove("on"); lb.setAttribute("aria-hidden","true"); lbImg.src=""; }
  document.getElementById("gallery-grid").addEventListener("click", e=>{
    const b = e.target.closest(".ph"); if(b) open(+b.dataset.i);
  });
  document.getElementById("lb-close").addEventListener("click", close);
  document.getElementById("lb-prev").addEventListener("click", e=>{e.stopPropagation();show(cur-1);});
  document.getElementById("lb-next").addEventListener("click", e=>{e.stopPropagation();show(cur+1);});
  lb.addEventListener("click", e=>{ if(e.target===lb) close(); });
  document.addEventListener("keydown", e=>{
    if(!lb.classList.contains("on")) return;
    if(e.key==="Escape") close();
    else if(e.key==="ArrowLeft") show(cur-1);
    else if(e.key==="ArrowRight") show(cur+1);
  });
} else {
  const g = document.getElementById("gallery");
  if(g) g.style.display = "none";
}

/* ---------- CLOSING / LETTER ---------- */
document.getElementById("closing-text").innerHTML =
  `<p>Солнце,</p>
   <p>если честно, ровно год назад на Топи я и не думал, что так выйдет) просто
      встретились под соснами, потом написал тебе — а сейчас без тебя уже никак.</p>
   <p><i>закрой на секунду глаза.</i> вспомни этот запах костра и сидра, холодный
      воздух, который забирался под куртку, и то, как ты стояла в жёлтой худи и
      красной шапке — я тогда украдкой смотрел и не мог понять, почему не могу
      отвести взгляд. вот прямо это чувство — оно никуда не делось, оно просто
      стало больше.</p>
   <p>за этот год мы наболтали <b>${nf(D.totals.messages)}</b> сообщений и
      <b>${nf(loveCount("люблю"))}</b> раз сказали «люблю». <b>${D.streak.days}</b> дней подряд
      без единого пропуска. засыпали в переписке, просыпались с «доброе утро»)
      я бы всё это повторил, честно.</p>
   <p>я люблю в тебе всё — как ты первой замечаешь закаты, как ты «ммм»
      реагируешь на вкусное, как «нежно нежно» пишешь мне вечером, как ты
      обнимаешь Мурзика и как ты умеешь делать «уютно» из ничего.
      ты моё любимое «сегодня» и моё «завтра» тоже.</p>
   <p>и это правда только начало — у меня на тебя ещё большие планы) кажется,
      скоро нам предстоит куда-то далеко-далеко вместе. пока это секрет, но
      готовь чемодан, солнце.</p>
   <p>с годовщиной, любовь моя ❤</p>`;

/* ---------- SHAREABLE CARD ---------- */
const shareStats = [
  {v:`${nf(D.span.days)}`, l:"дней вместе"},
  {v:`${nf(D.totals.messages)}`, l:"сообщений"},
  {v:`${nf(loveCount("люблю"))}`, l:"раз «люблю»"},
  {v:`${D.streak.days}`, l:"дней без пропуска"},
];
const scRow = document.getElementById("sc-row");
if(scRow){
  scRow.innerHTML = shareStats.map(s=>
    `<div class="sc-stat"><div class="sc-v">${s.v}</div><div class="sc-l">${s.l}</div></div>`).join("");
}
function drawShareCard(){
  const W = 1000, H = 1250, scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W*scale; canvas.height = H*scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, "#12241a");
  g.addColorStop(.55, "#1c3324");
  g.addColorStop(1, "#3a2a1c");
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  const glow = ctx.createRadialGradient(W/2,H*0.32,10,W/2,H*0.32,W*0.62);
  glow.addColorStop(0, "rgba(255,167,110,.35)");
  glow.addColorStop(1, "rgba(255,167,110,0)");
  ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e7c8a1";
  ctx.font = "26px Georgia, serif";
  ctx.fillText("11 июля 2025 — 11 июля 2026", W/2, 150);

  ctx.fillStyle = "#fff6ec";
  ctx.font = "italic 700 96px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText("Наш год", W/2, 270);

  const rowY = 470, cardW = 400, gapX = 40, cols = 2, gapY = 190;
  shareStats.forEach((s,i)=>{
    const col = i % cols, row = Math.floor(i/cols);
    const cx = W/2 + (col===0 ? -cardW/2-gapX/2 : cardW/2+gapX/2);
    const cy = rowY + row*gapY;
    ctx.fillStyle = "#ffd9a8";
    ctx.font = "700 64px Georgia, serif";
    ctx.fillText(s.v, cx, cy);
    ctx.fillStyle = "rgba(255,246,236,.75)";
    ctx.font = "24px Georgia, serif";
    ctx.fillText(s.l, cx, cy+42);
  });

  ctx.fillStyle = "#fff6ec";
  ctx.font = "italic 44px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText("Андрей ❤ Лена", W/2, H-90);

  return canvas;
}
const scSaveBtn = document.getElementById("sc-save");
if(scSaveBtn){
  scSaveBtn.addEventListener("click", async ()=>{
    try{ if(document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){}
    const canvas = drawShareCard();
    canvas.toBlob(blob=>{
      if(!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "nash-god.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
    }, "image/png");
  });
}

/* ---------- HUG (тёплое, спокойное завершение — не ещё один всплеск, а мягкая посадка) ---------- */
(function initHug(){
  const circle = document.getElementById("hug-circle");
  const label = document.getElementById("hug-label");
  if(!circle || !label) return;
  let holding = false, doneAt = null, beatTimer = null, progressTimer = null;
  const HOLD_MS = 2200;

  function beat(){
    hapticPulse([18, 90, 12]); // короткий-длинный-короткий — как пульс
  }
  function start(e){
    e.preventDefault();
    if(doneAt) return;
    holding = true;
    circle.classList.add("holding");
    label.textContent = "держи…";
    beat();
    beatTimer = setInterval(beat, 900);
    progressTimer = setTimeout(finish, HOLD_MS);
  }
  function cancel(){
    if(!holding) return;
    holding = false;
    circle.classList.remove("holding");
    clearInterval(beatTimer);
    clearTimeout(progressTimer);
    if(!doneAt) label.textContent = "нажми и подержи";
  }
  function finish(){
    holding = false; doneAt = Date.now();
    circle.classList.remove("holding");
    clearInterval(beatTimer);
    chime();
    hapticPulse([25, 60, 25, 60, 100]);
    label.textContent = "обнял) до следующей годовщины, любовь моя ❤";
    label.classList.add("done");
  }
  circle.addEventListener("pointerdown", start);
  circle.addEventListener("pointerup", cancel);
  circle.addEventListener("pointerleave", cancel);
  circle.addEventListener("pointercancel", cancel);
  circle.addEventListener("keydown", e=>{
    if((e.key==="Enter" || e.key===" ") && !doneAt){ e.preventDefault(); start(e); setTimeout(cancel, HOLD_MS+50); }
  });
})();

/* ---------- VOICE NOTE (появляется сам, если файл существует) ---------- */
(function initVoiceNote(){
  const wrap = document.getElementById("voice-note");
  const audio = document.getElementById("voice-audio");
  const btn = document.getElementById("voice-play");
  if(!wrap || !audio || !btn) return;
  let ready = false;
  audio.addEventListener("loadedmetadata", ()=>{
    if(audio.duration && isFinite(audio.duration)){ ready = true; wrap.hidden = false; }
  });
  audio.addEventListener("error", ()=>{ wrap.hidden = true; });
  btn.addEventListener("click", ()=>{
    if(!ready) return;
    if(audio.paused){ audio.play(); btn.textContent = "❚❚"; wrap.classList.add("playing"); chime(); }
    else { audio.pause(); btn.textContent = "▶"; wrap.classList.remove("playing"); }
  });
  audio.addEventListener("ended", ()=>{ btn.textContent = "▶"; wrap.classList.remove("playing"); });
})();

/* ---------- SECRET (тройной тап по сердечку в письме — маленькая пасхалка) ---------- */
(function initLetterSecret(){
  const heart = document.getElementById("letter-heart");
  const secret = document.getElementById("letter-secret");
  if(!heart || !secret) return;
  let taps = 0, revealed = false, timer = null;
  const MESSAGE = "нашла) это моя маленькая тайна: я готовился к этому дню дольше, чем ты думаешь — " +
    "пересмотрел всю нашу переписку, все фото, каждое голосовое. и знаешь что? " +
    "я бы прожил этот год ещё раз, ни секунды не меняя. люблю тебя, любовь моя. по-настоящему.";
  heart.addEventListener("click", ()=>{
    if(revealed) return;
    taps++;
    clearTimeout(timer);
    timer = setTimeout(()=>{ taps = 0; }, 1200);
    heart.classList.add("tapped");
    setTimeout(()=>heart.classList.remove("tapped"), 200);
    if(taps >= 3){
      revealed = true;
      secret.hidden = false;
      secret.textContent = MESSAGE;
      requestAnimationFrame(()=> secret.classList.add("on"));
      chime(); softBurst(); hapticPulse([15,40,15,40,60]);
    }
  });
  heart.addEventListener("keydown", e=>{
    if(e.key==="Enter" || e.key===" "){ e.preventDefault(); heart.click(); }
  });
})();

const ps = document.getElementById("letter-ps");
if(ps){
  ps.innerHTML = `<i>P.S.</i> этот сайт я собрал сам — весь наш год: сообщения, фото, все цифры.
    всё живёт только на моём ноуте, никто больше это не увидит) только ты и я.`;
}

/* ---------- REVEAL + ANIMATIONS ---------- */
function animateCount(el){
  const target = +el.getAttribute("data-count");
  const dur = 1500, t0 = performance.now();
  function step(now){
    const p = Math.min((now-t0)/dur,1);
    const e = 1-Math.pow(1-p,3);
    el.textContent = nf(Math.round(target*e));
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function fireSection(sec){
  sec.querySelectorAll("[data-count]").forEach(animateCount);
  sec.querySelectorAll(".bar-fill,.lf").forEach(b=>b.style.width=b.getAttribute("data-w")+"%");
  sec.querySelectorAll(".bar").forEach(b=>b.style.height=b.getAttribute("data-h")+"%");
}
const revealEls = Array.from(document.querySelectorAll(".reveal"));
function doReveal(el){
  if(!el || el.classList.contains("in")) return;
  el.classList.add("in");
  const sec = el.closest("section");
  if(sec && !sec.dataset.fired){ sec.dataset.fired="1"; fireSection(sec); }
}
function revealVisible(){
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for(const el of revealEls){
    const r = el.getBoundingClientRect();
    if(r.top < vh*0.95 && r.bottom > -50) doReveal(el);
  }
}
if("IntersectionObserver" in window){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ doReveal(en.target); io.unobserve(en.target); } });
  },{threshold:0, rootMargin:"0px 0px -8% 0px"});
  revealEls.forEach(el=>io.observe(el));
} else {
  revealEls.forEach(doReveal);
}
window.addEventListener("scroll", revealVisible, {passive:true});
window.addEventListener("resize", revealVisible);
window.addEventListener("load", revealVisible);
revealVisible();
document.querySelectorAll("#hero [data-count]").forEach(animateCount);

/* fire a small heart burst when the letter section reveals — emotional peak */
let closingBursted = false;
function watchClosingBurst(){
  const c = document.getElementById("closing");
  if(!c || closingBursted) return;
  const r = c.getBoundingClientRect();
  if(r.top < window.innerHeight*0.6){
    closingBursted = true;
    softBurst();
    hapticPulse([20,50,20]);
  }
}
window.addEventListener("scroll", watchClosingBurst, {passive:true});

/* final salute — fires once when she scrolls all the way to the very end (after the share card) */
let finaleFired = false;
function watchFinaleBurst(){
  const s = document.getElementById("share");
  if(!s || finaleFired) return;
  const r = s.getBoundingClientRect();
  if(r.bottom < window.innerHeight*0.75){
    finaleFired = true;
    hapticPulse([25,55,25,55,90]);
    burstHearts();
    setTimeout(softBurst, 350);
    setTimeout(softBurst, 750);
  }
}
window.addEventListener("scroll", watchFinaleBurst, {passive:true});

/* ---------- PROGRESS BAR ---------- */
const progressFill = document.getElementById("progress-fill");
function updateProgress(){
  if(!progressFill) return;
  const h = document.documentElement;
  const scrollable = (h.scrollHeight - h.clientHeight) || 1;
  const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
  progressFill.style.width = pct + "%";
}
window.addEventListener("scroll", updateProgress, {passive:true});
window.addEventListener("resize", updateProgress);
window.addEventListener("load", updateProgress);
updateProgress();

/* ---------- PARALLAX (hero mascot — легкая глубина при скролле) ---------- */
const heroMascotEl = document.querySelector(".hero .hero-mascot");
const REDUCE_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(heroMascotEl && !REDUCE_MOTION){
  function updateParallax(){
    const r = heroMascotEl.closest(".hero").getBoundingClientRect();
    if(r.bottom < 0 || r.top > window.innerHeight) return;
    const shift = Math.max(-40, Math.min(40, window.scrollY * 0.12));
    heroMascotEl.style.setProperty("--parallax-y", shift + "px");
  }
  window.addEventListener("scroll", updateParallax, {passive:true});
  window.addEventListener("load", updateParallax);
  updateParallax();
}

/* ---------- SOUND FX (тихий колокольчик при открытии медиа, без внешних файлов) ---------- */
let audioCtx = null;
function chime(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [880, 1320].forEach((freq, i)=>{
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.05, t0 + 0.015 + i*0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6 + i*0.05);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(t0 + i*0.05);
      osc.stop(t0 + 0.7 + i*0.05);
    });
  }catch(e){}
}

/* ---------- FLOATING HEARTS ---------- */
const hc = document.getElementById("hearts");
const GLYPHS = ["❤","💕","🤍","💗","✨"];
for(let i=0;i<14;i++){
  const s = document.createElement("span");
  s.className="fh";
  s.textContent = GLYPHS[i%GLYPHS.length];
  s.style.left = Math.random()*100+"vw";
  s.style.fontSize = (10+Math.random()*26)+"px";
  s.style.animationDuration = (10+Math.random()*14)+"s";
  s.style.animationDelay = (-Math.random()*20)+"s";
  hc.appendChild(s);
}
// gentle falling petals (she loves flowers)
for(let i=0;i<16;i++){
  const p = document.createElement("span");
  p.className="petal";
  const sz = 8+Math.random()*12;
  p.style.left = Math.random()*100+"vw";
  p.style.width = sz+"px"; p.style.height = sz+"px";
  p.style.animationDuration = (12+Math.random()*16)+"s";
  p.style.animationDelay = (-Math.random()*24)+"s";
  hc.appendChild(p);
}
// snowflakes (her "тепло и снег идёт" love)
const snow = document.getElementById("snow");
if(snow){
  const GS = ["❄","❅","❆","·","·","*"];
  for(let i=0;i<24;i++){
    const s = document.createElement("span");
    s.className = "snowflake";
    s.textContent = GS[i%GS.length];
    s.style.left = Math.random()*100+"vw";
    s.style.fontSize = (8+Math.random()*14)+"px";
    s.style.animationDuration = (14+Math.random()*18)+"s";
    s.style.animationDelay = (-Math.random()*28)+"s";
    snow.appendChild(s);
  }
}

/* ---------- INTRO / GIFT ---------- */
function burstHearts(){
  const c = document.getElementById("burst");
  const g = ["❤","💕","💗","🌸","✨","🌷","🥰","🍃"];
  const reach = Math.min(window.innerWidth, 760) * 0.62;
  for(let i=0;i<48;i++){
    const s = document.createElement("span");
    s.className = "burst-h";
    s.textContent = g[i % g.length];
    const ang = Math.random()*Math.PI*2;
    const dist = 110 + Math.random()*reach;
    s.style.setProperty("--x", (Math.cos(ang)*dist).toFixed(0)+"px");
    s.style.setProperty("--y", (Math.sin(ang)*dist - 50).toFixed(0)+"px");
    s.style.setProperty("--s", (0.6+Math.random()*1.5).toFixed(2));
    s.style.setProperty("--r", (Math.random()*140-70).toFixed(0)+"deg");
    s.style.setProperty("--d", (1+Math.random()*1.2).toFixed(2)+"s");
    s.style.fontSize = (14+Math.random()*28)+"px";
    c.appendChild(s);
    requestAnimationFrame(()=>s.classList.add("go"));
    setTimeout(()=>s.remove(), 2600);
  }
}

/* softer, smaller burst for the letter reveal — emotional accent, not fireworks */
function softBurst(){
  const c = document.getElementById("burst");
  if(!c) return;
  const g = ["❤","🕯️","✨","💗","🌷"];
  for(let i=0;i<20;i++){
    const s = document.createElement("span");
    s.className = "burst-h";
    s.textContent = g[i % g.length];
    const ang = Math.random()*Math.PI*2;
    const dist = 60 + Math.random()*200;
    s.style.setProperty("--x", (Math.cos(ang)*dist).toFixed(0)+"px");
    s.style.setProperty("--y", (Math.sin(ang)*dist - 30).toFixed(0)+"px");
    s.style.setProperty("--s", (0.5+Math.random()*1.1).toFixed(2));
    s.style.setProperty("--r", (Math.random()*100-50).toFixed(0)+"deg");
    s.style.setProperty("--d", (1.3+Math.random()*1.5).toFixed(2)+"s");
    s.style.fontSize = (12+Math.random()*20)+"px";
    s.style.top = "auto";
    s.style.bottom = "18%";
    c.appendChild(s);
    requestAnimationFrame(()=>s.classList.add("go"));
    setTimeout(()=>s.remove(), 3200);
  }
}

/* ---------- MUSIC: two tracks with a smooth cross-fade ----------
   A = Gary Jules — Mad World (opening, most of the site)
   B = Blouse — Into Black  (emotional peak: on entering «loves» section)
*/
const musicA = document.getElementById("bg-music-a");
const musicB = document.getElementById("bg-music-b");
const musicBtn = document.getElementById("music-toggle");
const mtTrack = document.getElementById("mt-track");
const TRACKS = {
  a: {name:"Mad World · Gary Jules"},
  b: {name:"Into Black · Blouse"},
};
const VOL = 0.55;
let currentKey = "a"; // which one is active
let userMuted = false;
let started = false;

function setMusicIcon(on){
  musicBtn.classList.toggle("on", on);
  musicBtn.querySelector(".mt-icon").textContent = on ? "♪" : "♪̸";
}
function setLabel(key){
  if(mtTrack) mtTrack.textContent = TRACKS[key]?.name || "";
}
function fadeTo(el, target, ms){
  if(!el) return;
  const start = el.volume, t0 = performance.now();
  function step(now){
    const p = Math.min((now - t0) / ms, 1);
    el.volume = start + (target - start) * p;
    if(p < 1) requestAnimationFrame(step);
    else if(target <= 0.001) { try { el.pause(); } catch(e){} }
  }
  requestAnimationFrame(step);
}
function startMusic(){
  if(started) return; started = true;
  if(!musicA) return;
  musicA.volume = 0;
  try { musicA.currentTime = 3; } catch(e){}
  musicA.play().then(()=>{
    fadeTo(musicA, VOL, 1600);
    musicBtn.classList.add("show"); setMusicIcon(true); setLabel("a");
  }).catch(()=>{ musicBtn.classList.add("show"); setMusicIcon(false); });
  /* трек B пока не нужен — начинаем тихо буферизовать его в фоне,
     чтобы к моменту переключения (секция "loves") он был уже готов */
  if(musicB){
    try{ musicB.preload = "auto"; musicB.load(); }catch(e){}
  }
}
function switchToB(){
  if(currentKey === "b" || !musicB) return;
  currentKey = "b";
  if(userMuted) return;
  musicB.volume = 0;
  musicB.play().then(()=>{
    fadeTo(musicA, 0, 2400);
    fadeTo(musicB, VOL, 2400);
    setLabel("b");
  }).catch(()=>{});
}
function activeEl(){ return currentKey === "a" ? musicA : musicB; }
if(musicBtn){
  musicBtn.addEventListener("click", ()=>{
    const el = activeEl();
    if(el.paused){ userMuted = false; el.play(); setMusicIcon(true); }
    else { userMuted = true; el.pause(); setMusicIcon(false); }
  });
}
// switch tracks when the emotional peak enters the viewport (loves section)
function watchMusicSwitch(){
  const anchor = document.getElementById("loves") || document.getElementById("closing");
  if(!anchor) return;
  const r = anchor.getBoundingClientRect();
  if(r.top < window.innerHeight * 0.7){
    switchToB();
    window.removeEventListener("scroll", watchMusicSwitch);
  }
}
window.addEventListener("scroll", watchMusicSwitch, {passive:true});

const intro = document.getElementById("intro");
const gift = document.getElementById("gift");
let opened = false;

/* тихо прогреваем миниатюры галереи — пока крутится заставка с подарком */
const _photoWarmup = (window.PHOTOS || []).map(p=>{
  const im = new Image(); im.src = p.thumb; return im;
});

function playGiftMontage(onDone){
  const wrap = document.getElementById("gift-video");
  const skip = document.getElementById("gv-skip");
  const montageImg = document.getElementById("gv-montage");
  if(!wrap){ onDone && onDone(); return; }

  wrap.classList.add("show");
  wrap.setAttribute("aria-hidden","false");

  let finished = false;
  let phase = "montage";

  function finish(){
    if(finished) return; finished = true;
    wrap.classList.add("gone");
    setTimeout(()=>{
      wrap.classList.remove("show","gone");
      wrap.setAttribute("aria-hidden","true");
      onDone && onDone();
    }, 400);
  }

  const photos = window.PHOTOS || [];
  if(!montageImg || !photos.length){ finish(); return; }

  montageImg.classList.add("on");
  let i = 0;
  const total = photos.length;
  function step(){
    if(phase !== "montage") return;
    if(i >= total){
      montageImg.classList.remove("on","pulse");
      finish();
      return;
    }
    montageImg.src = photos[i].thumb;
    montageImg.classList.remove("pulse");
    void montageImg.offsetWidth;
    montageImg.classList.add("pulse");
    i++;
    const t = i / total;
    const speed = t > 0.92 ? 170 : 70;
    setTimeout(step, speed);
  }
  if(skip){
    skip.onclick = ()=>{
      phase = "done";
      if(montageImg) montageImg.classList.remove("on","pulse");
      finish();
    };
  }
  step();
}

function revealSite(){
  startMusic();
  setTimeout(()=>{
    intro.classList.add("gone");
    document.body.classList.remove("intro-open");
  }, 200);
}

function hapticPulse(pattern){
  try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch(e){}
}

function openGift(){
  if(opened) return;
  opened = true;
  gift.classList.add("opening");
  burstHearts();
  hapticPulse([30,60,30,60,80]);
  const hint = document.getElementById("intro-hint");
  if(hint) hint.style.opacity = "0";
  setTimeout(()=>{
    playGiftMontage(revealSite);
  }, 900);
}
if(gift){
  gift.addEventListener("click", openGift);
  gift.addEventListener("keydown", e=>{
    if(e.key==="Enter" || e.key===" "){ e.preventDefault(); openGift(); }
  });
}
