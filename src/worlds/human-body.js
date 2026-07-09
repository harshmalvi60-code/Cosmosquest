import { attachMarker, updateMarkers } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 5 — Human Body. Unlike the other worlds (subjects scattered in the
 * open), the eight organs are placed *anatomically* inside a simplified,
 * translucent human silhouette the kid can rotate and zoom into. Tapping the
 * heart zooms into the chest, the brain into the head, and so on.
 */

const SUBJECTS = {
  heart: {
    name: 'Heart', type: 'Body · The Pump', emoji: '🫀', badge: 'Heart Hero', build: 'heart', pos: [0.9, 12, 1.4],
    mission: '🫀 Your heart beats about 100,000 times a day without ever taking a rest. Ready to feel the beat?',
    stats: [['100,000', 'Beats a day'], ['Fist-sized', 'About as big as'], ['Blood', 'It pumps everywhere'], ['Never rests', 'Beats all life']],
    facts: ['🫀 Your heart is a muscle that pumps blood to every part of your body.', '👊 It\'s about the size of your own clenched fist.', '🔁 It beats around 100,000 times every single day — even while you sleep.', '🩸 Blood carries oxygen and food to your cells and takes away waste.'],
    fun: 'In a whole lifetime, a human heart beats around 2.5 BILLION times without ever stopping for a break!',
    quiz: [
      ['What is the main job of your heart?', ['To pump blood around your body', 'To help you think', 'To digest food', 'To see'], 0],
      { t: 'tf', q: 'Your heart is about the size of your fist.', answer: true },
      { t: 'pic', q: 'Which shape matches a heartbeat pulse?', options: [
        { shape: 'triangle', color: '#FF6B81', label: 'Beat' }, { shape: 'square', color: '#FF6B81', label: 'Flat' }, { shape: 'circle', color: '#FF6B81', label: 'Still' }], answer: 0 },
    ],
    quizHard: [
      ['Blood carries oxygen to your cells. So what happens to your muscles when your heart beats faster during running?', ['They get more oxygen to keep going', 'They fall asleep', 'They shrink', 'They stop'], 0],
      { t: 'tf', q: 'Because the heart never takes a break, it beats even while you are fast asleep.', answer: true },
      ['Your heart is a muscle. Why does exercising often make the heart stronger?', ['Muscles get stronger the more they work', 'It gets bigger than your head', 'It stops beating to rest', 'It turns into bone'], 0],
    ],
  },
  brain: {
    name: 'Brain', type: 'Body · The Boss', emoji: '🧠', badge: 'Brainiac', build: 'brain', pos: [0, 21.5, 0.4],
    mission: '🧠 Your brain has more connections than there are stars in the galaxy. Ready to meet your control centre?',
    stats: [['86 billion', 'Nerve cells'], ['Control centre', 'Runs everything'], ['20%', 'Of your energy'], ['Electricity', 'How it signals']],
    facts: ['🧠 Your brain is the control centre — it runs your thoughts, movements, feelings and memories.', '⚡ Brain cells send messages using tiny bursts of electricity.', '🔋 The brain uses about a fifth of all the energy your body makes.', '🕸️ It has around 86 billion nerve cells, all wired together.'],
    fun: 'Your brain has more connections between its cells than there are stars in the whole Milky Way galaxy!',
    quiz: [
      ['What does your brain do?', ['Controls thoughts, movement and feelings', 'Pumps blood', 'Breathes air', 'Digests food'], 0],
      { t: 'tf', q: 'Brain cells send messages using tiny electric signals.', answer: true },
      { t: 'pic', q: 'Which shape is most like a brain\'s wrinkly surface?', options: [
        { shape: 'crescent', color: '#F0A6C0', label: 'Wrinkly' }, { shape: 'square', color: '#F0A6C0', label: 'Flat' }, { shape: 'triangle', color: '#F0A6C0', label: 'Spiky' }], answer: 0 },
    ],
    quizHard: [
      ['The brain uses a fifth of your energy but is small. What does that tell you about how hard it works?', ['It works extremely hard all the time', 'It is lazy', 'It never works', 'It only works asleep'], 0],
      { t: 'tf', q: 'Since the brain controls movement, a message must travel from your brain to your legs to make you walk.', answer: true },
      ['Brain cells pass messages with electricity. Why does that make thinking so fast?', ['Electric signals travel very quickly', 'Electricity is slow', 'It uses water', 'It waits overnight'], 0],
    ],
  },
  lungs: {
    name: 'Lungs', type: 'Body · The Bellows', emoji: '🫁', badge: 'Breath Boss', build: 'lungs', pos: [0, 12.5, 1.2],
    mission: '🫁 You breathe about 20,000 times a day without even thinking about it. Ready to explore your air bags?',
    stats: [['20,000', 'Breaths a day'], ['Oxygen in', 'Waste gas out'], ['Millions', 'Tiny air sacs'], ['Tennis court', 'Unfolded area']],
    facts: ['🫁 Your two lungs fill with air so your body can take in oxygen.', '💨 You breathe in oxygen and breathe out a waste gas called carbon dioxide.', '🫧 Inside are millions of tiny air sacs where oxygen passes into your blood.', '😮‍💨 You breathe around 20,000 times a day, mostly without noticing.'],
    fun: 'If you unfolded all the tiny air sacs in your lungs and laid them flat, they\'d cover about a whole tennis court!',
    quiz: [
      ['What gas do your lungs take from the air?', ['Oxygen', 'Helium', 'Sugar', 'Water'], 0],
      { t: 'tf', q: 'You breathe out a waste gas called carbon dioxide.', answer: true },
      { t: 'pic', q: 'How many lungs do you have? Tap the pair!', options: [
        { shape: 'oval', color: '#E58AA0', label: 'Two' }, { shape: 'circle', color: '#E58AA0', label: 'One' }, { shape: 'triangle', color: '#E58AA0', label: 'Three' }], answer: 0 },
    ],
    quizHard: [
      ['Oxygen passes from the air sacs into your blood. Which organ then pumps that blood around?', ['The heart', 'The brain', 'The stomach', 'The skin'], 0],
      { t: 'tf', q: 'Because your lungs work automatically, you keep breathing even when you\'re not thinking about it.', answer: true },
      ['Tiny air sacs give your lungs a huge inside surface. Why is a big surface helpful?', ['More space to soak up oxygen', 'To make you taller', 'To store food', 'To hear better'], 0],
    ],
  },
  bones: {
    name: 'Skeleton', type: 'Body · The Frame', emoji: '🦴', badge: 'Bone Builder', build: 'bones', pos: [0, 8, 0],
    mission: '🦴 You were born with about 300 bones, but as an adult you\'ll have just 206. Where did they go? Let\'s find out!',
    stats: [['206', 'Bones in adults'], ['~300', 'Bones as a baby'], ['Marrow', 'Makes blood cells'], ['Femur', 'Longest bone']],
    facts: ['🦴 Your skeleton is the frame of bones that holds your body up and gives it shape.', '👶 Babies are born with about 300 bones; some fuse together, leaving adults with 206.', '🛡️ Bones also protect soft parts — your skull guards your brain, ribs guard your heart.', '🩸 Inside big bones, soft marrow makes new blood cells.'],
    fun: 'Some baby bones fuse together as you grow — that\'s why an adult has 206 bones but a baby has around 300!',
    quiz: [
      ['How many bones does an adult have?', ['206', '300', '1,000', '50'], 0],
      { t: 'tf', q: 'Your skull protects your brain.', answer: true },
      { t: 'pic', q: 'Which shape matches a long arm or leg bone?', options: [
        { shape: 'tall', color: '#EFE7D2', label: 'Long' }, { shape: 'circle', color: '#EFE7D2', label: 'Round' }, { shape: 'square', color: '#EFE7D2', label: 'Blocky' }], answer: 0 },
    ],
    quizHard: [
      ['A baby has ~300 bones but an adult has 206. Where did the "missing" bones go?', ['Some bones fused together as they grew', 'They vanished', 'They fell out', 'They turned to muscle'], 0],
      { t: 'tf', q: 'Because ribs protect the heart and lungs, the skeleton does more than just hold you up.', answer: true },
      ['Marrow inside bones makes blood cells. So bones help which other body system?', ['The blood the heart pumps', 'The eyes', 'The hair', 'The teeth only'], 0],
    ],
  },
  eyes: {
    name: 'Eyes', type: 'Body · The Cameras', emoji: '👁️', badge: 'Eagle Eye', build: 'eyes', pos: [0.7, 21.5, 1.6],
    mission: '👁️ Your eyes work like tiny cameras and can tell apart millions of colours. Ready to see how you see?',
    stats: [['Cameras', 'They work like'], ['Upside down', 'Image the eye makes'], ['Millions', 'Of colours'], ['Blink', 'To stay clean & wet']],
    facts: ['👁️ Your eyes work like little cameras, letting in light to make a picture.', '🙃 The picture actually lands upside down inside your eye — your brain flips it the right way up!', '🌈 Together your eyes can tell apart millions of different colours.', '😉 You blink to keep your eyes clean and wet — around 15 times a minute.'],
    fun: 'The image inside your eye is actually upside down — your clever brain flips it so the world looks the right way up!',
    quiz: [
      ['Your eyes work most like what?', ['Cameras', 'Speakers', 'Pumps', 'Bones'], 0],
      { t: 'tf', q: 'The picture inside your eye lands upside down, and your brain flips it.', answer: true },
      { t: 'pic', q: 'Which shape matches the round pupil in the middle of your eye?', options: [
        { shape: 'circle', color: '#333', label: 'Round' }, { shape: 'square', color: '#333', label: 'Square' }, { shape: 'star', color: '#333', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['The image in your eye is upside down, but you see the world upright. Which organ fixes that?', ['The brain', 'The heart', 'The stomach', 'The lungs'], 0],
      { t: 'tf', q: 'Since your eyes only take in light, you need your brain to actually understand what you see.', answer: true },
      ['Why do you blink about 15 times a minute without deciding to?', ['To keep your eyes clean and wet', 'To rest your legs', 'To breathe', 'To hear better'], 0],
    ],
  },
  skin: {
    name: 'Skin', type: 'Body · The Shield', emoji: '🖐️', badge: 'Shield Bearer', build: 'skin', pos: [0, 6, 0.1],
    mission: '🖐️ Your skin is the biggest organ you have — a living, waterproof shield. Ready to explore your armour?',
    stats: [['Biggest', 'Organ you have'], ['Waterproof', 'Keeps water out'], ['Feels', 'Touch, heat, pain'], ['Renews', 'New skin always']],
    facts: ['🖐️ Your skin is actually your biggest organ — it covers your whole body.', '💧 It\'s waterproof, keeping water and germs out and your insides in.', '🌡️ Skin helps control your temperature — you sweat to cool down.', '✋ It\'s packed with tiny sensors that feel touch, heat, cold and pain.'],
    fun: 'You grow a whole new outer layer of skin about every month — you\'re constantly wearing brand-new skin!',
    quiz: [
      ['What is the biggest organ in your body?', ['Your skin', 'Your heart', 'Your brain', 'Your nose'], 0],
      { t: 'tf', q: 'Your skin is waterproof and keeps germs out.', answer: true },
      { t: 'pic', q: 'Which colour shows skin cooling down by sweating?', options: [
        { shape: 'drop', color: '#7FD0F0', label: 'Sweat' }, { shape: 'drop', color: '#FF6A2B', label: 'Fire' }, { shape: 'drop', color: '#6BCB77', label: 'Leaf' }], answer: 0 },
    ],
    quizHard: [
      ['Your skin senses heat, cold and pain. Where does it send those messages to be understood?', ['To the brain', 'To the heart', 'To the bones', 'To the lungs'], 0],
      { t: 'tf', q: 'Because skin is waterproof, you don\'t fill up with water when you swim or take a bath.', answer: true },
      ['You sweat when you\'re hot. How does sweating help your body?', ['It cools you down as it dries', 'It warms you up', 'It feeds you', 'It makes you taller'], 0],
    ],
  },
  stomach: {
    name: 'Stomach', type: 'Body · The Mixer', emoji: '🍽️', badge: 'Digestion Champ', build: 'stomach', pos: [-0.6, 9.5, 1.2],
    mission: '🍽️ Your stomach mixes food with acid strong enough to dissolve metal. Ready to follow your lunch?',
    stats: [['Acid', 'Breaks down food'], ['Mixer', 'Churns your food'], ['Hours', 'To digest a meal'], ['9 metres', 'Whole gut length']],
    facts: ['🍽️ Your stomach is a stretchy bag that mixes and mashes the food you swallow.', '🧪 It makes a strong acid that breaks food down into tiny bits your body can use.', '🌀 Muscles in its walls churn the food like a washing machine.', '🛤️ Food then travels through your intestines — a tube about 9 metres long altogether!'],
    fun: 'Your stomach acid is strong enough to dissolve metal — but a special slimy lining stops it from harming your stomach!',
    quiz: [
      ['What does your stomach use to break down food?', ['A strong acid', 'Cold water', 'Air', 'Sunlight'], 0],
      { t: 'tf', q: 'Muscles in your stomach churn food like a mixer.', answer: true },
      { t: 'pic', q: 'Which shape matches a stretchy, curved stomach?', options: [
        { shape: 'crescent', color: '#E39A6B', label: 'Curved' }, { shape: 'square', color: '#E39A6B', label: 'Boxy' }, { shape: 'star', color: '#E39A6B', label: 'Spiky' }], answer: 0 },
    ],
    quizHard: [
      ['Stomach acid is strong enough to dissolve metal. Why doesn\'t it dissolve your stomach?', ['A slimy lining protects the stomach wall', 'The acid is fake', 'The stomach is metal', 'It never touches the wall'], 0],
      { t: 'tf', q: 'Since your gut is about 9 metres long, food takes hours to travel all the way through.', answer: true },
      ['Your stomach mashes food into tiny bits. Why does the body need it that small?', ['So the body can absorb and use it', 'So it looks nicer', 'To make it heavier', 'To keep it whole'], 0],
    ],
  },
  muscles: {
    name: 'Muscles', type: 'Body · The Movers', emoji: '💪', badge: 'Muscle Master', build: 'muscles', pos: [0, 4, 0.2],
    mission: '💪 You have over 600 muscles, and it takes teamwork just to smile. Ready to see what moves you?',
    stats: [['600+', 'Muscles in you'], ['Pull', 'Muscles only pull'], ['Pairs', 'Work in teams'], ['Strongest', 'Your jaw muscle']],
    facts: ['💪 You have more than 600 muscles that let you move, lift and even smile.', '🎯 Muscles work by pulling, not pushing — so they team up in pairs to move bones both ways.', '😄 It takes over a dozen muscles working together just to smile!', '🦵 Your body\'s biggest muscle is in your bottom, and one of the strongest is your jaw.'],
    fun: 'It takes around 17 muscles to smile and over 40 to frown — so smiling is actually the easier choice!',
    quiz: [
      ['About how many muscles do you have?', ['Over 600', 'About 6', 'Exactly 100', 'Just 2'], 0],
      { t: 'tf', q: 'Muscles work by pulling, not pushing.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a flexed arm muscle?', options: [
        { shape: 'oval', color: '#E68A6A', label: 'Bulge' }, { shape: 'square', color: '#E68A6A', label: 'Block' }, { shape: 'star', color: '#E68A6A', label: 'Spiky' }], answer: 0 },
    ],
    quizHard: [
      ['Muscles can only pull, never push. So how do they move a bone back and forth?', ['They work in pairs, pulling opposite ways', 'One muscle pushes it', 'Bones move by themselves', 'Air pushes them'], 0],
      { t: 'tf', q: 'Since smiling uses fewer muscles than frowning, smiling is less work for your face.', answer: true },
      ['Muscles pull on bones to move you. Which body system gives muscles the frame to pull against?', ['The skeleton', 'The lungs', 'The skin', 'The eyes'], 0],
    ],
  },
};

/* ---------------- procedural body + organs ---------------- */
const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.05, flatShading: true, ...o });

function buildOrgan(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'heart') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), M(THREE, 0xE23B54, { emissive: 0x5a0d18, emissiveIntensity: 0.3 }));
    b.scale.set(1, 1.15, 0.9); idle(b, 'breathe', 0.12, 3.5); g.add(b);
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), M(THREE, 0xC53048));
    t1.position.set(-0.5, 1.4, 0); t1.rotation.z = 0.4; g.add(t1);
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), M(THREE, 0xC53048));
    t2.position.set(0.5, 1.4, 0); t2.rotation.z = -0.4; g.add(t2);
  } else if (kind === 'brain') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 14), M(THREE, 0xF0A6C0, { flatShading: true }));
    b.scale.set(1.1, 0.95, 1.1); idle(b, 'breathe', 0.02, 1.5); g.add(b);
    for (let i = 0; i < 10; i++) {
      const fold = new THREE.Mesh(new THREE.TorusGeometry(0.5 + Math.random() * 0.5, 0.16, 6, 10), M(THREE, 0xE58AA8));
      fold.position.set((Math.random() - 0.5) * 2, (Math.random() - 0.2) * 1.5, (Math.random() - 0.5) * 2);
      fold.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); g.add(fold);
    }
  } else if (kind === 'lungs') {
    for (const dx of [1, -1]) {
      const lung = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 12), M(THREE, 0xE58AA0, { transparent: true, opacity: 0.92 }));
      lung.scale.set(0.9, 1.6, 0.9); lung.position.set(dx * 1.1, 0, 0); idle(lung, 'breathe', 0.08, 2.5); g.add(lung);
    }
    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8), M(THREE, 0xD9788E));
    trachea.position.y = 1.4; g.add(trachea);
  } else if (kind === 'bones') {
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4, 8), M(THREE, 0xEFE7D2));
    g.add(spine);
    for (let i = 0; i < 5; i++) {
      for (const dx of [1, -1]) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(1.2 - i * 0.05, 0.12, 6, 12, Math.PI), M(THREE, 0xEFE7D2));
        rib.position.set(0, 1.4 - i * 0.6, 0); rib.rotation.set(Math.PI / 2, 0, dx > 0 ? 0 : Math.PI); g.add(rib);
      }
    }
  } else if (kind === 'eyes') {
    for (const dz of [0.7, -0.7]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 14), M(THREE, 0xF7F7F7));
      eye.position.set(0, 0, dz); g.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 12), M(THREE, 0x4B86C6));
      iris.position.set(0.55, 0, dz); g.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M(THREE, 0x111));
      pupil.position.set(0.75, 0, dz); g.add(pupil);
    }
  } else if (kind === 'skin') {
    const patch = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.5), M(THREE, 0xE7B593));
    idle(patch, 'breathe', 0.02, 1.5); g.add(patch);
    for (let i = 0; i < 6; i++) {
      const bump = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), M(THREE, 0xD9A585));
      bump.position.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.3); g.add(bump);
    }
  } else if (kind === 'stomach') {
    const s = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.7, 12, 20, Math.PI * 1.3), M(THREE, 0xE39A6B));
    s.rotation.z = 0.6; idle(s, 'breathe', 0.05, 2); g.add(s);
  } else if (kind === 'muscles') {
    const m1 = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), M(THREE, 0xD9694E));
    m1.scale.set(1, 1.7, 1); idle(m1, 'breathe', 0.06, 3); g.add(m1);
    const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 12), M(THREE, 0xC85B44));
    m2.scale.set(1, 1.4, 1); m2.position.x = 1.4; idle(m2, 'breathe', 0.06, 3.3); g.add(m2);
  }
  return g;
}

