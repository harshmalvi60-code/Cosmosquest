import './style.css';
import { buildDOM, $, toast } from './ui/dom.js';
import { loadState, saveState } from './game/state.js';
import { recordMission, worldProgress, canAfford, unlockWorld,
  dailyChallenge, markDailyDone, markWorldVisited } from './game/profile.js';
import { buildQuiz, difficultyFor } from './game/quiz.js';
import { createEngine } from './engine/index.js';
import { WORLDS } from './worlds/index.js';
import { refreshHUD } from './ui/hud.js';
import { renderHub, showHub, hideHub } from './ui/hub.js';
import { openPanel, closePanel } from './ui/panel.js';
import { showBriefing, runQuiz } from './ui/quiz.js';
import { showReward } from './ui/reward.js';
import { renderCollection } from './ui/collection.js';
import { celebrateWorld } from './ui/celebrate.js';
import { sfx, startMusic, setMood, unlockAudio, toggleMute, isMuted } from './game/audio.js';
import { confetti } from './ui/fx.js';
import { showAvatarPicker, coach, coachHide, showLevelUp, showAchievements } from './ui/premium.js';
import { openSettings, closeSettings } from './ui/settings.js';
import { renderJourney, closeJourney } from './ui/journey.js';
import { checkAchievements } from './game/achievements.js';

/* ---------- boot ---------- */
buildDOM(document.getElementById('app'));

// Installable app + real offline play (the start screen promises it).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => { /* offline still optional */ });
  });
}

const state = loadState();
saveState(state);

const engine = createEngine($('scene'), { onPick });

let currentWorld = null;
let currentSubjectKey = null;

refreshHUD(state);

/* ---------- theming ---------- */
function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }
function applyTheme(world) {
  const t = world.theme || {};
  const root = document.documentElement.style;
  root.setProperty('--accent', hex(t.primary ?? 0x4DE3FF));
  root.setProperty('--accent2', hex(t.secondary ?? t.primary ?? 0xB26CFF));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hex(t.bg ?? 0x070B1F));
}

/* ---------- sound ---------- */
$('muteBtn').textContent = isMuted() ? '🔇' : '🔊';
$('muteBtn').onclick = () => { const m = toggleMute(); $('muteBtn').textContent = m ? '🔇' : '🔊'; sfx.tap(); };

/* ---------- screen flow ---------- */
$('playBtn').onclick = () => {
  unlockAudio();
  if (!isMuted()) startMusic();
  sfx.start();
  $('start').classList.add('hide');
  // First run ever: pick an explorer buddy, then enter the hub with a coach-mark.
  if (!state.avatar) {
    setTimeout(() => showAvatarPicker(state, (avatar) => {
      state.avatar = avatar;
      saveState(state);
      refreshHUD(state);
      openHub();
      coachHub();
    }), 350);
  } else {
    openHub();
  }
};

/* ---------- onboarding coach-marks ---------- */
// Tapping the coach overlay always dismisses the current tip.
$('coach').onclick = () => { sfx.tap(); coachHide(); };

function coachHub() {
  if (state.flags.coachedHub) return;
  state.flags.coachedHub = true; saveState(state);
  setTimeout(() => coach('Welcome, Explorer! 🌍<br>Tap a glowing world to dive in. Earn ⭐ stars to unlock all 20!'), 500);
}
function coachWorld() {
  if (state.flags.coachedWorld) return;
  state.flags.coachedWorld = true; saveState(state);
  setTimeout(() => coach('Tap a glowing subject to open its mission! ✨', '#hint', { placement: 'top' }), 700);
}

function renderHubNow() {
  renderHub(state, WORLDS, { onEnter: enterWorld, onLockedTap: handleLockedTap });
}
function refreshHubIfOpen() {
  if ($('hub').classList.contains('open')) renderHubNow();
}
function openHub() {
  renderHubNow();
  showHub();
}

