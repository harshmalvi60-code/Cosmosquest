/**
 * Builds the full HTML skeleton once and injects it into #app. Every other
 * UI module queries into this markup. Keeping the structure in one place
 * mirrors the original single-file layout, just organised.
 */
export function buildDOM(root) {
  root.innerHTML = `
  <div id="scene"></div>

  <div id="start">
    <div class="stars" id="twinkles"></div>
    <div class="rocket">🚀</div>
    <h1 class="logo">ExploraQuest</h1>
    <p class="tag">Six worlds to discover. Explore <b>real 3D scenes</b>, tap glowing subjects,
      complete missions, earn ⭐ stars and 🏅 badges, and become a <b>Master Explorer</b>.</p>
    <button id="playBtn">▶ &nbsp;Start Exploring</button>
    <p class="startHint">Drag to look around · Pinch or scroll to zoom · Tap anything glowing</p>
  </div>

  <div id="hub">
    <div class="hubTop">
      <div>
        <div class="hubTitle">Choose a World</div>
        <div class="worldCount" id="worldCount">1 of 20 worlds unlocked</div>
      </div>
      <div class="hubProfile">
        <div class="hubStat" id="hubRank">🧭 <span>Junior</span></div>
        <div class="hubStat">⭐ <span id="hubStars">0</span></div>
        <div class="hubStat">🔥 <span id="hubStreak">0</span> <small>day</small></div>
        <div class="hubStat">🏅 <span id="hubBadges">0</span></div>
      </div>
    </div>
    <button class="dailyCard" id="dailyCard">
      <div class="dcGlow"></div>
      <div class="dcIcon" id="dcIcon">🎯</div>
      <div class="dcMain">
        <div class="dcLabel">Daily Challenge · <span id="dcBonus">+3 ⭐ bonus</span></div>
        <div class="dcTitle" id="dcTitle">Tap to play today's mission!</div>
      </div>
      <div class="dcStatus" id="dcStatus">▶</div>
    </button>
    <div id="worldSections"></div>
    <div class="hubBtnRow">
      <button class="hubBtn" id="hubCollectBtn">🏅 My Collection</button>
    </div>
  </div>

  <div id="hud">
    <div class="chip">
      <span class="rankIcon" id="rankIcon">🧭</span>
      <div><div class="rankName" id="rankName">Junior Explorer</div><div class="rankSub" id="rankSub">Rank 1 of 5</div></div>
    </div>
    <div class="chip xpWrap"><div style="width:100%"><div style="font-size:11px;color:var(--dim)" id="xpLabel">XP 0 / 80</div>
      <div class="xpBar"><div class="xpFill" id="xpFill"></div></div></div></div>
    <div class="chip starChip">⭐ <span id="starCount">0</span></div>
    <div class="chip streakChip" id="streakChip">🔥 <span id="streakCount">0</span></div>
    <div class="chip titleChip" id="titleChip"><span id="titleText"></span></div>
    <div id="hudRight">
      <button id="collectBtn" title="My Collection">🏅</button>
      <button id="backHub">🗺️ <span class="lbl">Worlds</span></button>
    </div>
  </div>
  <div id="hint">Tap a glowing subject to open its mission ✨</div>

  <div id="panel">
    <div class="pHead">
      <div class="pEmoji" id="pEmoji">🪐</div>
      <div><div class="pName" id="pName">Subject</div><div class="pType" id="pType">Type</div></div>
      <button class="pClose" id="pClose">✕</button>
    </div>
    <div class="pBody" id="pBody"></div>
    <div class="pFoot"><button class="missionBtn" id="missionBtn">🎯 Start Mission</button></div>
  </div>

  <div id="brief"><div class="bCard">
    <div class="bEmoji" id="bEmoji">🎯</div>
    <div class="bLabel">Mission Briefing</div>
    <div class="bText" id="bText"></div>
    <button class="bBtn" id="bBtn">Let's Go! →</button>
  </div></div>

  <div id="quiz"><div class="qCard">
    <div class="qTop">
      <div class="disp" style="color:var(--accent);font-size:17px" id="qTitle">Mission</div>
      <div class="qDots" id="qDots"></div>
    </div>
    <div class="qKind" id="qKind"></div>
    <div class="qQ" id="qQ"></div>
    <div id="qOpts"></div>
    <div class="qFeed" id="qFeed"></div>
  </div></div>

  <div id="reward"><div class="rCard">
    <div class="rBig" id="rBig">🏅</div>
    <div class="rTitle" id="rTitle">Mission Complete!</div>
    <div class="rSub" id="rSub"></div>
    <div class="rStars" id="rStars"></div>
    <div id="rBadgeWrap"></div>
    <button class="rBtn" id="rBtn">Keep Exploring →</button>
  </div></div>

  <div id="collection">
    <div class="colHead">
      <div class="colTitle">🏅 My Collection</div>
      <button class="colClose" id="colClose">✕</button>
    </div>
    <div class="colCount" id="colCount"></div>
    <div id="colBody"></div>
  </div>

  <div id="celebrate">
    <div class="cvTitle" id="cvTitle">World Complete!</div>
    <div class="cvSub" id="cvSub"></div>
    <button class="cvBtn" id="cvBtn">🎉 Awesome!</button>
  </div>

  <div id="toast"></div>
  `;

  // Seed the twinkling start-screen stars.
  const tw = root.querySelector('#twinkles');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 2.4 + 's';
    tw.appendChild(s);
  }
}

export const $ = (id) => document.getElementById(id);

let toastTimer = null;
export function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
