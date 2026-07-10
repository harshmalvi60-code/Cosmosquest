import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 16 — Mind & Senses. How we perceive and behave — distinct from Human
 * Body (anatomy). Many subjects are ideas, so each gets a gentle, friendly
 * symbol: Memory → a glowing store of drifting dots, Dreams → a cloud of stars
 * and a moon, Emotions → simple smiley/neutral faces, Reflexes → a spark, etc.
 * Tone is kept light and factual — nothing that could feel unsettling.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.05, flatShading: true, ...o });

const SUBJECTS = {
  senses: {
    name: 'The 5 Senses', type: 'Mind · Your Windows', emoji: '👀', badge: 'Sense Sleuth', build: 'senses',
    mission: '👀 Sight, sound, smell, taste, touch — your five senses paint your whole world. Ready to explore them?',
    stats: [['5 senses', 'Your windows'], ['Brain', 'Reads them all'], ['Sight', 'Often strongest'], ['Team', 'They work together']],
    facts: ['👀 Your five senses are sight, hearing, smell, taste and touch.', '🧠 They gather information and send it to your brain to understand.', '👁️ For most people, sight gives the most information about the world.', '👃 Your senses often team up — smell and taste work together to enjoy food.'],
    fun: 'Smell and taste are best friends — if you hold your nose, an apple and an onion can taste almost the same!',
    quiz: [
      ['How many main senses do you have?', ['Five', 'Two', 'Ten', 'One'], 0],
      { t: 'tf', q: 'Your senses send information to your brain.', answer: true },
      { t: 'pic', q: 'Which sense uses your eyes?', options: [
        { shape: 'circle', color: '#4BA6E8', label: 'Sight' }, { shape: 'circle', color: '#E85C9A', label: 'Smell' }, { shape: 'circle', color: '#6BCB77', label: 'Taste' }], answer: 0 },
    ],
    quizHard: [
      ['Hold your nose and an apple and onion taste alike. What does that show?', ['Smell is a big part of taste', 'Your tongue is broken', 'Apples are onions', 'Taste isn\'t real'], 0],
      { t: 'tf', q: 'Your senses gather clues, but your brain is what makes sense of them.', answer: true },
      ['Sight gives most people the most information. Why might that be?', ['Eyes take in a huge amount at once', 'Eyes are the biggest', 'Ears are broken', 'Noses are slow'], 0],
    ],
  },
  memory: {
    name: 'Memory', type: 'Mind · Your Storybook', emoji: '🧠', badge: 'Memory Keeper', build: 'memory',
    mission: '🧠 Your memory lets you keep birthdays, faces, and facts. Ready to find out how you remember?',
    stats: [['Stores', 'Facts & moments'], ['Practice', 'Makes it stronger'], ['Sleep', 'Helps it stick'], ['Short & long', 'Two kinds']],
    facts: ['🧠 Memory is how your brain stores and later recalls things.', '⏱️ You have short-term memory for right now, and long-term memory for keeps.', '🔁 Practising something (like a song) helps move it into long-term memory.', '😴 Sleeping well helps your brain lock in what you learned that day.'],
    fun: 'Your brain can hold a HUGE amount of memories — far more than the biggest computer hard drives!',
    quiz: [
      ['What does memory let you do?', ['Store and recall things', 'Run faster', 'See in the dark', 'Fly'], 0],
      { t: 'tf', q: 'Practising something helps you remember it.', answer: true },
      { t: 'pic', q: 'What helps lock memories in?', options: [
        { shape: 'crescent', color: '#8FB8FF', label: 'Sleep' }, { shape: 'star', color: '#E23B2E', label: 'Noise' }, { shape: 'square', color: '#6E6E7A', label: 'Nothing' }], answer: 0 },
    ],
    quizHard: [
      ['You forget a new phone number fast but not your own name. Why?', ['One is short-term, the other long-term', 'Names are shorter', 'Numbers are boring', 'Your name is louder'], 0],
      { t: 'tf', q: 'Sleeping well after learning helps your brain keep what you learned.', answer: true },
      ['Practising a song again and again helps you remember it. What is practice doing?', ['Moving it into long-term memory', 'Making it louder', 'Making it shorter', 'Erasing it'], 0],
    ],
  },
  dreams: {
    name: 'Dreams', type: 'Mind · Sleep Stories', emoji: '💤', badge: 'Dream Explorer', build: 'dreams',
    mission: '💤 Every night your mind makes little movies called dreams. Ready to explore the world of sleep stories?',
    stats: [['In sleep', 'When they happen'], ['Everyone', 'Dreams nightly'], ['Often forgotten', 'On waking'], ['Brain', 'Sorting the day']],
    facts: ['💤 Dreams are stories and pictures your mind makes while you sleep.', '🌙 Everyone dreams, even if they don\'t remember it.', '👀 Most dreams happen during a stage of sleep when your eyes flutter.', '🧠 Scientists think dreaming may help the brain sort through the day.'],
    fun: 'You can spend about 6 years of your whole life dreaming — that\'s a LOT of night-time adventures!',
    quiz: [
      ['When do dreams happen?', ['While you sleep', 'While you run', 'While you eat', 'Only on birthdays'], 0],
      { t: 'tf', q: 'Everyone dreams, even if they forget it.', answer: true },
      { t: 'pic', q: 'When do you usually dream?', options: [
        { shape: 'crescent', color: '#8FB8FF', label: 'Night' }, { shape: 'circle', color: '#F6D64A', label: 'Midday' }, { shape: 'square', color: '#6BCB77', label: 'Never' }], answer: 0 },
    ],
    quizHard: [
      ['Scientists think dreaming may help the brain sort through the day. What might that help with?', ['Tidying up memories and feelings', 'Growing taller', 'Getting hungry', 'Running faster'], 0],
      { t: 'tf', q: 'Even people who say they never dream actually do — they just forget.', answer: true },
      ['Most dreams happen when your eyes flutter in sleep. What does that tell you about dreaming?', ['It happens in a special stage of sleep', 'It happens while awake', 'It never happens', 'It happens with open eyes'], 0],
    ],
  },
  emotions: {
    name: 'Emotions', type: 'Mind · Your Feelings', emoji: '😊', badge: 'Feelings Friend', build: 'emotions',
    mission: '😊 Happy, sad, excited, calm — emotions are your feelings, and they\'re all okay. Ready to explore them?',
    stats: [['Feelings', 'Happy to sad'], ['All normal', 'Everyone has them'], ['Faces', 'Show emotions'], ['Helpful', 'They guide us']],
    facts: ['😊 Emotions are feelings like happy, sad, excited, angry or calm.', '🌈 Everyone feels all kinds of emotions, and that is completely normal.', '🙂 Our faces often show our emotions — a smile for happy, a frown for sad.', '🛟 Emotions are helpful signals, like feeling careful when something seems risky.'],
    fun: 'A real, happy smile uses the muscles around your eyes too — that\'s often how you can spot a genuine smile!',
    quiz: [
      ['What are emotions?', ['Our feelings', 'Our bones', 'Our teeth', 'Our shoes'], 0],
      { t: 'tf', q: 'Everyone feels many different emotions, and that\'s normal.', answer: true },
      { t: 'pic', q: 'Which face looks happy?', options: [
        { shape: 'circle', color: '#F6D64A', label: 'Smile' }, { shape: 'circle', color: '#8FB8FF', label: 'Frown' }, { shape: 'circle', color: '#9A968C', label: 'Bored' }], answer: 0 },
    ],
    quizHard: [
      ['Emotions are helpful signals. How does feeling careful near something risky help you?', ['It reminds you to stay safe', 'It makes you taller', 'It stops time', 'It has no use'], 0],
      { t: 'tf', q: 'Since faces often show emotions, watching a face can hint at how someone feels.', answer: true },
      ['All emotions — even sad or angry — are normal to feel sometimes. What is a good thing to do with big feelings?', ['Talk about them with someone you trust', 'Pretend you have none', 'Keep them secret forever', 'Ignore them always'], 0],
    ],
  },
  sleep: {
    name: 'Sleep', type: 'Mind · Night-Time Repair', emoji: '😴', badge: 'Sleep Scholar', build: 'sleep',
    mission: '😴 Sleep is your body\'s night-time repair time. Ready to find out why we snooze?',
    stats: [['Rest', 'Body & brain'], ['~10 hrs', 'Kids need'], ['Repair', 'Grows & heals'], ['Memory', 'Sleep helps it']],
    facts: ['😴 Sleep is when your body and brain rest, repair, and recharge.', '🕙 Kids need about 9–11 hours of sleep a night to feel their best.', '💪 While you sleep, your body grows and heals, and your brain tidies up memories.', '🔄 Sleep comes in stages, cycling through light, deep, and dreaming sleep.'],
    fun: 'You grow the most while you\'re asleep — your body releases special growth signals mostly at night!',
    quiz: [
      ['Why do we sleep?', ['To rest, repair and recharge', 'To get hungry', 'To grow shorter', 'For no reason'], 0],
      { t: 'tf', q: 'Kids usually need more sleep than grown-ups.', answer: true },
      { t: 'pic', q: 'When do we mostly sleep?', options: [
        { shape: 'crescent', color: '#8FB8FF', label: 'Night' }, { shape: 'circle', color: '#F6D64A', label: 'Noon' }, { shape: 'star', color: '#E23B2E', label: 'Never' }], answer: 0 },
    ],
    quizHard: [
      ['Your body grows most while you sleep. Why is a good night\'s sleep important for kids?', ['It helps them grow and stay healthy', 'It makes them shorter', 'It wastes time', 'It stops learning'], 0],
      { t: 'tf', q: 'Because sleep helps the brain tidy memories, sleeping well can help you learn.', answer: true },
      ['Sleep cycles through light, deep and dreaming stages. What does that tell you about sleep?', ['It\'s an active, busy process', 'Nothing happens', 'It is all the same', 'You are awake'], 0],
    ],
  },
  reflexes: {
    name: 'Reflexes', type: 'Mind · Super-Fast Reactions', emoji: '⚡', badge: 'Reflex Racer', build: 'reflexes',
    mission: '⚡ Touch something hot and your hand pulls back before you even think! Ready to meet your reflexes?',
    stats: [['Automatic', 'No thinking'], ['Super fast', 'Faster than thought'], ['Protect you', 'From harm'], ['Blink', 'A reflex']],
    facts: ['⚡ A reflex is an automatic, super-fast reaction your body does without you deciding.', '🔥 If you touch something hot, your hand yanks back before your brain even feels the pain.', '🛡️ Reflexes protect you from danger.', '👁️ Blinking when something comes near your eye is a reflex too.'],
    fun: 'In a reflex, the signal takes a shortcut through your spinal cord instead of going all the way to your brain — that\'s why it\'s SO fast!',
    quiz: [
      ['What is a reflex?', ['An automatic, super-fast reaction', 'A slow choice', 'A kind of dream', 'A muscle'], 0],
      { t: 'tf', q: 'Reflexes help protect you from harm.', answer: true },
      { t: 'pic', q: 'Which one is a reflex?', options: [
        { shape: 'circle', color: '#4BA6E8', label: 'Blink' }, { shape: 'square', color: '#6BCB77', label: 'Reading' }, { shape: 'triangle', color: '#E3B23C', label: 'Singing' }], answer: 0 },
    ],
    quizHard: [
      ['In a reflex, the signal shortcuts through your spinal cord. Why does that make it so fast?', ['It doesn\'t travel all the way to the brain first', 'It uses electricity from the Sun', 'It waits for you to decide', 'It goes the long way'], 0],
      { t: 'tf', q: 'Your hand can pull off something hot before your brain even feels the pain.', answer: true },
      ['Reflexes are automatic, with no thinking. Why is that useful for danger?', ['Fast reactions keep you safe in time', 'Thinking is faster', 'It wastes time', 'It hurts more'], 0],
    ],
  },
  balance: {
    name: 'Balance', type: 'Mind · Staying Steady', emoji: '🤸', badge: 'Steady Star', build: 'balance',
    mission: '🤸 What keeps you from falling over? A secret sense inside your ears! Ready to find your balance?',
    stats: [['Steadiness', 'Staying upright'], ['Inner ear', 'Helps balance'], ['Eyes', 'Help too'], ['Dizzy', 'When it\'s confused']],
    facts: ['🤸 Balance is your sense of staying steady and upright.', '👂 Tiny parts deep inside your ears sense which way is up and if you\'re moving.', '👁️ Your eyes and muscles help too, all working with your brain.', '💫 Spinning around confuses your balance sense — that\'s why you feel dizzy!'],
    fun: 'The balance sensors in your ears use tiny bits like sand floating in fluid to tell your brain which way is up!',
    quiz: [
      ['What part of your body helps you balance?', ['Your inner ear', 'Your elbow', 'Your hair', 'Your teeth'], 0],
      { t: 'tf', q: 'Spinning around can make you dizzy by confusing your balance.', answer: true },
      { t: 'pic', q: 'Which body part helps you balance?', options: [
        { shape: 'oval', color: '#E85C9A', label: 'Ear' }, { shape: 'circle', color: '#4BA6E8', label: 'Eye' }, { shape: 'square', color: '#6BCB77', label: 'Knee' }], answer: 0 },
    ],
    quizHard: [
      ['Your inner ear, eyes and muscles all help you balance. What does that make balance?', ['A team effort of several senses', 'Just one sense', 'A kind of dream', 'Impossible'], 0],
      { t: 'tf', q: 'After spinning, you feel dizzy because your balance sense is briefly confused.', answer: true },
      ['A tightrope walker holds a long pole. How might that help them balance?', ['It makes balancing easier and steadier', 'It makes them heavier only', 'It helps them fly', 'It does nothing'], 0],
    ],
  },
  tastebuds: {
    name: 'Taste Buds', type: 'Mind · Flavour Finders', emoji: '👅', badge: 'Flavour Finder', build: 'tastebuds',
    mission: '👅 Thousands of tiny taste buds turn your dinner into flavour. Ready to taste the science?',
    stats: [['Tongue', 'Covered in them'], ['~10,000', 'Taste buds'], ['5 tastes', 'Sweet to umami'], ['Renew', 'New ones grow']],
    facts: ['👅 Taste buds are tiny bumps on your tongue that sense flavour.', '🔢 You have around 10,000 of them!', '🍭 They detect five basic tastes: sweet, salty, sour, bitter, and savoury (umami).', '🔄 Taste buds wear out and are replaced with new ones every couple of weeks.'],
    fun: 'Your taste buds team up with your nose — most of what you call "taste" is actually smell!',
    quiz: [
      ['Where are your taste buds?', ['On your tongue', 'In your ears', 'On your feet', 'In your hair'], 0],
      { t: 'tf', q: 'There are five basic tastes.', answer: true },
      { t: 'pic', q: 'Which one is a basic taste?', options: [
        { shape: 'circle', color: '#F6D64A', label: 'Sweet' }, { shape: 'star', color: '#E23B2E', label: 'Loud' }, { shape: 'square', color: '#4BA6E8', label: 'Bright' }], answer: 0 },
    ],
    quizHard: [
      ['Most of what we call "taste" is really smell. What does that tell you about eating with a blocked nose?', ['Food tastes much weaker', 'Food tastes stronger', 'You can\'t chew', 'Nothing changes'], 0],
      { t: 'tf', q: 'Because taste buds renew every couple of weeks, a burnt tongue soon tastes normally again.', answer: true },
      ['You have five basic tastes but can enjoy thousands of flavours. How?', ['The tastes mix, with help from smell', 'You grow new tastes daily', 'Each food has its own bud', 'Flavour is imaginary'], 0],
    ],
  },
};