function handleLockedTap(world) {
  if (world.comingSoon) { toast('🔨 That world is coming soon!'); return; }
  if (canAfford(state, world)) {
    unlockWorld(state, world);
    saveState(state);
    renderHubNow();
    sfx.unlock();
    confetti(window.innerWidth / 2, window.innerHeight / 2, 40);
    toast(`🔓 ${world.name} unlocked! Dive in!`);
    celebrateNewAchievements(1200);
  } else {
    sfx.wrong();
    toast(`Earn ${world.unlockCost - state.stars} more ⭐ to unlock ${world.name}!`);
  }
}

function enterWorld(world) {
  currentWorld = world;
  markWorldVisited(state, world); // clears the "NEW" tag next time the hub renders
  saveState(state);
  applyTheme(world);
  setMood(world.key);
  sfx.whoosh();
  engine.loadWorld(world, { isDone: (k) => !!(state.done[world.key] && state.done[world.key][k]) });
  hideHub();
  document.body.classList.add('playing');
  $('hint').textContent = `Exploring ${world.name} — tap a glowing subject! ${world.icon}`;
  refreshHUD(state);
  coachWorld();
}

function onPick(key, mesh) {
  if (!currentWorld) return;
  coachHide();
  currentSubjectKey = key;
  sfx.select();
  engine.focusOn(mesh);
  openPanel(state, currentWorld, key, { onMission: () => { sfx.open(); startMission(currentWorld, key); } });
}

$('pClose').onclick = () => { sfx.tap(); closePanel(); engine.resetView(); };

// Back out of a mission briefing → return to the subject panel (or the hub if
// the mission was launched from the daily challenge card).
$('bClose').onclick = () => {
  sfx.tap();
  $('brief').classList.remove('open');
  const inWorld = !$('hub').classList.contains('open');
  if (inWorld && currentWorld && currentSubjectKey) {
    openPanel(state, currentWorld, currentSubjectKey, { onMission: () => { sfx.open(); startMission(currentWorld, currentSubjectKey); } });
  }
};
// Quit a quiz in progress → back to exploring (progress on this mission is dropped).
$('qClose').onclick = () => {
  sfx.tap();
  $('quiz').classList.remove('open');
  if (!$('hub').classList.contains('open')) engine.resetView();
};
$('backHub').onclick = () => { sfx.whoosh(); closePanel(); openHub(); };
$('collectBtn').onclick = () => { sfx.open(); renderCollection(state, WORLDS); };

/* ---------- app shell: bottom tab bar ---------- */
// The hub area behaves like a real app: Worlds / Journey / Badges / Grown-ups
// are tabs on a persistent bottom bar (only visible outside 3D play).
function setTab(name) {
  ['Worlds', 'Journey', 'Badges', 'Grownups'].forEach((t) => {
    $('tab' + t).classList.toggle('on', t === name);
  });
}
function closeShellScreens() {
  closeJourney();
  $('collection').classList.remove('open');
  closeSettings();
}
$('tabWorlds').onclick = () => { sfx.tap(); closeShellScreens(); setTab('Worlds'); openHub(); };
$('tabJourney').onclick = () => { sfx.open(); closeShellScreens(); setTab('Journey'); renderJourney(state, WORLDS); };
$('tabBadges').onclick = () => {
  sfx.open(); closeShellScreens(); setTab('Badges');
  renderCollection(state, WORLDS);
  // renderCollection wires its own ✕; extend it to restore the Worlds tab.
  $('colClose').onclick = () => { sfx.tap(); $('collection').classList.remove('open'); setTab('Worlds'); };
};
$('tabGrownups').onclick = () => {
  sfx.tap();
  openSettings(state, {
    onToggleSound: () => {
      const m = toggleMute();
      $('muteBtn').textContent = m ? '🔇' : '🔊';
      if (!m) { startMusic(); sfx.tap(); }
    },
    onReset: () => {
      try { localStorage.removeItem('exploraquest_save'); } catch { /* ignore */ }
      location.reload();
    },
  });
};
$('setClose').onclick = () => { sfx.tap(); closeSettings(); };
$('jrnClose').onclick = () => { sfx.tap(); closeJourney(); setTab('Worlds'); };

