import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 15 — Space Explorers. Human space travel and the machines that make it
 * possible — distinct from Universe (celestial bodies). A starry scene with
 * procedural tech: the ISS, a Moon-landing scene, a Mars rover, a spacesuit,
 * a satellite, a telescope, floating space food and a tethered spacewalk.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.4, flatShading: true, ...o });

const SUBJECTS = {
  iss: {
    name: 'Space Station', type: 'Space · Home in Orbit', emoji: '🛰️', badge: 'Station Chief', build: 'iss',
    mission: '🛰️ Astronauts live and work on the ISS, zooming around Earth 16 times a day! Ready to visit their home in space?',
    stats: [['400 km', 'Above Earth'], ['16×', 'Orbits per day'], ['Floating', 'No gravity felt'], ['Lab', 'Science in space']],
    facts: ['🛰️ The International Space Station is a giant lab where astronauts live and work in space.', '🌅 It circles the Earth about 16 times every day — a sunrise every 90 minutes!', '🎈 Astronauts float because they are really falling around Earth (microgravity).', '👨‍👩‍👧 People have lived on it continuously for over 20 years.'],
    fun: 'Astronauts on the ISS see 16 sunrises and 16 sunsets every single day as they race around Earth!',
    quiz: [
      ['What is the ISS?', ['A lab where astronauts live in space', 'A planet', 'A star', 'A rocket engine'], 0],
      { t: 'tf', q: 'Astronauts float around inside the ISS.', answer: true },
      { t: 'pic', q: 'Which body does the ISS circle?', options: [
        { shape: 'circle', color: '#3E8EDE', label: 'Earth' }, { shape: 'circle', color: '#F6D64A', label: 'The Sun' }, { shape: 'circle', color: '#9A968C', label: 'The Moon' }], answer: 0 },
    ],
    quizHard: [
      ['Astronauts float on the ISS. Why do they feel weightless up there?', ['They are constantly falling around Earth', 'There is no gravity in space at all', 'The station blows air up', 'They wear floating shoes'], 0],
      { t: 'tf', q: 'Circling Earth 16 times a day means the ISS travels incredibly fast.', answer: true },
      ['The ISS is a laboratory. Why do scientists want a lab in space?', ['To do experiments you can\'t do on Earth', 'To be closer to the Sun', 'To hide from people', 'To grow taller'], 0],
    ],
  },
  moonlanding: {
    name: 'Moon Landing', type: 'Space · One Giant Leap', emoji: '🌕', badge: 'Moonwalker', build: 'moon',
    mission: '🌕 In 1969, humans walked on the Moon for the first time. Ready to take one giant leap?',
    stats: [['1969', 'First landing'], ['Apollo 11', 'The mission'], ['12 people', 'Have walked there'], ['Footprints', 'Still there']],
    facts: ['🌕 In 1969, Apollo 11 carried the first humans to walk on the Moon.', '👣 Because the Moon has no wind or rain, the astronauts\' footprints are still there today!', '🚀 Getting there meant a giant rocket and a four-day journey.', '🧑‍🚀 In total, only 12 people have ever walked on the Moon.'],
    fun: 'The footprints left on the Moon in 1969 could stay there for millions of years — there\'s no wind to blow them away!',
    quiz: [
      ['When did humans first walk on the Moon?', ['1969', '2020', '1500', 'Last year'], 0],
      { t: 'tf', q: 'Footprints on the Moon can last a long time because there is no wind.', answer: true },
      { t: 'pic', q: 'Which colour is the Moon?', options: [
        { shape: 'circle', color: '#C9C9D4', label: 'Grey' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }], answer: 0 },
    ],
    quizHard: [
      ['The Moon has no wind or rain. Why does that mean the footprints stay?', ['Nothing is there to wipe them away', 'They are painted on', 'Astronauts glued them', 'The Sun freezes them'], 0],
      { t: 'tf', q: 'With only 12 people ever having walked on the Moon, it is a very rare achievement.', answer: true },
      ['To reach the Moon, astronauts needed a giant rocket. What were they escaping from?', ['Earth\'s strong gravity', 'The rain', 'The ocean', 'The wind'], 0],
    ],
  },
  marsrover: {
    name: 'Mars Rover', type: 'Space · Robot Explorer', emoji: '🤖', badge: 'Rover Driver', build: 'rover',
    mission: '🤖 Robot rovers are exploring Mars right now, driving across an alien world. Ready to take the wheel?',
    stats: [['Robot', 'Explores Mars'], ['Wheels', 'Drives around'], ['From Earth', 'Controlled remotely'], ['Rocks', 'It studies them']],
    facts: ['🤖 A Mars rover is a robot car that explores the surface of Mars.', '📸 It drives slowly, takes photos, and even drills into rocks to study them.', '📡 Scientists on Earth send it commands — but signals take minutes to arrive!', '💧 Rovers have found signs that Mars once had water.'],
    fun: 'Radio signals take up to 20 minutes to travel from Earth to a Mars rover — so drivers can\'t steer it live!',
    quiz: [
      ['What is a Mars rover?', ['A robot that explores Mars', 'A kind of star', 'A Martian animal', 'A rocket'], 0],
      { t: 'tf', q: 'Mars rovers are controlled by scientists back on Earth.', answer: true },
      { t: 'pic', q: 'Which planet do rovers explore?', options: [
        { shape: 'circle', color: '#D4593A', label: 'Mars (red)' }, { shape: 'circle', color: '#3E8EDE', label: 'Earth' }, { shape: 'circle', color: '#F6D64A', label: 'The Sun' }], answer: 0 },
    ],
    quizHard: [
      ['Signals take up to 20 minutes to reach Mars. Why can\'t drivers steer a rover live?', ['Commands arrive too late to react in time', 'The rover is asleep', 'Mars has no roads', 'The rover is too fast'], 0],
      { t: 'tf', q: 'A rover drills into rocks to learn about Mars, like whether it once had water.', answer: true },
      ['Rovers drive very slowly and carefully. Why be so careful on Mars?', ['They are far away and hard to fix', 'They are lazy', 'Mars is crowded', 'They enjoy the view'], 0],
    ],
  },
  spacesuit: {
    name: 'Spacesuit', type: 'Space · Wearable Ship', emoji: '👨‍🚀', badge: 'Suit Specialist', build: 'suit',
    mission: '👨‍🚀 A spacesuit is like a tiny spaceship you wear! Ready to suit up for space?',
    stats: [['Air', 'Gives to breathe'], ['Pressure', 'Protects the body'], ['Temperature', 'Keeps it just right'], ['Mini ship', 'You wear it']],
    facts: ['👨‍🚀 A spacesuit is like a tiny personal spaceship that keeps an astronaut alive.', '💨 It holds air to breathe and the right pressure so their body stays safe.', '🌡️ It protects against the burning Sun on one side and freezing cold on the other.', '🥤 It even has a drink bag — and takes about 45 minutes to put on!'],
    fun: 'A spacesuit is so complex it can cost as much as a house — and takes about 45 minutes just to put on!',
    quiz: [
      ['What does a spacesuit give an astronaut?', ['Air to breathe and protection', 'A snack only', 'A phone', 'Wings'], 0],
      { t: 'tf', q: 'A spacesuit protects against both extreme heat and extreme cold.', answer: true },
      { t: 'pic', q: 'Which colour is a classic spacesuit?', options: [
        { shape: 'circle', color: '#F2F4F7', label: 'White' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Space has no air. Why does that make a spacesuit essential for an astronaut outside?', ['It carries the air they need to breathe', 'It looks cool', 'It plays music', 'It makes them float'], 0],
      { t: 'tf', q: 'Because a spacesuit provides air, pressure and warmth, it works like a tiny spaceship.', answer: true },
      ['One side of an astronaut faces the hot Sun, the other faces cold shadow. What must the suit do?', ['Keep the body at a safe, even temperature', 'Only keep them warm', 'Only keep them cool', 'Nothing about temperature'], 0],
    ],
  },
  satellite: {
    name: 'Satellite', type: 'Space · Sky Helper', emoji: '📡', badge: 'Signal Sender', build: 'satellite',
    mission: '📡 Satellites circling Earth beam you TV, maps, and weather! Ready to find out what\'s up there?',
    stats: [['Orbits Earth', 'Machines do'], ['GPS', 'Helps maps'], ['Weather', 'They watch it'], ['Thousands', 'Up there now']],
    facts: ['📡 A satellite is a machine that orbits (circles) the Earth.', '🗺️ Satellites carry TV and phone signals, help GPS maps find your way, and watch the weather.', '🔢 There are thousands of working satellites up there right now.', '🌙 The Moon is Earth\'s natural satellite!'],
    fun: 'GPS in a phone works by listening to several satellites at once and using their signals to pinpoint where you are!',
    quiz: [
      ['What does a satellite do?', ['Orbits Earth and sends signals', 'Grows plants', 'Digs tunnels', 'Melts ice'], 0],
      { t: 'tf', q: 'Satellites help with maps, weather and TV.', answer: true },
      { t: 'pic', q: 'What do most satellites circle?', options: [
        { shape: 'circle', color: '#3E8EDE', label: 'Earth' }, { shape: 'circle', color: '#F6D64A', label: 'The Sun' }, { shape: 'star', color: '#F2F4F7', label: 'A star' }], answer: 0 },
    ],
    quizHard: [
      ['A phone\'s GPS listens to several satellites at once. Why does it need more than one?', ['Their signals together pinpoint your spot', 'One is broken', 'For company', 'To save power'], 0],
      { t: 'tf', q: 'Because satellites look down from high up, they can watch weather over huge areas.', answer: true },
      ['The Moon is called Earth\'s natural satellite. What does "satellite" really mean?', ['Something that orbits a planet', 'Something made of cheese', 'A kind of star', 'A rocket'], 0],
    ],
  },
  telescope: {
    name: 'Telescope', type: 'Space · Far-Seeing Eye', emoji: '🔭', badge: 'Star Gazer', build: 'telescope',
    mission: '🔭 A telescope lets you peer across the universe — even back in time! Ready to look deep into space?',
    stats: [['Sees far', 'Distant things'], ['Light', 'It collects it'], ['Space too', 'Some orbit'], ['Back in time', 'Far = old light']],
    facts: ['🔭 A telescope collects light to let us see faraway things clearly.', '🔵 The bigger the telescope, the fainter and farther it can see.', '🛰️ Some telescopes, like Hubble and Webb, orbit in space above the blurry air.', '⏳ Because light takes time to travel, looking far away is like looking back in time!'],
    fun: 'When you look at a distant galaxy through a telescope, you see light that left it millions of years ago — a peek into the past!',
    quiz: [
      ['What does a telescope collect to see far away?', ['Light', 'Water', 'Wind', 'Sound'], 0],
      { t: 'tf', q: 'Some telescopes orbit in space, above Earth\'s air.', answer: true },
      { t: 'pic', q: 'Which shape matches a telescope tube?', options: [
        { shape: 'tall', color: '#B0B8C4', label: 'Tube' }, { shape: 'circle', color: '#B0B8C4', label: 'Ball' }, { shape: 'square', color: '#B0B8C4', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['A bigger telescope can see fainter, farther things. Why does size help?', ['A bigger one collects more light', 'It is heavier', 'It is closer', 'It is shinier'], 0],
      { t: 'tf', q: 'Putting a telescope in space avoids the blurry, wobbly air around Earth.', answer: true },
      ['Light from a far galaxy is millions of years old. So looking far away is like doing what?', ['Looking back in time', 'Looking into the future', 'Looking at yourself', 'Looking down'], 0],
    ],
  },
  spacefood: {
    name: 'Space Food', type: 'Space · Floating Meals', emoji: '🍽️', badge: 'Cosmic Chef', build: 'food',
    mission: '🍽️ How do you eat when your food floats away? Ready to discover astronaut dinners?',
    stats: [['No crumbs', 'They float & spread'], ['Pouches', 'Squeeze meals'], ['Tortillas', 'Instead of bread'], ['Floats', 'Everything does']],
    facts: ['🍽️ In space, food floats — so astronauts have to eat very carefully!', '💧 Many meals are dried out to save weight, then water is added to eat them.', '🌯 Astronauts use tortillas instead of bread, because crumbs would float everywhere.', '🥤 Drinks are sipped from sealed pouches through a straw.'],
    fun: 'Astronauts can\'t sprinkle salt or pepper — the grains would float away! Instead they use liquid salt and pepper drops.',
    quiz: [
      ['Why do astronauts eat tortillas instead of bread?', ['Bread crumbs would float everywhere', 'Tortillas taste better only', 'Bread is banned', 'There is no bread on Earth'], 0],
      { t: 'tf', q: 'In space, food and drinks float around.', answer: true },
      { t: 'pic', q: 'Which is safer to eat in space?', options: [
        { shape: 'circle', color: '#E8C878', label: 'Tortilla' }, { shape: 'square', color: '#C9A05A', label: 'Crumbly bread' }, { shape: 'triangle', color: '#E23B2E', label: 'Loose crumbs' }], answer: 0 },
    ],
    quizHard: [
      ['Floating crumbs are a problem in space. Why can they be dangerous?', ['They could get in eyes or machines', 'They taste bad', 'They are too heavy', 'They melt'], 0],
      { t: 'tf', q: 'Drying food removes water and weight, which makes it cheaper to launch into space.', answer: true },
      ['Drinks come in sealed pouches with a straw. Why not use an open cup?', ['The drink would float out of the cup', 'Cups are too heavy', 'Straws are tastier', 'Cups are banned'], 0],
    ],
  },
  spacewalk: {
    name: 'Spacewalk', type: 'Space · Working Outside', emoji: '🚶', badge: 'Spacewalker', build: 'spacewalk',
    mission: '🚶 A spacewalk means floating OUTSIDE the spaceship in the emptiness of space. Ready to step out?',
    stats: [['Outside', 'The spaceship'], ['Tether', 'Keeps them attached'], ['Repairs', 'Fix & build'], ['Floating', 'In empty space']],
    facts: ['🚶 A spacewalk is when an astronaut goes outside the spacecraft, floating in space.', '🪢 They wear a spacesuit and clip on a safety tether so they don\'t drift away.', '🔧 Spacewalks are used to fix or build things, like repairing the space station.', '⏱️ They can last many hours of careful work.'],
    fun: 'During a spacewalk, an astronaut is really their own tiny spaceship — floating at 28,000 km/h around Earth!',
    quiz: [
      ['What is a spacewalk?', ['Going outside the spacecraft in space', 'Walking on the Sun', 'A walk on a treadmill', 'A dream'], 0],
      { t: 'tf', q: 'Astronauts clip on a tether so they don\'t float away.', answer: true },
      { t: 'pic', q: 'What stops an astronaut drifting away on a spacewalk?', options: [
        { shape: 'square', color: '#DDDDDD', label: 'A tether line' }, { shape: 'circle', color: '#33313F', label: 'Nothing' }, { shape: 'star', color: '#F6E15A', label: 'A star' }], answer: 0 },
    ],
    quizHard: [
      ['There is nothing to hold onto in open space. Why is a tether so important on a spacewalk?', ['Without it, an astronaut could float away', 'It keeps them warm', 'It carries their lunch', 'It makes them fast'], 0],
      { t: 'tf', q: 'Spacewalks let astronauts fix and build things that can\'t be done from inside.', answer: true },
      ['Astronauts train for years before a spacewalk. Why prepare so much?', ['Space is risky, so care keeps them safe', 'It is a party', 'To grow taller', 'There is nothing to do'], 0],
    ],
  },
};

/* ---------------- procedural space tech ---------------- */
function solarPanels(THREE, g, y, span) {
  for (const dx of [1, -1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(span, 0.1, 1.6), M(THREE, 0x2A3A6A, { emissive: 0x14204a, emissiveIntensity: 0.3 }));
    panel.position.set(dx * (span / 2 + 0.8), y, 0); g.add(panel);
  }
}
function astronaut(THREE) {
  const a = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.1, 6, 12), M(THREE, 0xF2F4F7, { metalness: 0.1, roughness: 0.6 }));
  body.position.y = 1.6; idle(body, 'bobY', 0.15, 1.5); a.add(body);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 12), M(THREE, 0x2A2A33, { metalness: 0.6, roughness: 0.2 }));
  helmet.position.y = 2.7; a.add(helmet);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0x8FD0FF, transparent: true, opacity: 0.6 }));
  visor.position.set(0, 2.7, 0.3); a.add(visor);
  for (const dx of [1, -1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.9, 4, 8), M(THREE, 0xF2F4F7));
    arm.position.set(dx * 0.9, 1.7, 0); arm.rotation.z = dx * 0.5; a.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), M(THREE, 0xF2F4F7));
    leg.position.set(dx * 0.35, 0.5, 0); a.add(leg);
  }
  return a;
}

