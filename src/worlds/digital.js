import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 19 — Digital World. Software and ideas, so the whole scene uses a
 * glowing blue wireframe/blueprint look rather than solid machinery: a grid
 * floor, thin cyan-edged shapes, and drifting "data" bits. Abstract subjects
 * (Coding, Internet, AI, Data) get clear symbols — Data is streams of 0s and 1s,
 * Internet a wireframe globe of links, AI a glowing brain-network node.
 */

const WIRE = 0x4DE3FF;
const M = (THREE, c = WIRE, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.3, emissive: c, emissiveIntensity: 0.25, flatShading: true, ...o });
const glow = (THREE, c = WIRE) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 });

const SUBJECTS = {
  coding: {
    name: 'Coding', type: 'Digital · Talking to Computers', emoji: '💻', badge: 'Code Wizard', build: 'coding',
    mission: '💻 Coding is how we give computers step-by-step instructions. Ready to speak computer?',
    stats: [['Instructions', 'Step by step'], ['Languages', 'Python, Scratch…'], ['Exact', 'Computers are literal'], ['Bugs', 'Mistakes in code']],
    facts: ['💻 Coding means writing step-by-step instructions that tell a computer what to do.', '🎯 Computers follow instructions EXACTLY, so every step must be clear.', '🐍 People write code in special languages like Python or Scratch.', '🐛 A mistake in code is called a "bug", and fixing it is "debugging".'],
    fun: 'The word "bug" for a computer error came from a real moth found stuck inside an early computer back in 1947!',
    quiz: [
      ['What is coding?', ['Writing step-by-step instructions for a computer', 'Drawing pictures', 'A kind of dance', 'A video game only'], 0],
      { t: 'tf', q: 'A mistake in computer code is called a bug.', answer: true },
      { t: 'pic', q: 'How does a computer follow code?', options: [
        { shape: 'square', color: '#4DE3FF', label: 'Step by step' }, { shape: 'star', color: '#4DE3FF', label: 'Randomly' }, { shape: 'circle', color: '#4DE3FF', label: 'It guesses' }], answer: 0 },
    ],
    quizHard: [
      ['Computers do EXACTLY what the code says. Why must each instruction be clear?', ['One unclear step can cause a bug', 'Computers get bored', 'Code is decoration', 'It doesn\'t matter'], 0],
      { t: 'tf', q: 'Fixing a mistake in code is called debugging.', answer: true },
      ['Why do people write code in special languages like Python?', ['They turn human ideas into steps a computer follows', 'They look pretty', 'Computers speak English', 'To confuse people'], 0],
    ],
  },
  internet: {
    name: 'Internet', type: 'Digital · The Big Network', emoji: '🌐', badge: 'Web Weaver', build: 'internet',
    mission: '🌐 The internet links billions of devices all over the world. Ready to explore the biggest network ever?',
    stats: [['Network', 'Connects devices'], ['Global', 'The whole world'], ['Packets', 'Data in pieces'], ['Cables', 'Under the oceans']],
    facts: ['🌐 The internet is a giant network connecting computers and devices all over the world.', '📦 Information travels across it broken into little pieces called packets.', '🌊 Most of it travels through cables — including huge ones on the ocean floor!', '🕸️ The World Wide Web (websites) is one big thing we use the internet for.'],
    fun: 'Most internet traffic between continents doesn\'t go by satellite — it zips through giant cables lying on the ocean floor!',
    quiz: [
      ['What is the internet?', ['A global network connecting devices', 'A single computer', 'A kind of TV', 'A game'], 0],
      { t: 'tf', q: 'A lot of internet data travels through undersea cables.', answer: true },
      { t: 'pic', q: 'What does the internet connect?', options: [
        { shape: 'circle', color: '#4DE3FF', label: 'The whole world' }, { shape: 'square', color: '#4DE3FF', label: 'One house' }, { shape: 'triangle', color: '#4DE3FF', label: 'Nothing' }], answer: 0 },
    ],
    quizHard: [
      ['Data is split into "packets" to travel the internet. Why send it in small pieces?', ['Pieces can travel quickly by many paths', 'To lose some', 'To slow it down', 'Packets are prettier'], 0],
      { t: 'tf', q: 'Because the internet connects the whole world, you can message someone far away in seconds.', answer: true },
      ['The World Wide Web (websites) runs on the internet. So the web is what?', ['One of the things we use the internet for', 'The same as a cable', 'A single computer', 'A satellite'], 0],
    ],
  },
  ai: {
    name: 'AI', type: 'Digital · Learning Machines', emoji: '🤖', badge: 'AI Explorer', build: 'ai',
    mission: '🤖 AI is teaching computers to learn and spot patterns — like a super-fast student. Ready to explore?',
    stats: [['Learns', 'From examples'], ['Patterns', 'It spots them'], ['Not alive', 'Just clever code'], ['Helps', 'Many tasks']],
    facts: ['🤖 AI, or artificial intelligence, is computer software that can learn and spot patterns.', '📚 Instead of being told every rule, it learns from LOTS of examples.', '🌍 AI helps translate languages, suggest videos, and recognise pictures.', '💡 But AI isn\'t alive or truly thinking — it\'s very clever maths and code.'],
    fun: 'AI can look at a million cat photos and learn to spot cats — but it doesn\'t actually know what a cat really IS!',
    quiz: [
      ['How does AI mainly learn?', ['From lots of examples', 'By taking naps', 'By magic', 'It doesn\'t learn'], 0],
      { t: 'tf', q: 'AI is clever code, but it isn\'t alive.', answer: true },
      { t: 'pic', q: 'AI learns by looking at many…?', options: [
        { shape: 'square', color: '#4DE3FF', label: 'Examples' }, { shape: 'circle', color: '#4DE3FF', label: 'Nothing' }, { shape: 'triangle', color: '#4DE3FF', label: 'Dreams' }], answer: 0 },
    ],
    quizHard: [
      ['AI learns from examples instead of fixed rules. How does that help it spot a cat in a new photo?', ['It recognises patterns it learned before', 'It reads the photo\'s name', 'It asks the cat', 'It guesses blindly'], 0],
      { t: 'tf', q: 'Even though AI can spot cats, it doesn\'t truly understand what a cat is.', answer: true },
      ['AI is described as "clever maths and code". So what is AI really?', ['A tool made by people, not a living thing', 'A living robot', 'A kind of animal', 'Magic'], 0],
    ],
  },
  robots: {
    name: 'Robots', type: 'Digital · Machines That Act', emoji: '🦾', badge: 'Robo Ranger', build: 'robots',
    mission: '🦾 Robots are machines that can sense, move, and do jobs for us. Ready to meet our mechanical helpers?',
    stats: [['Machines', 'That do tasks'], ['Sensors', 'To \'feel\' around'], ['Motors', 'To move'], ['Programmed', 'Follow code']],
    facts: ['🦾 A robot is a machine built to do tasks, often ones that are dull, dirty or dangerous for people.', '📡 Robots use sensors to detect the world and motors to move.', '🧑‍💻 They follow a program (code) that tells them what to do.', '🚗 Robots build cars, explore other planets, and even help doctors in surgery.'],
    fun: 'There are robots on Mars, robots vacuuming living rooms, and robots that do backflips — all just following their code!',
    quiz: [
      ['What does a robot use to move?', ['Motors', 'Wishes', 'Wind', 'Nothing'], 0],
      { t: 'tf', q: 'Robots follow a program that tells them what to do.', answer: true },
      { t: 'pic', q: 'What helps a robot "feel" its surroundings?', options: [
        { shape: 'circle', color: '#4DE3FF', label: 'Sensors' }, { shape: 'star', color: '#4DE3FF', label: 'Nothing' }, { shape: 'triangle', color: '#4DE3FF', label: 'Feelings' }], answer: 0 },
    ],
    quizHard: [
      ['Robots often do dull, dirty or dangerous jobs. Why send a robot instead of a person?', ['To keep people safe and save effort', 'Robots enjoy it', 'People can\'t work', 'For fun only'], 0],
      { t: 'tf', q: 'A robot needs sensors to detect the world AND motors to move — both working with its code.', answer: true },
      ['A robot only does what its program says. So a robot is what?', ['A machine that follows instructions', 'A living creature', 'A kind of plant', 'A magic being'], 0],
    ],
  },
  videogames: {
    name: 'Video Games', type: 'Digital · Play the Code', emoji: '🎮', badge: 'Game Guru', build: 'games',
    mission: '🎮 Every video game is code, art, and sound working together for YOU to play. Ready to press start?',
    stats: [['Code', 'Runs the game'], ['Art & sound', 'Bring it alive'], ['You control', 'Interactive'], ['Teams', 'Make big ones']],
    facts: ['🎮 A video game is software you interact with — your choices change what happens.', '🎨 Games are built from code, plus artwork, music and sound effects.', '👥 Big games are made by large teams of programmers, artists and designers.', '🩺 Games are for fun, but also for learning and even training doctors and pilots.'],
    fun: 'Some huge video games take hundreds of people several YEARS to make — as big a job as a blockbuster movie!',
    quiz: [
      ['What is a video game made from?', ['Code, art and sound', 'Only paper', 'Just one photo', 'Water'], 0],
      { t: 'tf', q: 'In a video game, your choices change what happens.', answer: true },
      { t: 'pic', q: 'What do you use to control many games?', options: [
        { shape: 'square', color: '#4DE3FF', label: 'A controller' }, { shape: 'circle', color: '#4DE3FF', label: 'A rock' }, { shape: 'triangle', color: '#4DE3FF', label: 'A spoon' }], answer: 0 },
    ],
    quizHard: [
      ['A game reacts to your choices. What does that make video games, unlike a film?', ['Interactive — you take part', 'Exactly like a film', 'Not fun', 'Impossible'], 0],
      { t: 'tf', q: 'Because big games need code, art and sound, large teams work together for years.', answer: true },
      ['Games can train pilots and doctors safely. Why is a game good for that?', ['You can practise without real danger', 'It is cheaper to crash', 'Games are always real', 'It replaces sleep'], 0],
    ],
  },
  chips: {
    name: 'Computer Chips', type: 'Digital · Tiny Brains', emoji: '🔲', badge: 'Chip Champion', build: 'chips',
    mission: '🔲 A tiny chip smaller than your fingernail holds BILLIONS of switches. Ready to meet a computer\'s brain?',
    stats: [['Tiny brain', 'Of a computer'], ['Billions', 'Of switches'], ['Silicon', 'Made from sand'], ['Fast', 'Billions of sums/sec']],
    facts: ['🔲 A computer chip is a tiny slice that acts like a computer\'s brain.', '🔀 It holds billions of microscopic switches that flip on and off.', '🏖️ Chips are made mostly from silicon, which comes from sand!', '⚡ They can do billions of calculations every single second.'],
    fun: 'A modern computer chip smaller than a stamp can hold more than 10 BILLION tiny switches called transistors!',
    quiz: [
      ['What is a computer chip like?', ['A computer\'s tiny brain', 'A snack', 'A wheel', 'A window'], 0],
      { t: 'tf', q: 'Computer chips are made mostly from silicon, which comes from sand.', answer: true },
      { t: 'pic', q: 'Which shape matches a computer chip?', options: [
        { shape: 'square', color: '#4DE3FF', label: 'Chip' }, { shape: 'circle', color: '#4DE3FF', label: 'Ball' }, { shape: 'star', color: '#4DE3FF', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['A chip has billions of switches flipping on and off. What are those on/off switches used for?', ['Doing maths and running programs', 'Making light only', 'Growing bigger', 'Making noise'], 0],
      { t: 'tf', q: 'Because a tiny chip holds billions of switches, small devices can be very powerful.', answer: true },
      ['Chips do billions of calculations a second. What does that let a computer do?', ['Work incredibly fast', 'Work very slowly', 'Fall asleep', 'Nothing'], 0],
    ],
  },
  data: {
    name: 'Data', type: 'Digital · 0s and 1s', emoji: '📊', badge: 'Data Detective', build: 'data',
    mission: '📊 Photos, songs, messages — to a computer, everything is DATA. Ready to decode it?',
    stats: [['Information', 'Stored digitally'], ['Bits', '0s and 1s'], ['Everything', 'Photos to text'], ['Huge', 'Grows every day']],
    facts: ['📊 Data is information a computer stores and uses — like photos, text, songs and scores.', '🔢 Deep down, computers store everything as bits: tiny 0s and 1s.', '🖼️ A photo is really millions of these 0s and 1s working together.', '🌍 The world makes an unbelievable amount of new data every single day.'],
    fun: 'To a computer, a photo, a song and a message are ALL just long strings of 0s and 1s — it\'s all in the code!',
    quiz: [
      ['How do computers store everything, deep down?', ['As 0s and 1s (bits)', 'As tiny drawings', 'As real objects', 'As smells'], 0],
      { t: 'tf', q: 'A photo is stored as data made of 0s and 1s.', answer: true },
      { t: 'pic', q: 'Computers store data as…?', options: [
        { shape: 'square', color: '#4DE3FF', label: '0s and 1s' }, { shape: 'circle', color: '#4DE3FF', label: 'Letters only' }, { shape: 'triangle', color: '#4DE3FF', label: 'Colours only' }], answer: 0 },
    ],
    quizHard: [
      ['A photo, a song and a message are all just 0s and 1s. What does that tell you about computers?', ['They turn everything into the same simple code', 'They can\'t store photos', 'They use real paint', 'They think in words'], 0],
      { t: 'tf', q: 'Because everything becomes 0s and 1s, one device can store photos, songs and messages together.', answer: true },
      ['The world makes huge amounts of new data daily. Why do we need bigger and bigger storage?', ['To keep all that new data', 'To slow computers down', 'To use less space', 'For no reason'], 0],
    ],
  },
  vr: {
    name: 'Virtual Reality', type: 'Digital · Step Inside', emoji: '🥽', badge: 'VR Voyager', build: 'vr',
    mission: '🥽 Put on a VR headset and step INSIDE a computer world. Ready to explore virtual reality?',
    stats: [['Headset', 'You wear it'], ['3D world', 'Feels all around'], ['Tricks senses', 'Eyes & ears'], ['Training too', 'Not just games']],
    facts: ['🥽 Virtual reality (VR) uses a headset to place you inside a computer-made 3D world.', '👀 It shows a slightly different picture to each eye, which tricks your brain into seeing depth.', '🔄 As you turn your head, the virtual world moves around you.', '✈️ VR is used for games, but also to train pilots, doctors and astronauts safely.'],
    fun: 'VR tricks your brain so well that looking down from a virtual cliff can make your real legs feel wobbly!',
    quiz: [
      ['What does a VR headset do?', ['Puts you inside a 3D computer world', 'Cooks dinner', 'Cleans the floor', 'Nothing'], 0],
      { t: 'tf', q: 'VR is used for training as well as for games.', answer: true },
      { t: 'pic', q: 'What do you wear for VR?', options: [
        { shape: 'square', color: '#4DE3FF', label: 'A headset' }, { shape: 'circle', color: '#4DE3FF', label: 'A hat' }, { shape: 'triangle', color: '#4DE3FF', label: 'A shoe' }], answer: 0 },
    ],
    quizHard: [
      ['A VR headset shows each eye a slightly different picture. Why does that matter?', ['It tricks your brain into seeing 3D depth', 'It saves battery', 'It looks brighter', 'It plays sound'], 0],
      { t: 'tf', q: 'Because VR feels so real, it lets pilots and doctors practise safely before the real thing.', answer: true },
      ['When you turn your head in VR, the world turns with you. Why does that make it feel real?', ['It behaves like the real world would', 'It is a photo', 'It is flat', 'It ignores you'], 0],
    ],
  },
};

/* ---------------- procedural wireframe tech ---------------- */
function wireBox(THREE, w, h, d, c = WIRE) {
  const g = new THREE.Group();
  const solid = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(THREE, c, { transparent: true, opacity: 0.15 }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color: c }));
  g.add(solid); g.add(edges);
  return g;
}

function buildDigital(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'coding') {
    const screen = wireBox(THREE, 3.4, 2.4, 0.3); screen.position.y = 2.6; g.add(screen);
    for (let i = 0; i < 4; i++) { const line = new THREE.Mesh(new THREE.BoxGeometry(1.6 - (i % 2) * 0.6, 0.18, 0.05), glow(THREE, i % 2 ? 0x5BF0A5 : WIRE)); line.position.set(-0.5 + (i % 2) * 0.3, 3.2 - i * 0.4, 0.2); idle(line, 'bobY', 0.05, 2 + i); g.add(line); }
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, 1, 8), M(THREE)); stand.position.y = 1; g.add(stand);
  } else if (kind === 'internet') {
    const globe = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), M(THREE, WIRE, { wireframe: true })); globe.position.y = 2.6; g.add(globe); g.userData.spin = globe;
    for (let i = 0; i < 6; i++) { const node = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), glow(THREE, 0x5BF0A5)); const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1); node.position.setFromSphericalCoords(2, b, a).add(new THREE.Vector3(0, 2.6, 0)); globe.add(node); }
  } else if (kind === 'ai') {
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), M(THREE, 0xB26CFF, { emissive: 0x3a1a5a, emissiveIntensity: 0.4 })); core.position.y = 2.6; g.add(core); g.userData.spin = core;
    for (let i = 0; i < 10; i++) { const n = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), glow(THREE, 0x4DE3FF)); const a = (i / 10) * Math.PI * 2; n.position.set(Math.cos(a) * 2.1, 2.6 + Math.sin(a * 2) * 0.8, Math.sin(a) * 2.1); idle(n, 'bobY', 0.2, 2 + i); g.add(n); }
  } else if (kind === 'robots') {
    const head = wireBox(THREE, 1.4, 1.2, 1.2); head.position.y = 3.4; g.add(head);
    for (const dx of [0.35, -0.35]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), glow(THREE, 0x5BF0A5)); eye.position.set(dx, 3.5, 0.6); g.add(eye); }
    const body = wireBox(THREE, 1.8, 1.8, 1.2); body.position.y = 1.8; g.add(body);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), M(THREE)); ant.position.y = 4.3; g.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), glow(THREE, 0xE23B2E)); tip.position.y = 4.7; idle(tip, 'bobY', 0.1, 4); g.add(tip);
  } else if (kind === 'games') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 0.8), M(THREE, WIRE, { transparent: true, opacity: 0.2 })); pad.position.y = 2.4; g.add(pad);
    pad.add(new THREE.LineSegments(new THREE.EdgesGeometry(pad.geometry), new THREE.LineBasicMaterial({ color: WIRE })));
    for (const [dx, c] of [[-1, 0x5BF0A5], [1, 0xE85C9A]]) { const btn = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glow(THREE, c)); btn.position.set(dx, 2.6, 0.5); idle(btn, 'bobY', 0.08, 3); g.add(btn); }
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8), glow(THREE, 0xF6E15A)); stick.position.set(-1, 3, 0.5); g.add(stick);
  } else if (kind === 'chips') {
    const chip = wireBox(THREE, 2.4, 0.4, 2.4, WIRE); chip.position.y = 2.4; g.add(chip);
    for (let i = 0; i < 12; i++) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.15), glow(THREE, 0xF6E15A)); const side = i % 2 ? 1 : -1; leg.position.set(side * 1.5, 2.4, -1 + (Math.floor(i / 2)) * 0.4); g.add(leg); }
    const core = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), glow(THREE, 0x5BF0A5)); core.position.y = 2.65; idle(core, 'breathe', 0.06, 3); g.add(core);
  } else if (kind === 'data') {
    for (let i = 0; i < 24; i++) {
      const one = Math.random() > 0.5;
      const bit = new THREE.Mesh(one ? new THREE.BoxGeometry(0.14, 0.6, 0.1) : new THREE.TorusGeometry(0.24, 0.08, 6, 12), glow(THREE, i % 3 ? WIRE : 0x5BF0A5));
      bit.position.set((Math.random() - 0.5) * 4, 1 + Math.random() * 4, (Math.random() - 0.5) * 2);
      idle(bit, 'bobY', 0.5, 1 + Math.random() * 2); g.add(bit);
    }
  } else if (kind === 'vr') {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.4), M(THREE, WIRE, { transparent: true, opacity: 0.2 })); visor.position.y = 2.8; g.add(visor);
    visor.add(new THREE.LineSegments(new THREE.EdgesGeometry(visor.geometry), new THREE.LineBasicMaterial({ color: WIRE })));
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.9), glow(THREE, 0xB26CFF)); lens.position.set(0, 2.8, 0.72); idle(lens, 'breathe', 0.03, 2); g.add(lens);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.1, 8, 24, Math.PI), M(THREE)); strap.position.y = 2.8; strap.rotation.x = Math.PI / 2; g.add(strap);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Blueprint grid floor.
  const grid = new THREE.GridHelper(R * 2.4, 30, 0x2A6A8A, 0x16384a);
  grid.position.y = -1; group.add(grid);
  // Drifting data bits in the background.
  const N = 100, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 180;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x4DE3FF, size: 0.7, transparent: true, opacity: 0.5 })));

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildDigital(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 5);
    holder.position.set(p.x, p.y + 1, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 1, anims: collectIdle(item), spin: item.userData.spin || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.18;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
      if (m.userData.spin) m.userData.spin.rotation.y += dt * 0.8;
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'digital',
  name: 'Digital World',
  icon: '💻',
  blurb: 'Code, connect, and discover the tech that powers your world.',
  unlockCost: 760,
  category: 'Ideas & Machines',
  theme: { primary: 0x4DE3FF, secondary: 0x5BF0A5, bg: 0x061018, light: 0xCFF6FF, ambient: 0x1a3a4a },
  masterTitle: 'Digital Master 💻',
  subjects: SUBJECTS,
  build,
};