/** A simple translucent standing body the organs live inside. */
function buildSilhouette(THREE) {
  const g = new THREE.Group();
  const skin = M(THREE, 0x6FA8C7, { transparent: true, opacity: 0.16, side: THREE.DoubleSide, emissive: 0x22506e, emissiveIntensity: 0.25, flatShading: false });
  const head = new THREE.Mesh(new THREE.SphereGeometry(3, 20, 16), skin); head.position.y = 21.5; g.add(head);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 3.4, 12, 20), skin); torso.position.y = 10; g.add(torso);
  const hip = new THREE.Mesh(new THREE.SphereGeometry(3.6, 18, 14), skin); hip.position.y = 4.5; hip.scale.set(1, 0.7, 0.8); g.add(hip);
  for (const dx of [1, -1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 11, 12), skin);
    arm.position.set(dx * 5.2, 10, 0); arm.rotation.z = dx * 0.12; g.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1, 10, 12), skin);
    leg.position.set(dx * 1.8, -3.5, 0); g.add(leg);
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.5, 12), skin); neck.position.y = 17.5; g.add(neck);
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  group.position.y = -8; // centre the standing body around the origin

  group.add(buildSilhouette(THREE));

  Object.keys(SUBJECTS).forEach((key) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const organ = buildOrgan(THREE, def.build);
    holder.add(organ);
    holder.position.set(def.pos[0], def.pos[1], def.pos[2]);
    holder.userData = { key, def, focusRadius: 4, phase: Math.random() * 6, anims: collectIdle(organ) };
    attachMarker(THREE, holder, isDone(key), 2.6);
    clickables.push(holder);
    group.add(holder);
  });

  // The camera's gentle auto-spin (and the kid's own drag) rotates the view
  // around the body, so the group itself stays put and the focused organ
  // doesn't drift out of frame while reading.
  function update(dt, t, camera) {
    clickables.forEach((m) => runIdle(m.userData.anims, t));
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 60 } };
}

export default {
  key: 'humanbody',
  name: 'Human Body',
  icon: '🫀',
  blurb: 'Heart, brain, lungs & the amazing machine that is you.',
  unlockCost: 60,
  theme: { primary: 0xFF6B81, secondary: 0xB26CFF, bg: 0x140a12, light: 0xFFD9E0, ambient: 0x5a2a3a },
  masterTitle: 'Body Master 🫀',
  subjects: SUBJECTS,
  build,
};