function buildSpace(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'iss') {
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 12), M(THREE, 0xD8DCE4));
    core.rotation.z = Math.PI / 2; core.position.y = 2; g.add(core);
    solarPanels(THREE, g, 2, 3.4);
    const mod = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 10), M(THREE, 0xC4CAD4));
    mod.position.set(0, 3, 0); g.add(mod);
    idle(g, 'sway', 0.05, 0.6, 'y');
  } else if (kind === 'moon') {
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 16), M(THREE, 0xC9C9D4, { metalness: 0.05, roughness: 1 }));
    moon.position.y = 1.6; g.add(moon);
    for (let i = 0; i < 6; i++) {
      const cr = new THREE.Mesh(new THREE.CircleGeometry(0.2 + Math.random() * 0.3, 10), M(THREE, 0xA8A8B4));
      const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
      cr.position.setFromSphericalCoords(2.62, b, a).add(new THREE.Vector3(0, 1.6, 0)); cr.lookAt(0, 1.6, 0); moon.add(cr);
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 6), M(THREE, 0xDDDDDD)); pole.position.set(2, 3.5, 0); g.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.04), M(THREE, 0xE23B2E)); flag.position.set(2.5, 4.2, 0); g.add(flag);
  } else if (kind === 'rover') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.6), M(THREE, 0xD8B36A)); body.position.y = 1.2; g.add(body);
    solarPanels(THREE, g, 2, 1.6);
    for (const dx of [-0.9, 0, 0.9]) for (const dz of [0.9, -0.9]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), M(THREE, 0x33333A));
      w.rotation.x = Math.PI / 2; w.position.set(dx, 0.4, dz); g.add(w);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), M(THREE, 0xBBBBBB)); mast.position.set(0.8, 2.2, 0); g.add(mast);
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), M(THREE, 0x222)); cam.position.set(0.8, 2.9, 0); g.add(cam);
  } else if (kind === 'suit' || kind === 'spacewalk') {
    const a = astronaut(THREE); g.add(a);
    if (kind === 'spacewalk') {
      const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 6), M(THREE, 0xDDDD88));
      tether.position.set(-2, 0.5, 0); tether.rotation.z = 0.8; g.add(tether);
      idle(g, 'bobY', 0.3, 1.2);
    }
  } else if (kind === 'satellite') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), M(THREE, 0xC0C6D0)); body.position.y = 2; g.add(body);
    solarPanels(THREE, g, 2, 2.6);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0xE0E4EA, { side: THREE.DoubleSide }));
    dish.position.set(0, 3, 0.6); dish.rotation.x = -0.6; g.add(dish);
    idle(g, 'sway', 0.06, 0.7, 'y');
  } else if (kind === 'telescope') {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 4, 16), M(THREE, 0xB0B8C4));
    tube.position.y = 2.4; tube.rotation.z = -0.5; g.add(tube);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16), new THREE.MeshBasicMaterial({ color: 0x8FD0FF }));
    lens.position.set(1.7, 3.6, 0); lens.rotation.z = -0.5; g.add(lens);
    const tri = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.6, 3), M(THREE, 0x8A909A)); tri.position.y = 0.8; g.add(tri);
    idle(g, 'sway', 0.08, 0.6, 'y');
  } else if (kind === 'food') {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.4), M(THREE, 0xC0C6C0, { metalness: 0.5, roughness: 0.4 }));
    pouch.position.y = 2; idle(pouch, 'bobY', 0.2, 1.5); g.add(pouch);
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 6), M(THREE, 0xE23B2E)); straw.position.set(0.3, 3.2, 0); straw.rotation.z = -0.3; g.add(straw);
    for (let i = 0; i < 4; i++) {
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), M(THREE, [0xE3B23C, 0x6BCB77, 0xE23B2E][i % 3]));
      blob.position.set((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 1.5); idle(blob, 'bobY', 0.3, 2 + i); g.add(blob);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Extra dense starfield close by for a "in orbit" feel.
  const sg = new THREE.BufferGeometry(), n = 400, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 260;
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.8, transparent: true, opacity: 0.8 })));
  // A distant Earth curve below.
  const earth = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 24), M(THREE, 0x2E6FB0, { metalness: 0.1, roughness: 0.8 }));
  earth.position.set(0, -60, -30); group.add(earth);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildSpace(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 6);
    holder.position.set(p.x, p.y + 2, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 2, anims: collectIdle(item) };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.18;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'spaceexplorers',
  name: 'Space Explorers',
  icon: '🚀',
  blurb: 'Meet the astronauts, rovers, and rockets that reach for the stars.',
  unlockCost: 480,
  category: 'Science & Space',
  theme: { primary: 0x8FB8FF, secondary: 0xF2A93B, bg: 0x05070f, light: 0xDDE8FF, ambient: 0x2a3a5a },
  masterTitle: 'Astronaut Master 🚀',
  subjects: SUBJECTS,
  build,
};
