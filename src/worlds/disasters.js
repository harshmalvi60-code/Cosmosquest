import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 14 — Natural Disasters. Distinct from everyday Weather: these are rare,
 * powerful Earth events. The tone is deliberately factual and reassuring — each
 * subject's facts include a simple, empowering safety tip, and the WOW facts
 * lean toward "amazing" rather than "scary". Procedural mini-scenes (a cracked
 * ground, a cresting wave, a spinning hurricane, flickering wildfire, etc.).
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0.02, flatShading: true, ...o });

const SUBJECTS = {
  earthquake: {
    name: 'Earthquake', type: 'Disaster · Shaking Ground', emoji: '🌍', badge: 'Quake Cadet', build: 'earthquake',
    mission: '🌍 Earthquakes are the ground shifting far below your feet. Ready to learn — and stay safe?',
    stats: [['Plates', 'Move & shift'], ['Shaking', 'What we feel'], ['Seismograph', 'Measures it'], ['Drop & cover', 'Stay safe']],
    facts: ['🌍 Earth\'s surface is made of giant pieces called plates that slowly move.', '💥 When they suddenly slip past each other, the ground shakes — that\'s an earthquake.', '📈 Scientists measure earthquakes with a tool called a seismograph.', '🛡️ If you ever feel one, the safe thing is to "drop, cover, and hold on" under a sturdy table.'],
    fun: 'Most earthquakes are so gentle we don\'t even feel them — there are millions of tiny ones every year!',
    quiz: [
      ['What causes an earthquake?', ['Giant plates suddenly slipping', 'Rain falling', 'The Sun rising', 'Wind blowing'], 0],
      { t: 'tf', q: 'If you feel an earthquake, it helps to drop, cover, and hold on.', answer: true },
      { t: 'pic', q: 'What should you get under in an earthquake?', options: [
        { shape: 'square', color: '#8A5A34', label: 'Sturdy table' }, { shape: 'circle', color: '#4BA6E8', label: 'Window' }, { shape: 'triangle', color: '#E23B2E', label: 'Lamp' }], answer: 0 },
    ],
    quizHard: [
      ['The plates move slowly, then slip all at once. Why do we feel the shaking suddenly?', ['The sudden slip releases energy fast', 'The plates are ticklish', 'The Sun pushes them', 'They melt'], 0],
      { t: 'tf', q: 'Since most earthquakes are tiny and unfelt, big ones are actually quite rare.', answer: true },
      ['We "drop, cover and hold on" in an earthquake. What is that mainly protecting us from?', ['Things falling down on us', 'Getting wet', 'The cold', 'Bright light'], 0],
    ],
  },
  tsunami: {
    name: 'Tsunami', type: 'Disaster · Giant Wave', emoji: '🌊', badge: 'Wave Watcher', build: 'tsunami',
    mission: '🌊 A tsunami is a giant wave born from an earthquake under the sea. Ready to learn how people stay safe?',
    stats: [['Sea quake', 'Starts it'], ['Very fast', 'In deep sea'], ['Warning', 'Sea pulls back'], ['Go high', 'To be safe']],
    facts: ['🌊 A tsunami is a huge sea wave, usually caused by an earthquake under the ocean floor.', '✈️ In deep water it races as fast as a jet plane, then grows tall near the shore.', '🏖️ A natural warning is the sea suddenly pulling far back from the beach.', '⛰️ The safe thing is to move quickly to high ground — coastal towns have sirens and clear signs to help.'],
    fun: 'In the deep ocean a tsunami can be barely a bump — ships may not even notice it passing beneath them!',
    quiz: [
      ['What usually causes a tsunami?', ['An earthquake under the sea', 'A rainy day', 'A gentle breeze', 'A sunny sky'], 0],
      { t: 'tf', q: 'If the sea suddenly pulls far back, it can be a warning to move to high ground.', answer: true },
      { t: 'pic', q: 'Where is safest in a tsunami?', options: [
        { shape: 'tall', color: '#7E8A6A', label: 'High ground' }, { shape: 'square', color: '#4BA6E8', label: 'Low beach' }, { shape: 'circle', color: '#4BA6E8', label: 'The sea' }], answer: 0 },
    ],
    quizHard: [
      ['An undersea earthquake pushes the whole ocean. How does that make a tsunami?', ['The pushed water travels as a huge wave', 'The water turns to ice', 'The sea disappears', 'It makes rain'], 0],
      { t: 'tf', q: 'The sea pulling back is a clue that gives people time to reach high ground.', answer: true },
      ['People head to high ground in a tsunami. Why does higher ground keep them safe?', ['Water floods the low areas first', 'It is warmer', 'It is closer to the sea', 'It is sandy'], 0],
    ],
  },
  hurricane: {
    name: 'Hurricane', type: 'Disaster · Spinning Storm', emoji: '🌀', badge: 'Storm Spotter', build: 'hurricane',
    mission: '🌀 A hurricane is a giant spinning storm as wide as a country. Ready to learn how we see them coming?',
    stats: [['Warm seas', 'Feed them'], ['Spinning', 'Round an eye'], ['Calm eye', 'In the middle'], ['Warnings', 'Days of notice']],
    facts: ['🌀 A hurricane is a huge spinning storm that forms over warm ocean water.', '👁️ It has a calm centre called the "eye", with the strongest winds swirling around it.', '🗺️ Hurricanes can be hundreds of km wide.', '🛰️ The good news: satellites spot them days ahead, so people get plenty of warning to prepare.'],
    fun: 'The calm "eye" in the middle of a hurricane can be so clear that you might even see blue sky straight up!',
    quiz: [
      ['What is the calm centre of a hurricane called?', ['The eye', 'The nose', 'The tail', 'The heart'], 0],
      { t: 'tf', q: 'Satellites help spot hurricanes days ahead so people can prepare.', answer: true },
      { t: 'pic', q: 'Hurricanes form over which kind of sea?', options: [
        { shape: 'circle', color: '#E8894A', label: 'Warm sea' }, { shape: 'circle', color: '#4BA6E8', label: 'Cold sea' }, { shape: 'circle', color: '#DCF2FF', label: 'Frozen sea' }], answer: 0 },
    ],
    quizHard: [
      ['Hurricanes form over warm oceans. What would happen if the water were cold?', ['The hurricane couldn\'t form or grow', 'It would spin faster', 'It would freeze people', 'Nothing changes'], 0],
      { t: 'tf', q: 'Because satellites give days of warning, people can prepare and stay safe.', answer: true },
      ['The eye is calm but the winds around it are strongest. What does that tell you about a hurricane?', ['It\'s calm in the middle, wild around the edge', 'It is calm everywhere', 'It is wild everywhere', 'It never moves'], 0],
    ],
  },
  wildfire: {
    name: 'Wildfire', type: 'Disaster · Spreading Fire', emoji: '🔥', badge: 'Fire Ranger', build: 'wildfire',
    mission: '🔥 Wildfires spread fast — but some forests actually NEED fire to grow. Ready to learn the surprising truth?',
    stats: [['Dry & windy', 'Spreads fast'], ['Lightning', 'Can start it'], ['Some seeds', 'Need fire'], ['Firefighters', 'Keep us safe']],
    facts: ['🔥 A wildfire is a fire that spreads quickly through forests, grass or bushland.', '⚡ They can start naturally from lightning, or from people being careless.', '🌰 Surprisingly, some plants need fire — their seeds only open in the heat!', '🚒 Brave firefighters and clever planning help protect towns and put fires out.'],
    fun: 'Some pine cones are sealed shut with resin and only pop open to drop their seeds after a fire\'s heat melts it!',
    quiz: [
      ['How can a wildfire start naturally?', ['From a lightning strike', 'From snow', 'From moonlight', 'From a cold breeze'], 0],
      { t: 'tf', q: 'Some plant seeds only open after the heat of a fire.', answer: true },
      { t: 'pic', q: 'Which colour is wildfire flame?', options: [
        { shape: 'triangle', color: '#F2822A', label: 'Orange' }, { shape: 'triangle', color: '#4BA6E8', label: 'Blue' }, { shape: 'triangle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Wildfires spread fastest when it\'s dry and windy. Why does wind make a fire spread?', ['Wind carries flames and sparks to new fuel', 'Wind cools the fire off', 'Wind is wet', 'Wind puts fires out'], 0],
      { t: 'tf', q: 'Because some seeds need fire to open, fire can be part of a healthy forest\'s life.', answer: true },
      ['Firefighters and planning protect towns from wildfires. What does that show?', ['People have smart ways to stay safe', 'Fires can\'t be stopped', 'Nothing can help', 'Fires are harmless'], 0],
    ],
  },
  avalanche: {
    name: 'Avalanche', type: 'Disaster · Sliding Snow', emoji: '🏔️', badge: 'Snow Scout', build: 'avalanche',
    mission: '🏔️ An avalanche is a river of snow rushing down a mountain. Ready to learn how to stay snow-safe?',
    stats: [['Snow slide', 'Down a slope'], ['Steep slopes', 'Where they happen'], ['Fast', 'Up to 130 km/h'], ['Check reports', 'Stay safe']],
    facts: ['🏔️ An avalanche is a large amount of snow that suddenly slides down a steep mountain.', '❄️ It can happen when heavy new snow piles on top of older, weaker snow.', '🏎️ Avalanches can rush downhill as fast as a car on a motorway.', '🎿 Skiers and climbers stay safe by checking snow reports and avoiding risky slopes.'],
    fun: 'A big avalanche can move so much snow it could fill hundreds of swimming pools in under a minute!',
    quiz: [
      ['What is an avalanche?', ['A big slide of snow down a mountain', 'A snowball fight', 'A frozen lake', 'A snowman'], 0],
      { t: 'tf', q: 'Checking snow reports helps people stay safe from avalanches.', answer: true },
      { t: 'pic', q: 'Which colour is avalanche snow?', options: [
        { shape: 'circle', color: '#F2F7FF', label: 'White' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Heavy new snow can sit on weaker old snow. Why might that suddenly slide?', ['The weak layer gives way under the weight', 'Snow gets bored', 'The Sun lifts it', 'It melts upward'], 0],
      { t: 'tf', q: 'Avalanches happen on steep slopes, so checking a slope helps people stay safe.', answer: true },
      ['Skiers check snow reports before heading out. What smart idea is that an example of?', ['Preparing and checking to stay safe', 'Being lucky', 'Going anywhere anytime', 'Ignoring warnings'], 0],
    ],
  },
  landslide: {
    name: 'Landslide', type: 'Disaster · Sliding Hillside', emoji: '⛰️', badge: 'Slope Sentry', build: 'landslide',
    mission: '⛰️ When a hillside gives way, that\'s a landslide. Ready to learn what makes the ground move?',
    stats: [['Rock & soil', 'Slide down'], ['Heavy rain', 'Often triggers'], ['Gravity', 'Pulls it down'], ['Warning signs', 'Cracks appear']],
    facts: ['⛰️ A landslide is when rock, soil and mud slide down a slope.', '🌧️ Heavy rain is a common cause — water makes the ground heavy and slippery.', '⬇️ Gravity then pulls the loose ground downhill.', '🌳 Warning signs like new cracks or tilting trees can hint one is coming, so people can move away in time.'],
    fun: 'Plant roots help hold soil together — hillsides covered in trees are much less likely to have landslides!',
    quiz: [
      ['What often triggers a landslide?', ['Heavy rain', 'A sunny day', 'A cold night', 'A gentle breeze'], 0],
      { t: 'tf', q: 'Tree roots help hold soil in place on a hillside.', answer: true },
      { t: 'pic', q: 'What helps stop landslides on a hill?', options: [
        { shape: 'triangle', color: '#4E9E4A', label: 'Trees' }, { shape: 'triangle', color: '#8A5A34', label: 'Bare mud' }, { shape: 'triangle', color: '#9A968C', label: 'Loose rock' }], answer: 0 },
    ],
    quizHard: [
      ['Heavy rain makes soil heavy and slippery. Why does that lead to a landslide?', ['Gravity pulls the loose, wet ground down', 'Rain glues it in place', 'The Sun lifts it', 'It floats away'], 0],
      { t: 'tf', q: 'Because roots bind soil, planting trees can help protect a hillside.', answer: true },
      ['New cracks and tilting trees can warn of a landslide. Why is spotting them useful?', ['People can move to safety in time', 'It makes the hill taller', 'It stops the rain', 'It grows more trees'], 0],
    ],
  },
  flood: {
    name: 'Flood', type: 'Disaster · Rising Water', emoji: '🌊', badge: 'Flood Guard', build: 'flood',
    mission: '🌊 A flood is when water covers land that\'s usually dry. Ready to learn how people stay above water?',
    stats: [['Too much water', 'Covers land'], ['Heavy rain', 'A common cause'], ['Rivers', 'Can overflow'], ['Go high', 'Stay safe']],
    facts: ['🌊 A flood happens when water covers land that is normally dry.', '🌧️ It\'s often caused by heavy rain or rivers overflowing their banks.', '🧱 Barriers, dams and good drains help protect towns from floods.', '⛰️ The safe thing is to move to higher ground and never walk or play in floodwater.'],
    fun: 'Just 15 cm of fast-moving floodwater — only ankle deep — can knock a grown adult off their feet!',
    quiz: [
      ['What is a common cause of floods?', ['Heavy rain or overflowing rivers', 'Too much sunshine', 'A light breeze', 'A cold night'], 0],
      { t: 'tf', q: 'You should never walk in floodwater — it\'s more dangerous than it looks.', answer: true },
      { t: 'pic', q: 'Where is safest in a flood?', options: [
        { shape: 'tall', color: '#7E8A6A', label: 'High ground' }, { shape: 'square', color: '#4BA6E8', label: 'Low street' }, { shape: 'circle', color: '#4BA6E8', label: 'The river' }], answer: 0 },
    ],
    quizHard: [
      ['A river overflows when there\'s too much water for its banks. What usually adds that extra water?', ['Heavy rain', 'Bright sunshine', 'Strong wind only', 'Falling leaves'], 0],
      { t: 'tf', q: 'Dams, drains and barriers are clever ways people protect towns from floods.', answer: true },
      ['Shallow floodwater can still knock someone over. Why is it more dangerous than it looks?', ['It can be deep and move fast', 'It is warm', 'It glows', 'It is always still'], 0],
    ],
  },
  sinkhole: {
    name: 'Sinkhole', type: 'Disaster · Collapsing Ground', emoji: '🕳️', badge: 'Ground Detective', build: 'sinkhole',
    mission: '🕳️ Sometimes the ground opens into a surprise hole — a sinkhole. Ready to find out why?',
    stats: [['Hole', 'Ground collapses'], ['Water', 'Dissolves rock below'], ['Slow', 'Usually forms slowly'], ['Rare', 'Not common']],
    facts: ['🕳️ A sinkhole is a hole that opens up when the ground suddenly sinks or collapses.', '💧 Underground, water can slowly dissolve soft rock like limestone, leaving a hidden gap.', '🪨 When the roof of that gap gets too thin, the surface caves in.', '🔬 Most sinkholes form slowly and are rare, and scientists can often spot risky ground ahead of time.'],
    fun: 'Some natural sinkholes fill with water to make beautiful swimming spots called "cenotes" — the ancient Maya thought they were sacred!',
    quiz: [
      ['What can slowly create a sinkhole underground?', ['Water dissolving soft rock', 'Sunlight', 'Wind', 'Snow'], 0],
      { t: 'tf', q: 'Most sinkholes are rare and often form slowly.', answer: true },
      { t: 'pic', q: 'Which shows a sinkhole opening?', options: [
        { shape: 'circle', color: '#2B2B33', label: 'Dark hole' }, { shape: 'triangle', color: '#6BCB77', label: 'Hill' }, { shape: 'square', color: '#E3B23C', label: 'Field' }], answer: 0 },
    ],
    quizHard: [
      ['Water dissolves rock underground, leaving a gap. Why does the surface eventually cave in?', ['The gap\'s thin roof can no longer hold the weight', 'Water pushes it up', 'The Sun melts it', 'Wind blows it down'], 0],
      { t: 'tf', q: 'Because scientists can spot risky ground ahead of time, sinkholes can often be planned for.', answer: true },
      ['Some sinkholes fill with water to make lovely "cenotes". What does that show?', ['Even a disaster can leave something beautiful', 'Sinkholes are fake', 'Water is dangerous', 'Nothing at all'], 0],
    ],
  },
};

/* ---------------- procedural disaster mini-scenes ---------------- */
function buildDisaster(THREE, kind) {
  const g = new THREE.Group();
  const ground = (c) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.2, 0.8, 20), M(THREE, c)); d.position.y = 0; g.add(d); return d; };
  if (kind === 'earthquake') {
    ground(0x8A7A5A);
    const crack = new THREE.Mesh(new THREE.BoxGeometry(6, 0.9, 0.5), new THREE.MeshBasicMaterial({ color: 0x1A1A20 }));
    crack.position.set(0, 0.45, 0); crack.rotation.y = 0.3; g.add(crack);
    for (const dx of [-1.6, 1.4]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.4), M(THREE, 0xC0A88A));
      b.position.set(dx, 1.6, 1.2); idle(b, 'sway', 0.08, 9, 'z'); g.add(b);
    }
  } else if (kind === 'tsunami') {
    const sea = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.2, 0.6, 20), M(THREE, 0x2E7EB8)); g.add(sea);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(2.4, 1, 12, 24, Math.PI), M(THREE, 0x3E9ED8, { transparent: true, opacity: 0.9 }));
    wave.position.set(0, 2, -1); wave.rotation.set(Math.PI / 2, 0, 0); wave.scale.set(1, 1, 1.4); idle(wave, 'bobY', 0.4, 1.5); g.add(wave);
    const crest = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.4, 8, 24, Math.PI), M(THREE, 0xFFFFFF, { transparent: true, opacity: 0.8 }));
    crest.position.set(0, 3.2, -1); crest.rotation.set(Math.PI / 2, 0, 0); g.add(crest);
  } else if (kind === 'hurricane') {
    ground(0x2E7EB8);
    const swirl = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const arm = new THREE.Mesh(new THREE.TorusGeometry(1.2 + i * 1, 0.5, 8, 24, Math.PI * 1.3), M(THREE, 0xC7D2DE, { transparent: true, opacity: 0.7, flatShading: true }));
      arm.rotation.x = -Math.PI / 2; arm.rotation.z = i * 1.5; arm.position.y = 2 + i * 0.4; swirl.add(arm);
    }
    g.add(swirl); g.userData.spin = swirl;
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16), M(THREE, 0x2E7EB8)); eye.position.y = 2.6; g.add(eye);
  } else if (kind === 'wildfire') {
    ground(0x5A4A2E);
    for (const dx of [-1.8, 0, 1.8]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.6, 6), M(THREE, 0x5A3A1E));
      trunk.position.set(dx, 1, -0.6); g.add(trunk);
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 8), M(THREE, 0x3E6E3A));
      top.position.set(dx, 2.4, -0.6); g.add(top);
    }
    for (let i = 0; i < 6; i++) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4 + Math.random() * 0.3, 1.4, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xF2822A : 0xF6C21E }));
      flame.position.set(-2 + Math.random() * 4, 1.2, 0.6); idle(flame, 'breathe', 0.2, 6 + i); g.add(flame);
    }
  } else if (kind === 'avalanche' || kind === 'landslide') {
    const snow = kind === 'avalanche';
    const slope = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 5), M(THREE, snow ? 0xE7F2FB : 0x7A5A38));
    slope.rotation.z = 0.45; slope.position.y = 1.5; g.add(slope);
    for (let i = 0; i < 10; i++) {
      const chunk = new THREE.Mesh(snow ? new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 8, 6) : new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3, 0),
        M(THREE, snow ? 0xFFFFFF : 0x8A6A48, { flatShading: true }));
      chunk.position.set(-2 + Math.random() * 3, 2.4 - i * 0.2, (Math.random() - 0.5) * 3); idle(chunk, 'bobY', 0.2, 3 + i); g.add(chunk);
    }
  } else if (kind === 'flood') {
    const water = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.2, 1.6, 20), M(THREE, 0x3E8EDE, { transparent: true, opacity: 0.75 }));
    water.position.y = 0.6; idle(water, 'bobY', 0.1, 1.5); g.add(water);
    const house = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), M(THREE, 0xD8C4A0));
    house.position.set(0, 1.4, 0); g.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), M(THREE, 0xB0402E));
    roof.position.set(0, 3, 0); roof.rotation.y = Math.PI / 4; g.add(roof);
  } else if (kind === 'sinkhole') {
    ground(0x6B8A4A);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.4, 2, 20, 1, true), M(THREE, 0x3A2E22, { side: THREE.DoubleSide }));
    hole.position.y = -0.6; g.add(hole);
    const dark = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), new THREE.MeshBasicMaterial({ color: 0x120E0A }));
    dark.rotation.x = -Math.PI / 2; dark.position.y = -1.4; g.add(dark);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2, 0.2, 8, 24), M(THREE, 0x5A4A2E));
    rim.position.y = 0.4; rim.rotation.x = Math.PI / 2; g.add(rim);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 30, 48),
    new THREE.MeshStandardMaterial({ color: 0x4A5240, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildDisaster(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 3);
    holder.position.set(p.x, p.y, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y,
      anims: collectIdle(item), spin: item.userData.spin || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.12;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.3;
      runIdle(m.userData.anims, t);
      if (m.userData.spin) m.userData.spin.rotation.y += dt * 1.6;
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'disasters',
  name: 'Natural Disasters',
  icon: '🌋',
  blurb: 'Discover Earth\'s most powerful — and safest-to-learn-about — events.',
  unlockCost: 420,
  category: 'Earth & Sky',
  theme: { primary: 0xE0722E, secondary: 0xF2C21E, bg: 0x1a1008, light: 0xFFE0B0, ambient: 0x5a3a2a },
  masterTitle: 'Disaster Expert 🌋',
  subjects: SUBJECTS,
  build,
};