/* ---------------- procedural mind symbols ---------------- */
function face(THREE, color, mood) {
  const f = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), M(THREE, color, { flatShading: false }));
  head.position.y = 2; f.add(head);
  for (const dx of [0.5, -0.5]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), M(THREE, 0x222));
    eye.position.set(dx, 2.3, 1.2); f.add(eye);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 16, Math.PI), M(THREE, 0x222));
  mouth.position.set(0, 1.5, 1.2); mouth.rotation.z = mood === 'sad' ? Math.PI : 0; f.add(mouth);
  return f;
}

function buildMind(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'senses') {
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), M(THREE, 0xB26CFF, { emissive: 0x3a1a5a, emissiveIntensity: 0.3 }));
    core.position.y = 2.4; g.add(core);
    const cols = [0x4BA6E8, 0xE85C9A, 0x6BCB77, 0xF6D64A, 0xFF8C6B];
    cols.forEach((c, i) => {
      const a = (i / 5) * Math.PI * 2;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, c));
      orb.position.set(Math.cos(a) * 2.2, 2.4 + Math.sin(a) * 0.6, Math.sin(a) * 0.6); idle(orb, 'bobY', 0.2, 2 + i); g.add(orb);
    });
  } else if (kind === 'memory') {
    const store = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.4), M(THREE, 0x6C8CFF, { emissive: 0x1a2a6a, emissiveIntensity: 0.3, transparent: true, opacity: 0.85 }));
    store.position.y = 2.2; idle(store, 'breathe', 0.03, 1.5); g.add(store);
    for (let i = 0; i < 8; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xBFD0FF }));
      dot.position.set((Math.random() - 0.5) * 2.4, 2.2 + (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 1.4); idle(dot, 'bobY', 0.25, 2 + i); g.add(dot);
    }
  } else if (kind === 'dreams') {
    const puffs = [[0, 0, 1.6], [1.4, -0.2, 1.2], [-1.4, -0.2, 1.2]];
    for (const [x, y, r] of puffs) { const p = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), M(THREE, 0xC7C0F0, { flatShading: false, transparent: true, opacity: 0.85 })); p.position.set(x, 2.2 + y, 0); g.add(p); }
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), M(THREE, 0xF6E9A0)); moon.position.set(0, 3.6, 0.5); g.add(moon);
    for (let i = 0; i < 6; i++) {
      const star = new THREE.Mesh(new THREE.TetrahedronGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xFFF3B0 }));
      star.position.set((Math.random() - 0.5) * 4, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 2); idle(star, 'bobY', 0.2, 2 + i); g.add(star);
    }
  } else if (kind === 'emotions') {
    const a = face(THREE, 0xF6D64A, 'happy'); a.position.set(-1.6, 0, 0); a.scale.setScalar(0.8); idle(a, 'bobY', 0.15, 2); g.add(a);
    const b = face(THREE, 0x8FB8FF, 'sad'); b.position.set(1.6, 0, 0); b.scale.setScalar(0.8); idle(b, 'bobY', 0.15, 2.4); g.add(b);
  } else if (kind === 'sleep') {
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI), M(THREE, 0xE9E2A0));
    moon.position.y = 2.4; moon.rotation.x = -0.4; g.add(moon);
    for (let i = 0; i < 3; i++) {
      const z = new THREE.Mesh(new THREE.BoxGeometry(0.6 + i * 0.2, 0.14, 0.1), M(THREE, 0xBFD0FF));
      z.position.set(1.6 + i * 0.5, 3 + i * 0.8, 0); idle(z, 'bobY', 0.2, 2 + i); g.add(z);
    }
  } else if (kind === 'reflexes') {
    const bolt = new THREE.Group();
    let x = 0, y = 3.6;
    for (let i = 0; i < 4; i++) { const seg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), new THREE.MeshBasicMaterial({ color: 0xF6E15A })); x += (Math.random() - 0.5) * 0.9; y -= 0.8; seg.position.set(x, y, 0); seg.rotation.z = (Math.random() - 0.5) * 0.8; bolt.add(seg); }
    g.add(bolt); idle(bolt, 'sway', 0.15, 8, 'z');
    const hand = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 0.4), M(THREE, 0xE9B98A)); hand.position.set(0, 0.8, 0); idle(hand, 'sway', 0.2, 6, 'z'); g.add(hand);
  } else if (kind === 'balance') {
    const base = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 4), M(THREE, 0x8A909A)); base.position.y = 0.7; g.add(base);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 0.25, 0.6), M(THREE, 0xC08A4A)); beam.position.y = 1.5; g.add(beam); g.userData.beam = beam;
    for (const dx of [1.6, -1.6]) { const pan = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(THREE, 0xD0D4DA)); pan.position.set(dx, 1.2, 0); beam.add(pan); }
  } else if (kind === 'tastebuds') {
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0xE86A8A, { flatShading: false }));
    tongue.position.y = 1.4; tongue.scale.set(1.2, 0.6, 1.6); g.add(tongue);
    for (let i = 0; i < 10; i++) {
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), M(THREE, 0xF29AB0));
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.6;
      bud.position.set(Math.cos(a) * r, 1.9, Math.sin(a) * r * 1.2); idle(bud, 'bobY', 0.06, 3 + i); g.add(bud);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 44;

  // Soft glowing "mind space" floor.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 22, 48),
    new THREE.MeshBasicMaterial({ color: 0x2A1F55, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -4; group.add(floor);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildMind(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 5);
    holder.position.set(p.x, p.y + 1, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 1, anims: collectIdle(item), beam: item.userData.beam || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.16;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
      if (m.userData.beam) m.userData.beam.rotation.z = Math.sin(t * 1.2 + m.userData.bobPhase) * 0.25; // tipping scales
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 116 } };
}

export default {
  key: 'mind',
  name: 'Mind & Senses',
  icon: '🧠',
  blurb: 'Peek inside how you see, feel, remember, and dream.',
  unlockCost: 544,
  category: 'People & Places',
  theme: { primary: 0xB26CFF, secondary: 0x4BA6E8, bg: 0x0f0a1e, light: 0xE8DCFF, ambient: 0x3a2a5a },
  masterTitle: 'Mind Master 🧠',
  subjects: SUBJECTS,
  build,
};
