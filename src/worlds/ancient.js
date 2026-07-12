import { attachMarker, updateMarkers } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 13 — Ancient Civilizations. A world-map globe with each landmark built
 * as a procedural monument sitting at its real latitude/longitude — so finding
 * them is a gentle, implicit geography lesson. The globe itself stays put and
 * the camera's auto-spin (and the kid's drag) orbits around it, which keeps a
 * tapped monument framed instead of drifting away.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.04, flatShading: true, ...o });
const STONE = 0xCBB994, SAND = 0xE0C878, GREY = 0x9A968C;

function latLongToVec3(THREE, lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const SUBJECTS = {
  egypt: {
    name: 'Ancient Egypt', type: 'Ancient · Pyramids', emoji: '🔺', badge: 'Pyramid Pro', build: 'egypt', lat: 30, lon: 31,
    mission: '🔺 The Great Pyramid stood as the tallest building on Earth for nearly 4,000 years. Ready to explore Ancient Egypt?',
    stats: [['Tombs', 'For pharaohs'], ['4,500 yrs', 'Old'], ['2.3 M blocks', 'In the Great Pyramid'], ['Hieroglyphs', 'Their writing']],
    facts: ['🔺 The ancient Egyptians built huge stone pyramids as tombs for their kings, the pharaohs.', '🧱 The Great Pyramid of Giza is about 4,500 years old and made of over 2 million blocks.', '🚜 Each block can weigh as much as a car — and they had no machines!', '📜 The Egyptians wrote using picture-symbols called hieroglyphs.'],
    fun: 'The Great Pyramid was the tallest building in the world for nearly 4,000 years — until modern times!',
    quiz: [
      ['Why did the Egyptians build pyramids?', ['As tombs for their pharaohs', 'As swimming pools', 'For storing rain', 'As playgrounds'], 0],
      { t: 'tf', q: 'The Great Pyramid is thousands of years old.', answer: true },
      { t: 'pic', q: 'Which shape is a pyramid?', options: [
        { shape: 'triangle', color: '#E0C878', label: 'Pyramid' }, { shape: 'circle', color: '#E0C878', label: 'Dome' }, { shape: 'square', color: '#E0C878', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['The Egyptians moved car-heavy blocks with no machines. What does that show about them?', ['They were amazing builders and planners', 'They had trucks', 'They were weak', 'They used magic'], 0],
      { t: 'tf', q: 'Hieroglyphs used little pictures as a way of writing.', answer: true },
      ['The Great Pyramid was the tallest building for almost 4,000 years. What does that tell you about its size?', ['It was enormous for its time', 'It was tiny', 'It was normal', 'It was invisible'], 0],
    ],
  },
  rome: {
    name: 'Ancient Rome', type: 'Ancient · The Colosseum', emoji: '🏛️', badge: 'Colosseum Champ', build: 'rome', lat: 42, lon: 12,
    mission: '🏛️ The Colosseum could hold 50,000 cheering Romans. Ready to march into Ancient Rome?',
    stats: [['50,000', 'Spectators'], ['~2,000 yrs', 'Old'], ['Gladiators', 'Fought there'], ['Roads', 'Rome built many']],
    facts: ['🏛️ The ancient Romans built the Colosseum, a giant arena that held about 50,000 people.', '⚔️ Crowds watched games and gladiator contests there almost 2,000 years ago.', '🛣️ The Romans were brilliant builders — some of their roads and bridges are still used today.', '💧 They carried running water across the land in stone channels called aqueducts.'],
    fun: 'Some ancient Roman roads and bridges are still standing and in use today, nearly 2,000 years later!',
    quiz: [
      ['What was the Colosseum?', ['A giant arena for crowds', 'A tiny house', 'A boat', 'A farm'], 0],
      { t: 'tf', q: 'Some Roman roads are still used today.', answer: true },
      { t: 'pic', q: 'Which shape matches a round Roman arena?', options: [
        { shape: 'oval', color: '#CBB994', label: 'Arena' }, { shape: 'triangle', color: '#CBB994', label: 'Cone' }, { shape: 'square', color: '#CBB994', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Roman roads and aqueducts still work after 2,000 years. What does that prove?', ['The Romans were expert engineers', 'They were lucky', 'They used plastic', 'They were modern'], 0],
      { t: 'tf', q: 'An arena that holds 50,000 people tells us Roman cities were very large.', answer: true },
      ['Aqueducts carried water across the land. What everyday need did that solve?', ['Getting fresh water to cities', 'Making music', 'Growing hair', 'Telling time'], 0],
    ],
  },
  greece: {
    name: 'Ancient Greece', type: 'Ancient · Cradle of Ideas', emoji: '🏺', badge: 'Idea Igniter', build: 'greece', lat: 38, lon: 24,
    mission: '🏺 The Olympics and "voting" both began in Ancient Greece. Ready to visit the cradle of ideas?',
    stats: [['Democracy', 'Started here'], ['Olympics', 'First held here'], ['Philosophers', 'Big thinkers'], ['Myths', 'Gods & heroes']],
    facts: ['🏺 Ancient Greece gave the world democracy — the idea that people vote to decide things.', '🏃 The first Olympic Games were held in Greece over 2,700 years ago.', '🤔 Famous thinkers called philosophers, like Socrates, asked big questions about life.', '⚡ The Greeks told exciting myths about gods and heroes like Zeus and Hercules.'],
    fun: 'In the very first Olympics there was just ONE event — a short running race — and the winner got a crown of leaves!',
    quiz: [
      ['What big idea started in Ancient Greece?', ['Democracy — people voting', 'Television', 'Cars', 'Pizza delivery'], 0],
      { t: 'tf', q: 'The first Olympic Games were held in Greece.', answer: true },
      { t: 'pic', q: 'Which shape matches a tall Greek temple column?', options: [
        { shape: 'tall', color: '#EDE6D0', label: 'Column' }, { shape: 'circle', color: '#EDE6D0', label: 'Ball' }, { shape: 'square', color: '#EDE6D0', label: 'Cube' }], answer: 0 },
    ],
    quizHard: [
      ['In a democracy, people vote to decide things. Why was that such a big new idea?', ['Ordinary people got a say, not just kings', 'It was faster', 'It needed no thinking', 'It was a game'], 0],
      { t: 'tf', q: 'Philosophers like Socrates are remembered for asking big questions.', answer: true },
      ['The Olympics began in Greece long ago and still happen today. What does that make it?', ['A tradition thousands of years old', 'A brand-new invention', 'A myth', 'A single race'], 0],
    ],
  },
  greatwall: {
    name: 'Great Wall of China', type: 'Ancient · The Longest Wall', emoji: '🧱', badge: 'Wall Walker', build: 'greatwall', lat: 40, lon: 117,
    mission: '🧱 The Great Wall of China is so long it would stretch halfway around the world! Ready to walk the wall?',
    stats: [['21,000 km', 'Total length'], ['Defence', 'Why it was built'], ['Centuries', 'To build it'], ['China', 'Where it is']],
    facts: ['🧱 The Great Wall of China is the longest wall ever built — over 21,000 km in total.', '🛡️ It was built over many centuries to protect China from invaders.', '⛰️ It winds across mountains, deserts and grasslands.', '👷 Millions of workers helped build it by hand.'],
    fun: 'The Great Wall isn\'t one wall — it\'s many walls built over 2,000 years that together stretch more than halfway around Earth!',
    quiz: [
      ['Why was the Great Wall built?', ['To defend China from invaders', 'For sliding down', 'To hold water', 'As a road for cars'], 0],
      { t: 'tf', q: 'The Great Wall is thousands of kilometres long.', answer: true },
      { t: 'pic', q: 'Which shape matches a long, straight wall?', options: [
        { shape: 'square', color: '#9A968C', label: 'Wall' }, { shape: 'circle', color: '#9A968C', label: 'Ball' }, { shape: 'triangle', color: '#9A968C', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['The wall took centuries and millions of workers. What does that tell you about the job?', ['It was a truly enormous effort', 'It was quick and easy', 'One person built it', 'It built itself'], 0],
      { t: 'tf', q: 'A wall that long crossing mountains and deserts shows how big China is.', answer: true },
      ['The Great Wall was built for defence. What was it trying to keep out?', ['Invading armies', 'Rain', 'Sunlight', 'Birds'], 0],
    ],
  },
  machupicchu: {
    name: 'Machu Picchu', type: 'Ancient · Lost Inca City', emoji: '⛰️', badge: 'Mountain Finder', build: 'machu', lat: -13, lon: -72,
    mission: '⛰️ High in the mountains hides the lost Inca city of Machu Picchu. Ready to climb to the clouds?',
    stats: [['Inca', 'Built it'], ['2,430 m', 'High up'], ['Andes', 'Mountain range'], ['No wheels', 'Or iron tools']],
    facts: ['⛰️ Machu Picchu is an ancient city built by the Inca people high in the Andes mountains of Peru.', '☁️ It sits about 2,430 m up — often above the clouds!', '🧱 The Inca fitted huge stones together so tightly you can\'t slip paper between them — no cement!', '🛠️ They built it all without the wheel or iron tools.'],
    fun: 'The Inca built Machu Picchu\'s stone walls so perfectly that they\'ve survived earthquakes for over 500 years!',
    quiz: [
      ['Who built Machu Picchu?', ['The Inca people', 'The Romans', 'The Egyptians', 'Robots'], 0],
      { t: 'tf', q: 'Machu Picchu is high up in the mountains.', answer: true },
      { t: 'pic', q: 'Which shape matches a mountain peak?', options: [
        { shape: 'triangle', color: '#7E8A6A', label: 'Peak' }, { shape: 'circle', color: '#7E8A6A', label: 'Ball' }, { shape: 'square', color: '#7E8A6A', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['The Inca\'s stone walls survive earthquakes after 500 years. What does that show?', ['They were master stone builders', 'They used cement', 'They were lucky', 'The walls are new'], 0],
      { t: 'tf', q: 'Building a whole city with no wheels or iron tools was an amazing achievement.', answer: true },
      ['Machu Picchu sits above the clouds. What does that tell you about where the Inca built?', ['Very high in the mountains', 'By the sea', 'In a desert', 'Underground'], 0],
    ],
  },
  stonehenge: {
    name: 'Stonehenge', type: 'Ancient · Mystery Circle', emoji: '🗿', badge: 'Mystery Keeper', build: 'stonehenge', lat: 51, lon: -2,
    mission: '🗿 Who moved giant stones to build Stonehenge 5,000 years ago — and why? Ready to solve a mystery?',
    stats: [['5,000 yrs', 'Old'], ['Stone circle', 'Its shape'], ['25 tonnes', 'Biggest stones'], ['Mystery', 'Its purpose']],
    facts: ['🗿 Stonehenge is a ring of giant standing stones in England, built about 5,000 years ago.', '🐘 Some stones weigh as much as 25 tonnes — heavier than three elephants!', '❓ No one knows for sure why it was built, which makes it a great mystery.', '🌅 The stones line up with the sunrise on the longest and shortest days of the year.'],
    fun: 'Some of Stonehenge\'s stones were carried nearly 250 km — and no one is completely sure HOW, 5,000 years ago!',
    quiz: [
      ['What is Stonehenge?', ['A ring of giant standing stones', 'A tall tower', 'A river', 'A castle'], 0],
      { t: 'tf', q: 'We are not completely sure why Stonehenge was built.', answer: true },
      { t: 'pic', q: 'What shape are Stonehenge\'s stones arranged in?', options: [
        { shape: 'circle', color: '#9A968C', label: 'Circle' }, { shape: 'square', color: '#9A968C', label: 'Square' }, { shape: 'triangle', color: '#9A968C', label: 'Triangle' }], answer: 0 },
    ],
    quizHard: [
      ['The stones line up with sunrise on the longest and shortest days. What might Stonehenge have helped track?', ['The seasons of the year', 'Phone calls', 'Football scores', 'Bus times'], 0],
      { t: 'tf', q: 'Moving 25-tonne stones 5,000 years ago, with no machines, is why it\'s such a puzzle.', answer: true },
      ['We still don\'t know exactly why Stonehenge was built. What does that make it?', ['A fascinating mystery', 'A modern building', 'A well-known fact', 'A kind of animal'], 0],
    ],
  },
  maya: {
    name: 'Mayan Pyramids', type: 'Ancient · Sky-Watchers', emoji: '🔺', badge: 'Star Reader', build: 'maya', lat: 21, lon: -88,
    mission: '🔺 The Maya built step-pyramids and tracked the stars with an amazing calendar. Ready to meet the Maya?',
    stats: [['Maya', 'Built them'], ['Step pyramids', 'Their shape'], ['Astronomers', 'Watched the sky'], ['Zero', 'They used it early']],
    facts: ['🔺 The Maya lived in Central America and built stepped pyramids topped with temples.', '🔭 They were expert astronomers who tracked the Sun, Moon and stars.', '📅 They created a very accurate calendar hundreds of years ago.', '0️⃣ They were among the first people to use the number zero in maths.'],
    fun: 'At the Mayan pyramid of Chichen Itza, twice a year sunlight makes a shadow shaped like a slithering snake down the steps!',
    quiz: [
      ['What were the Maya expert at watching?', ['The stars and sky', 'Television', 'Football', 'Trains'], 0],
      { t: 'tf', q: 'The Maya used the number zero long ago.', answer: true },
      { t: 'pic', q: 'Which shape matches a step pyramid?', options: [
        { shape: 'triangle', color: '#C7A876', label: 'Pyramid' }, { shape: 'circle', color: '#C7A876', label: 'Dome' }, { shape: 'oval', color: '#C7A876', label: 'Egg' }], answer: 0 },
    ],
    quizHard: [
      ['The Maya made an accurate calendar. How did watching the sky help them do that?', ['The Sun and stars follow regular patterns', 'The sky told them secrets', 'They guessed', 'Stars gave them clocks'], 0],
      { t: 'tf', q: 'Using the number zero shows the Maya were skilled at maths.', answer: true },
      ['Sunlight makes a snake-shaped shadow at Chichen Itza on two special days. What does that show the Maya understood?', ['How the Sun moves through the year', 'How to paint', 'How to fly', 'How to swim'], 0],
    ],
  },
  mesopotamia: {
    name: 'Mesopotamia', type: 'Ancient · First Writing', emoji: '📜', badge: 'First Scribe', build: 'mesopotamia', lat: 33, lon: 44,
    mission: '📜 In Mesopotamia, people invented WRITING — and changed the world forever. Ready to visit the first cities?',
    stats: [['First writing', 'Cuneiform'], ['Two rivers', 'Its home'], ['First cities', 'Grew here'], ['The wheel', 'Invented here']],
    facts: ['📜 Mesopotamia, between two rivers in the Middle East, is called the "cradle of civilization".', '✍️ People there invented one of the world\'s first writing systems, cuneiform, pressed into clay.', '🏙️ It\'s also where some of the first cities grew, over 5,000 years ago.', '🛞 The wheel was invented in this region too!'],
    fun: 'The earliest writing wasn\'t stories — it was lists of things like grain and sheep, so people could track what they owned!',
    quiz: [
      ['What did people in Mesopotamia invent?', ['One of the first writing systems', 'The internet', 'Aeroplanes', 'Ice cream'], 0],
      { t: 'tf', q: 'Some of the first cities in the world grew in Mesopotamia.', answer: true },
      { t: 'pic', q: 'Early writing was pressed into which material?', options: [
        { shape: 'square', color: '#B98A5A', label: 'Clay' }, { shape: 'circle', color: '#4BA6E8', label: 'Water' }, { shape: 'star', color: '#F6E15A', label: 'Light' }], answer: 0 },
    ],
    quizHard: [
      ['The first writing was lists of grain and sheep. Why would people want to write those down?', ['To keep track of what they owned', 'To tell jokes', 'To sing', 'To fly'], 0],
      { t: 'tf', q: 'Being between two rivers gave Mesopotamia water for farming, which helped cities grow.', answer: true },
      ['The wheel was invented in Mesopotamia. What did the wheel most help people do?', ['Move things and travel', 'Read faster', 'See in the dark', 'Cook food'], 0],
    ],
  },
};

/* ---------------- procedural monuments ---------------- */
function buildMonument(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'egypt' || kind === 'maya') {
    if (kind === 'egypt') {
      const p = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 4), M(THREE, SAND));
      p.rotation.y = Math.PI / 4; p.position.y = 1.2; g.add(p);
    } else {
      for (let i = 0; i < 4; i++) {
        const s = 2 - i * 0.45;
        const step = new THREE.Mesh(new THREE.BoxGeometry(s, 0.5, s), M(THREE, 0xC7A876));
        step.position.y = 0.25 + i * 0.5; g.add(step);
      }
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), M(THREE, 0xB09060));
      temple.position.y = 2.3; g.add(temple);
    }
  } else if (kind === 'rome') {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.4, 20, 1, true), M(THREE, STONE, { side: THREE.DoubleSide }));
    ring.position.y = 0.9; g.add(ring);
    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1, 18, 1, true), M(THREE, 0xBBAA84, { side: THREE.DoubleSide }));
    ring2.position.y = 1.6; g.add(ring2);
  } else if (kind === 'greece') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 2), M(THREE, 0xEDE6D0)); base.position.y = 0.2; g.add(base);
    for (let i = 0; i < 4; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2, 10), M(THREE, 0xF2ECD8));
      col.position.set(-1.1 + i * 0.73, 1.4, 0); g.add(col);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 0.8, 4), M(THREE, 0xE0D8C0));
    roof.rotation.y = Math.PI / 4; roof.position.y = 2.8; g.add(roof);
  } else if (kind === 'greatwall') {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.8), M(THREE, GREY)); wall.position.y = 0.5; g.add(wall);
    for (let i = 0; i < 5; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.8), M(THREE, 0x8A867C));
      tooth.position.set(-1.6 + i * 0.8, 1.2, 0); g.add(tooth);
    }
    for (const dx of [-1.6, 1.6]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 1), M(THREE, GREY));
      tower.position.set(dx, 0.8, 0); g.add(tower);
    }
  } else if (kind === 'machu') {
    const peak = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 5), M(THREE, 0x7E8A6A)); peak.position.y = 1.2; g.add(peak);
    for (let i = 0; i < 3; i++) {
      const terrace = new THREE.Mesh(new THREE.BoxGeometry(1.6 - i * 0.4, 0.3, 0.5), M(THREE, 0xA8A088));
      terrace.position.set(0, 0.4 + i * 0.5, 1 - i * 0.3); g.add(terrace);
    }
  } else if (kind === 'stonehenge') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.4), M(THREE, GREY));
      stone.position.set(Math.cos(a) * 1.4, 0.8, Math.sin(a) * 1.4); g.add(stone);
      if (i % 2 === 0) {
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.4), M(THREE, 0x8A867C));
        lintel.position.set(Math.cos(a + 0.5) * 1.4, 1.7, Math.sin(a + 0.5) * 1.4); lintel.rotation.y = -a; g.add(lintel);
      }
    }
  } else if (kind === 'mesopotamia') {
    for (let i = 0; i < 3; i++) {
      const s = 2.4 - i * 0.7;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(s, 0.6, s), M(THREE, 0xC79A5A));
      tier.position.y = 0.3 + i * 0.6; g.add(tier);
    }
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.15), M(THREE, 0xB98A5A));
    tablet.position.set(1.6, 1, 1); tablet.rotation.z = 0.2; g.add(tablet);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const R = 14;

  // World-map globe: blue seas + rough green continents.
  const globe = new THREE.Group();
  const sea = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 24), M(THREE, 0x2E6FB0, { flatShading: false }));
  globe.add(sea);
  for (let i = 0; i < 18; i++) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 3, 10, 8), M(THREE, 0x4E9E4A));
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
    patch.position.setFromSphericalCoords(R, v, u); patch.scale.set(1.2, 0.4, 1.2); patch.lookAt(0, 0, 0); globe.add(patch);
  }
  group.add(globe);

  Object.keys(SUBJECTS).forEach((key) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const mon = buildMonument(THREE, def.build);
    mon.scale.setScalar(1.3);
    holder.add(mon);
    const pos = latLongToVec3(THREE, def.lat, def.lon, R);
    holder.position.copy(pos);
    holder.up.set(0, 1, 0);
    holder.lookAt(pos.clone().multiplyScalar(2)); // orient monument outward from globe
    holder.rotateX(-Math.PI / 2);
    holder.userData = { key, def, focusRadius: 4, phase: Math.random() * 6, anims: collectIdle(mon) };
    // A little ground pad so the monument reads as sitting on the surface.
    const pad = new THREE.Mesh(new THREE.CircleGeometry(2.2, 16), M(THREE, 0xCBB27A, { transparent: true, opacity: 0.5 }));
    pad.rotation.x = -Math.PI / 2; pad.position.y = -0.05; holder.add(pad);
    attachMarker(THREE, holder, isDone(key), 2.6);
    clickables.push(holder);
    globe.add(holder); // ride on the globe (globe stays still; camera orbits)
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => runIdle(m.userData.anims, t));
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 44 } };
}

export default {
  key: 'ancient',
  name: 'Ancient Civilizations',
  icon: '🏺',
  blurb: 'Walk among pyramids, ancient walls, and lost cities of the past.',
  unlockCost: 364,
  category: 'People & Places',
  theme: { primary: 0xD9A94E, secondary: 0x8A6A2F, bg: 0x120e08, light: 0xFFE8B0, ambient: 0x4a4030 },
  masterTitle: 'History Master 🏺',
  subjects: SUBJECTS,
  build,
};
