import './style.css';
import { buildDOM, $, toast } from './ui/dom.js';
import { loadState, saveState } from './game/state.js';
import { recordMission, worldProgress, canAfford, unlockWorld,
  dailyChallenge, markDailyDone } from './game/profile.js';
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

/* ---------- boot ---------- */
buildDOM(document.getElementById('app'));

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
  openHub();
};

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
  } else {
    sfx.wrong();
    toast(`Earn ${world.unlockCost - state.stars} more ⭐ to unlock ${world.name}!`);
  }
}

function enterWorld(world) {
  currentWorld = world;
  applyTheme(world);
  setMood(world.key);
  sfx.whoosh();
  engine.loadWorld(world, { isDone: (k) => !!(state.done[world.key] && state.done[world.key][k]) });
  hideHub();
  document.body.classList.add('playing');
  $('hint').textContent = `Exploring ${world.name} — tap a glowing subject! ${world.icon}`;
  refreshHUD(state);
}

function onPick(key, mesh) {
  if (!currentWorld) return;
  currentSubjectKey = key;
  sfx.select();
  engine.focusOn(mesh);
  openPanel(state, currentWorld, key, { onMission: () => { sfx.open(); startMission(currentWorld, key); } });
}

$('pClose').onclick = () => { sfx.tap(); closePanel(); engine.resetView(); };
$('backHub').onclick = () => { sfx.whoosh(); closePanel(); openHub(); };
$('collectBtn').onclick = () => { sfx.open(); renderCollection(state, WORLDS); };
$('hubCollectBtn').onclick = () => { sfx.open(); renderCollection(state, WORLDS); };

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
  refreshHubIfOpen(); // keep hub cards/daily in sync if a mission ran from the hub
  if (result.passed && currentWorld && currentWorld.key === world.key) engine.markDone(subjectKey);

  showReward({
    correct, total, subject, result,
    onClose: () => {
      if (result.worldComplete) {
        sfx.celebrate();
        confetti(window.innerWidth / 2, window.innerHeight / 2, 90);
        celebrateWorld(engine, {
          title: world.masterTitle || `${world.name} Master!`,
          subtitle: `You completed every mission in ${world.name}!`,
          colors: [world.theme.primary, world.theme.secondary, 0xFFC93C, 0xF4F7FF],
        });
      }
    },
  });

  if (result.rankUp) setTimeout(() => { sfx.rankup(); toast(`🎖 RANK UP! You are now a ${result.rankUp[1]}!`); }, 700);
}