/* ---------- hardware / browser back button ---------- */
// Pressing the phone's back button peels the top-most layer — quiz → briefing
// → panel → world → hub — exactly like a native app. At the hub, back stays
// trapped inside the app instead of leaving the page mid-game.
history.replaceState({ eq: true }, '');
history.pushState({ eq: true }, '');
function backOnce() {
  const open = (id) => $(id).classList.contains('open');
  if (open('settings')) { sfx.tap(); closeSettings(); return true; }
  if (open('levelup')) { $('luBtn').click(); return true; }
  if (open('celebrate')) { $('cvBtn').click(); return true; }
  if (open('reward')) { $('rBtn').click(); return true; }
  if (open('quiz')) { $('qClose').click(); return true; }
  if (open('brief')) { $('bClose').click(); return true; }
  if (open('coach')) { coachHide(); return true; }
  if (open('collection')) { sfx.tap(); $('collection').classList.remove('open'); setTab('Worlds'); return true; }
  if (open('journey')) { sfx.tap(); closeJourney(); setTab('Worlds'); return true; }
  if (open('panel')) { $('pClose').click(); return true; }
  if (document.body.classList.contains('playing')) { $('backHub').click(); return true; }
  return false; // hub or start screen — nothing to peel
}
window.addEventListener('popstate', () => {
  backOnce();
  history.pushState({ eq: true }, ''); // re-arm so the next back press lands here too
});

/* ---------- milestones ---------- */
function celebrateNewAchievements(delay = 900) {
  const fresh = checkAchievements(state, WORLDS);
  if (fresh.length) {
    saveState(state);
    setTimeout(() => showAchievements(fresh), delay);
  }
}

/* ---------- daily challenge ---------- */
$('dailyCard').onclick = () => {
  const daily = dailyChallenge(state, WORLDS);
  if (!daily) { toast('Unlock a world to play the daily!'); return; }
  if (daily.doneToday) { toast('🎯 Daily done! Come back tomorrow for a new one.'); return; }
  const subj = daily.world.subjects[daily.subjectKey];
  toast(`Today's Daily Challenge: ${subj.emoji} ${subj.name}!`);
  startMission(daily.world, daily.subjectKey, { daily: true, bonusStars: 3 });
};

/* ---------- mission flow ---------- */
function startMission(world, subjectKey, { daily = false, bonusStars = 0 } = {}) {
  const subject = world.subjects[subjectKey];
  closePanel();
  const prog = worldProgress(state, world);
  const difficulty = difficultyFor(prog.done, prog.total);
  const questions = buildQuiz(subject, difficulty);

  showBriefing(subject, () => {
    runQuiz({
      title: `${subject.emoji} ${subject.name} Mission`,
      questions,
      onComplete: (correct, total) => finishMission(world, subjectKey, correct, total, { daily, bonusStars }),
    });
  });
}

function finishMission(world, subjectKey, correct, total, { daily, bonusStars }) {
  const subject = world.subjects[subjectKey];
  const result = recordMission(state, world, subjectKey, correct, total, { bonusStars });

  if (daily) markDailyDone(state, world.key, subjectKey);
  saveState(state);
  refreshHUD(state);
  celebrateNewAchievements(1100); // banners slide in over the reward card
  refreshHubIfOpen(); // keep hub cards/daily in sync if a mission ran from the hub
  if (result.passed && currentWorld && currentWorld.key === world.key) engine.markDone(subjectKey);

  const doWorldCelebrate = () => {
    sfx.celebrate();
    confetti(window.innerWidth / 2, window.innerHeight / 2, 90);
    celebrateWorld(engine, {
      title: world.masterTitle || `${world.name} Master!`,
      subtitle: `You completed every mission in ${world.name}!`,
      colors: [world.theme.primary, world.theme.secondary, 0xFFC93C, 0xF4F7FF],
    });
  };

  showReward({
    correct, total, subject, result,
    onClose: () => {
      // Big moments stack cleanly: rank-up card first, then (if earned) the
      // world-complete celebration once the child dismisses it.
      if (result.rankUp) showLevelUp(result.rankUp, () => { if (result.worldComplete) doWorldCelebrate(); });
      else if (result.worldComplete) doWorldCelebrate();
    },
  });
}
