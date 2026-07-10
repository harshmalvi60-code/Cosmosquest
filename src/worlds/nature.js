import { attachMarker, updateMarkers, ringPosition } from './helpers.js';

/**
 * World 2 — Nature. Nine of Earth's wild places, each an "island" the player
 * orbits and taps. Subjects follow the same data shape as Universe, plus:
 *   - mission : one-line playful briefing shown before the quiz
 *   - badge   : collectible name for a perfect score
 *   - quiz    : base questions (mix of multiple-choice, true/false, picture)
 *   - quizHard: two-step-reasoning set that kicks in once the world warms up
 *   - mesh    : { shape, colors } describing the procedural 3D island
 */

const G = 0x6BCB77, BROWN = 0x8A5A34, SAND = 0xE7CE97, ICE = 0xBFE9FF, ROCK = 0x6E6E7A,
  WATER = 0x4BA6E8, LAVA = 0xFF6A2B, CORAL = 0xFF7FB0, WHITE = 0xF2F7FF, GOLD = 0xE3B23C, DARK = 0x33313F;

const SUBJECTS = {
  rainforest: {
    name: 'Rainforest', type: 'Ecosystem · Jungle', emoji: '🌴', badge: 'Jungle Guide',
    mesh: { shape: 'rainforest', colors: [G, BROWN] },
    mission: '🌴 Rainforests hold over HALF of all animal and plant kinds on Earth. Ready to explore the jungle?',
    stats: [['50%+', 'Of all species live here'], ['20%', 'Of Earth\'s oxygen'], ['Every day', 'It rains here'], ['Amazon', 'Biggest one']],
    facts: ['🌳 Rainforests are super crowded with life — more than half of all animal and plant kinds live in them!', '🌧️ It rains almost every single day, which is how they got their name.', '🫁 They make about a fifth of the oxygen we breathe — people call the Amazon "the lungs of the Earth".', '🐒 The tall treetops form a "canopy" where monkeys, birds and bugs live without ever touching the ground.'],
    fun: 'A single rainforest tree can be home to more kinds of ant than the whole of Britain!',
    quiz: [
      ['Why is the Amazon called "the lungs of the Earth"?', ['It makes lots of oxygen', 'It looks like lungs', 'It breathes in and out', 'It coughs'], 0],
      { t: 'tf', q: 'It rains in a rainforest almost every day.', answer: true },
      { t: 'pic', q: 'Which colour best matches a healthy rainforest?', options: [
        { shape: 'circle', color: '#6BCB77', label: 'Green' }, { shape: 'circle', color: '#E7CE97', label: 'Sandy' }, { shape: 'circle', color: '#BFE9FF', label: 'Icy blue' }], answer: 0 },
    ],
    quizHard: [
      ['More than half of all species live in rainforests, yet rainforests cover only a small part of land. What does that tell us?', ['Life is packed very tightly there', 'Rainforests are empty', 'Species dislike rainforests', 'Rainforests are the biggest habitat'], 0],
      { t: 'tf', q: 'If rainforests make lots of oxygen, cutting them down could give Earth LESS oxygen.', answer: true },
      ['Rain falls almost daily and trees grow very tall to reach light. Why do they grow so tall?', ['To reach sunlight above the crowd', 'To stay dry', 'To escape ants', 'To touch the clouds'], 0],
    ],
  },
  desert: {
    name: 'Desert', type: 'Ecosystem · Dry Land', emoji: '🏜️', badge: 'Dune Ranger',
    mesh: { shape: 'desert', colors: [SAND, 0xC9A15E] },
    mission: '🏜️ A desert can be boiling by day and freezing by night. Ready to survive the driest land?',
    stats: [['<25cm', 'Rain per year'], ['50°C', 'Day heat'], ['Below 0°C', 'Night cold'], ['Sahara', 'Biggest hot one']],
    facts: ['🌵 A desert is any place that gets very little rain — less than 25cm a year.', '🥵 Deserts can be scorching by day but surprisingly freezing at night.', '🐫 Camels store fat (not water!) in their humps to survive long journeys without food.', '❄️ Not all deserts are hot — Antarctica is the biggest desert of all because it almost never rains!'],
    fun: 'Some desert seeds can wait YEARS for rain, then bloom into a carpet of flowers in just days!',
    quiz: [
      ['What makes a place a desert?', ['It gets very little rain', 'It is always sandy', 'It has no animals', 'It is always hot'], 0],
      { t: 'tf', q: 'A camel stores water in its hump.', answer: false },
      { t: 'pic', q: 'Which colour looks most like desert sand?', options: [
        { shape: 'circle', color: '#E7CE97', label: 'Sandy' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Antarctica is called a desert even though it is covered in ice. Why?', ['It gets almost no rain or snow', 'It is very hot', 'It has lots of sand', 'It has camels'], 0],
      { t: 'tf', q: 'If a desert is freezing at night but boiling by day, it can still be a desert.', answer: true },
      ['A camel\'s hump stores fat, not water. How does that help it cross a desert?', ['Fat is food for long trips', 'Fat keeps it cool', 'Fat makes it float', 'Fat scares predators'], 0],
    ],
  },
  volcano: {
    name: 'Volcano', type: 'Ecosystem · Fire Mountain', emoji: '🌋', badge: 'Lava Lord',
    mesh: { shape: 'volcano', colors: [ROCK, LAVA] },
    mission: '🌋 Deep underground, melted rock waits to burst out. Ready to meet a fire mountain?',
    stats: [['1,200°C', 'Lava heat'], ['~1,500', 'Active on land'], ['Magma', 'Rock before it erupts'], ['Ring of Fire', 'Where many sit']],
    facts: ['🌋 A volcano is a mountain with an opening where hot melted rock can burst out.', '🔥 Melted rock is called magma underground, and lava once it flows out — it can be 1,200°C!', '🏝️ Many islands, like Hawaii, were actually built by volcanoes over millions of years.', '🌱 After they cool, volcano rocks make some of the richest soil for plants to grow.'],
    fun: 'The loudest sound in modern history was a volcano — Krakatoa in 1883 was heard 4,800km away!',
    quiz: [
      ['What is melted rock called AFTER it flows out of a volcano?', ['Lava', 'Magma', 'Mud', 'Metal'], 0],
      { t: 'tf', q: 'Some islands were built by volcanoes.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a volcano?', options: [
        { shape: 'triangle', color: '#8A5A34', label: 'Cone' }, { shape: 'square', color: '#8A5A34', label: 'Block' }, { shape: 'circle', color: '#8A5A34', label: 'Ball' }], answer: 0 },
    ],
    quizHard: [
      ['Melted rock is "magma" underground but "lava" above ground. What changes its name?', ['Whether it has erupted out', 'Its colour', 'The day of the week', 'How hot it is'], 0],
      { t: 'tf', q: 'Because cooled volcano rock makes rich soil, farms sometimes sit near old volcanoes.', answer: true },
      ['Hawaii is a chain of islands made by volcanoes. What does that suggest about the sea floor there?', ['Volcanoes erupted under the sea', 'The sea is very shallow', 'There is no water', 'Islands float on top'], 0],
    ],
  },
  glacier: {
    name: 'Glacier', type: 'Ecosystem · River of Ice', emoji: '🧊', badge: 'Ice Shaper',
    mesh: { shape: 'glacier', colors: [ICE, WHITE] },
    mission: '🧊 A glacier is a river of ice that carves whole valleys — very, very slowly. Ready to explore?',
    stats: [['69%', 'Of Earth\'s fresh water'], ['Very slow', 'It flows downhill'], ['Blue', 'Deep ice colour'], ['Iceberg', 'A chunk that breaks off']],
    facts: ['🧊 A glacier is a huge, thick sheet of ice that slowly flows downhill like a frozen river.', '💧 Glaciers hold most of Earth\'s fresh water — locked up as ice!', '🏔️ As they creep along, they carve out valleys and shape whole mountains.', '🌊 When a chunk breaks off into the sea, it becomes a floating iceberg.'],
    fun: 'Deep glacier ice can look bright blue, because packed ice soaks up every colour of light except blue!',
    quiz: [
      ['What is a glacier?', ['A slow river of ice', 'A frozen lake', 'A snowball', 'A cold desert'], 0],
      { t: 'tf', q: 'Glaciers hold a lot of Earth\'s fresh water.', answer: true },
      { t: 'pic', q: 'Which colour can deep glacier ice glow?', options: [
        { shape: 'diamond', color: '#4BA6E8', label: 'Blue' }, { shape: 'diamond', color: '#FF6A2B', label: 'Orange' }, { shape: 'diamond', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Glaciers carve valleys as they move. What does that tell us about the ice?', ['It moves with huge force over time', 'It is soft like snow', 'It stays perfectly still', 'It melts instantly'], 0],
      { t: 'tf', q: 'If most fresh water is frozen in glaciers, melting them fast could raise the seas.', answer: true },
      ['An iceberg floats with most of its ice hidden underwater. Why be careful sailing near one?', ['The hidden part is much bigger', 'It is warm', 'It sinks ships on purpose', 'It has no ice below'], 0],
    ],
  },
  coralreef: {
    name: 'Coral Reef', type: 'Ecosystem · Underwater City', emoji: '🪸', badge: 'Reef Keeper',
    mesh: { shape: 'coral', colors: [CORAL, 0xFFD36B] },
    mission: '🪸 A coral reef is a living city built by tiny animals. Ready to visit the rainforest of the sea?',
    stats: [['25%', 'Of sea life visits'], ['Tiny animals', 'Build the reef'], ['Great Barrier', 'Biggest reef'], ['Sunlight', 'Corals need it']],
    facts: ['🪸 A coral reef is built by millions of tiny animals called polyps that share their rocky homes.', '🐠 Reefs are like underwater cities — about a quarter of all sea creatures visit them!', '☀️ Corals need clean, sunny, shallow water, so they grow best near the surface.', '🇦🇺 The Great Barrier Reef is so big it can be seen from space!'],
    fun: 'Coral reefs are called "rainforests of the sea" because so many different creatures live packed together!',
    quiz: [
      ['What builds a coral reef?', ['Tiny animals called polyps', 'Fish bones', 'Melting ice', 'Sand only'], 0],
      { t: 'tf', q: 'The Great Barrier Reef can be seen from space.', answer: true },
      { t: 'pic', q: 'Which colour is a bright, healthy coral?', options: [
        { shape: 'circle', color: '#FF7FB0', label: 'Pink' }, { shape: 'circle', color: '#6E6E7A', label: 'Grey' }, { shape: 'circle', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['Corals need sunlight, so reefs grow in shallow water. What would happen to a reef in deep, dark water?', ['It would struggle to grow', 'It would grow faster', 'It would turn into a fish', 'Nothing changes'], 0],
      { t: 'tf', q: 'Since a quarter of sea life uses reefs, losing reefs would hurt many other animals too.', answer: true },
      ['A reef is called the "rainforest of the sea." What do a reef and a rainforest have in common?', ['Huge variety of life in one place', 'Both are dry', 'Both are freezing', 'Both have no animals'], 0],
    ],
  },
  waterfall: {
    name: 'Waterfall', type: 'Ecosystem · Falling River', emoji: '💦', badge: 'Cascade Captain',
    mesh: { shape: 'waterfall', colors: [WATER, ROCK] },
    mission: '💦 Where a river meets a cliff, it leaps! Ready to chase a falling river?',
    stats: [['979m', 'Tallest: Angel Falls'], ['Cliff', 'What makes one'], ['Mist', 'Spray at the bottom'], ['Erosion', 'Slowly moves it back']],
    facts: ['💦 A waterfall happens when a river flows over the edge of a cliff and drops down.', '🏞️ The tallest is Angel Falls in Venezuela — water falls so far it turns to mist before landing!', '🌈 The spray at the bottom often makes rainbows on sunny days.', '⏳ Over thousands of years, falling water wears away the rock and slowly moves the waterfall backwards.'],
    fun: 'At Angel Falls, the drop is so tall the water becomes a fine mist and blows away in the wind before it reaches the ground!',
    quiz: [
      ['What makes a waterfall?', ['A river drops over a cliff', 'Rain falling straight down', 'A melting glacier', 'A big wave'], 0],
      { t: 'tf', q: 'Waterfall spray can make rainbows on sunny days.', answer: true },
      { t: 'pic', q: 'Which shape best shows falling water?', options: [
        { shape: 'drop', color: '#4BA6E8', label: 'Droplet' }, { shape: 'square', color: '#4BA6E8', label: 'Block' }, { shape: 'star', color: '#4BA6E8', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['Falling water slowly wears away rock, moving a waterfall backwards over time. This slow wearing is called what?', ['Erosion', 'Eruption', 'Evaporation', 'Freezing'], 0],
      { t: 'tf', q: 'At Angel Falls the water turns to mist before landing, so barely any splash reaches the bottom.', answer: true },
      ['A waterfall needs a river AND a cliff. On perfectly flat land with a river, would you find a waterfall?', ['No — there is no drop', 'Yes — always', 'Only at night', 'Only in winter'], 0],
    ],
  },
  cave: {
    name: 'Cave', type: 'Ecosystem · Hidden World', emoji: '🕳️', badge: 'Cave Explorer',
    mesh: { shape: 'cave', colors: [DARK, ROCK] },
    mission: '🕳️ In the dark of a cave, water builds stone icicles drip by drip. Ready to explore underground?',
    stats: [['Total dark', 'Deep inside'], ['Stalactite', 'Hangs from the roof'], ['Stalagmite', 'Grows off the floor'], ['Bats', 'Common cave animals']],
    facts: ['🕳️ A cave is a big hollow space underground, often carved out slowly by water.', '🧊 Pointy rocks called stalactites hang from the ceiling; stalagmites grow up from the floor.', '💧 They form drip by drip as water leaves tiny bits of mineral behind — super slowly!', '🦇 Deep caves are pitch black, so animals like bats use sound instead of sight to get around.'],
    fun: 'Some cave stalactites grow slower than your fingernails — just a few centimetres every thousand years!',
    quiz: [
      ['Which rock hangs DOWN from a cave roof?', ['Stalactite', 'Stalagmite', 'Boulder', 'Pebble'], 0],
      { t: 'tf', q: 'Deep inside a cave it is completely dark.', answer: true },
      { t: 'pic', q: 'Which colour matches the deep inside of a cave?', options: [
        { shape: 'circle', color: '#33313F', label: 'Dark' }, { shape: 'circle', color: '#E7CE97', label: 'Sandy' }, { shape: 'circle', color: '#FF7FB0', label: 'Pink' }], answer: 0 },
    ],
    quizHard: [
      ['Stalactites grow only a few cm every thousand years. A long one tells us the cave is what?', ['Very, very old', 'Brand new', 'Man-made', 'Underwater'], 0],
      { t: 'tf', q: 'Because it is pitch black deep in caves, eyes are less useful there than good hearing.', answer: true },
      ['Stalactites hang from the roof and stalagmites rise from the floor. If they meet, what forms?', ['A column of rock', 'A waterfall', 'A door', 'A window'], 0],
    ],
  },
  savanna: {
    name: 'Savanna', type: 'Ecosystem · Grassland', emoji: '🦒', badge: 'Grassland Guide',
    mesh: { shape: 'savanna', colors: [GOLD, BROWN] },
    mission: '🦒 Golden grass, scattered trees, and giant herds. Ready to explore the great grassland?',
    stats: [['Wet + dry', 'Two seasons'], ['Africa', 'Famous savannas'], ['Acacia', 'Classic flat tree'], ['Migration', 'Huge herd journeys']],
    facts: ['🌾 A savanna is a wide grassland with just a few scattered trees.', '☀️ It has two seasons: a wet season when grass grows, and a long dry season.', '🦓 Huge herds of zebra and wildebeest travel across it searching for fresh grass and water.', '🌳 The flat-topped acacia tree is a savanna classic — giraffes love to nibble its leaves.'],
    fun: 'Over a million wildebeest migrate across Africa\'s savanna each year — one of the biggest animal journeys on Earth!',
    quiz: [
      ['What is a savanna?', ['Grassland with a few trees', 'A thick jungle', 'A sandy desert', 'A frozen plain'], 0],
      { t: 'tf', q: 'A savanna has a wet season and a dry season.', answer: true },
      { t: 'pic', q: 'Which colour matches dry savanna grass?', options: [
        { shape: 'circle', color: '#E3B23C', label: 'Golden' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#F2F7FF', label: 'White' }], answer: 0 },
    ],
    quizHard: [
      ['Herds migrate across the savanna to follow fresh grass. What likely triggers them to move?', ['The dry season drying the grass', 'Snowfall', 'Nighttime', 'Full moons'], 0],
      { t: 'tf', q: 'Since savannas have few trees, grass-eating animals there have lots of open space to run.', answer: true },
      ['Acacia trees are flat-topped and giraffes are very tall. How does that pairing help the giraffe?', ['It can reach leaves other animals can\'t', 'It can hide under the tree', 'It can climb the tree', 'It scares the tree'], 0],
    ],
  },
  tundra: {
    name: 'Tundra', type: 'Ecosystem · Frozen Plain', emoji: '🐻‍❄️', badge: 'Frost Wanderer',
    mesh: { shape: 'tundra', colors: [WHITE, ICE] },
    mission: '🐻‍❄️ The coldest, treeless land where the ground stays frozen. Ready to brave the tundra?',
    stats: [['Too cold', 'For trees to grow'], ['Permafrost', 'Ground frozen all year'], ['Arctic', 'Where most tundra is'], ['Summer', 'Brief bloom of plants']],
    facts: ['❄️ The tundra is a freezing, treeless land — it\'s simply too cold and windy for trees to grow.', '🧊 Under the surface is "permafrost": ground that stays frozen solid all year round.', '🐾 Animals like Arctic foxes and reindeer have thick fur to survive the bitter cold.', '🌼 For a few weeks in summer the top layer thaws and tiny flowers and mosses burst into bloom.'],
    fun: 'The word "tundra" means "treeless land" — even a whole forest couldn\'t take root in that frozen ground!',
    quiz: [
      ['Why are there no trees on the tundra?', ['It is too cold for them', 'Animals eat them', 'It is too sunny', 'The soil is too rich'], 0],
      { t: 'tf', q: 'Permafrost is ground that stays frozen all year.', answer: true },
      { t: 'pic', q: 'Which colour matches a snowy tundra?', options: [
        { shape: 'circle', color: '#F2F7FF', label: 'White' }, { shape: 'circle', color: '#FF6A2B', label: 'Orange' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['The tundra\'s permafrost stays frozen all year. Why does that make it hard for big tree roots to grow?', ['Roots can\'t push into frozen ground', 'It is too warm', 'There is too much rain', 'The soil is too soft'], 0],
      { t: 'tf', q: 'Because tundra summers are short, its flowers must grow and bloom very quickly.', answer: true },
      ['Arctic foxes have thick white fur. How does white fur help them in the tundra?', ['It hides them in the snow', 'It keeps them cool', 'It helps them swim', 'It glows at night'], 0],
    ],
  },
};

/* ---------------- 3D island builders (procedural, no assets) ---------------- */
function buildBiome(THREE, def) {
  const g = new THREE.Group();
  const [c1, c2] = def.mesh.colors;
  const mat = (c, opts = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.05, ...opts });

  // Shared floating platform under every biome.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 6.2, 2.2, 24), mat(c1));
  base.position.y = -1.4; g.add(base);

  const shape = def.mesh.shape;
  if (shape === 'rainforest' || shape === 'savanna') {
    const treeCount = shape === 'rainforest' ? 6 : 2;
    for (let i = 0; i < treeCount; i++) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.4, 8), mat(BROWN));
      const canopy = shape === 'rainforest'
        ? new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.2, 10), mat(c1, { emissive: c1, emissiveIntensity: 0.12 }))
        : new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 10), mat(0x6BCB77));
      if (shape === 'savanna') canopy.scale.set(1.6, 0.5, 1.6);
      const a = (i / treeCount) * Math.PI * 2, r = shape === 'rainforest' ? 2.6 : 2;
      trunk.position.set(Math.cos(a) * r, 1.2, Math.sin(a) * r);
      canopy.position.set(Math.cos(a) * r, shape === 'rainforest' ? 3.4 : 2.9, Math.sin(a) * r);
      g.add(trunk); g.add(canopy);
    }
  } else if (shape === 'desert') {
    const dune = new THREE.Mesh(new THREE.SphereGeometry(3.4, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(c1));
    dune.scale.set(1.4, 0.5, 1.4); dune.position.y = 0; g.add(dune);
    const cactus = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 2, 6, 10), mat(0x4E9E5A));
    cactus.position.set(1.6, 1.4, 1); g.add(cactus);
  } else if (shape === 'volcano') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(4.4, 5.4, 20, 1, true), mat(c1));
    cone.position.y = 1.4; g.add(cone);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), new THREE.MeshBasicMaterial({ color: c2 }));
    glow.position.y = 4.1; glow.name = 'lavaGlow'; g.add(glow);
  } else if (shape === 'glacier') {
    for (let i = 0; i < 5; i++) {
      const berg = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + Math.random() * 1.4, 0),
        mat(i % 2 ? c1 : c2, { flatShading: true, transparent: true, opacity: 0.92, emissive: 0x214e6e, emissiveIntensity: 0.15 }));
      berg.position.set((Math.random() - 0.5) * 5, 0.6 + Math.random(), (Math.random() - 0.5) * 5);
      g.add(berg);
    }
  } else if (shape === 'coral') {
    for (let i = 0; i < 6; i++) {
      const col = [CORAL, 0xFFD36B, 0xB26CFF, 0x4BA6E8][i % 4];
      const branch = i % 2
        ? new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 8, 16), mat(col, { emissive: col, emissiveIntensity: 0.2 }))
        : new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 8), mat(col, { emissive: col, emissiveIntensity: 0.2 }));
      const a = (i / 6) * Math.PI * 2;
      branch.position.set(Math.cos(a) * 2.4, 1.2, Math.sin(a) * 2.4);
      g.add(branch);
    }
  } else if (shape === 'waterfall') {
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 3), mat(c2));
    cliff.position.set(-1, 1.4, 0); g.add(cliff);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5),
      new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
    water.position.set(1.6, 1.2, 0); g.add(water); g.userData.water = water;
  } else if (shape === 'cave') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.4, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(c2, { side: THREE.DoubleSide }));
    dome.position.y = 0.2; g.add(dome);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(2, 20), new THREE.MeshBasicMaterial({ color: 0x0A0A12 }));
    mouth.position.set(0, 1.8, 4.35); g.add(mouth);
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.6, 6), mat(ROCK));
      spike.rotation.x = Math.PI; spike.position.set((i - 1) * 0.9, 3.2, 3.8); g.add(spike);
    }
  } else if (shape === 'tundra') {
    const snow = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.6, 24), mat(c1, { emissive: 0x223344, emissiveIntensity: 0.1 }));
    snow.position.y = 0.2; g.add(snow);
    for (let i = 0; i < 4; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.5, 0), mat(ROCK, { flatShading: true }));
      rock.position.set((Math.random() - 0.5) * 6, 0.6, (Math.random() - 0.5) * 6); g.add(rock);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 44;

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const island = buildBiome(THREE, def);
    const p = ringPosition(i, keys.length, R, 6);
    island.position.set(p.x, p.y, p.z);
    island.userData = { key, def, phase: Math.random() * 6, focusRadius: 7, bobPhase: Math.random() * 6, baseY: p.y };
    if (def.mesh.shape === 'volcano') island.userData.lava = island.getObjectByName('lavaGlow');
    attachMarker(THREE, island, isDone(key), 6.6);
    clickables.push(island);
    group.add(island);
  });

  // A soft ground glow disc so the islands read as sitting in a landscape.
  const floor = new THREE.Mesh(new THREE.RingGeometry(R - 10, R + 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x2E7D4F, side: THREE.DoubleSide, transparent: true, opacity: 0.08 }));
  floor.rotation.x = Math.PI / 2; group.add(floor);

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.25;
      m.position.y = m.userData.baseY + Math.sin(t * 0.8 + m.userData.bobPhase) * 0.6; // gentle bob
      if (m.userData.lava) m.userData.lava.scale.setScalar(1 + Math.sin(t * 4 + m.userData.phase) * 0.12);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'nature',
  name: 'Nature',
  icon: '🌿',
  blurb: 'Rainforests, volcanoes, glaciers & more of Earth\'s wild places.',
  unlockCost: 12,
  theme: { primary: 0x6BCB77, secondary: 0x4BA6E8, bg: 0x08160F, light: 0xEAF7D8, ambient: 0x3a5a44 },
  category: 'Nature & Life',
  masterTitle: 'Nature Master 🌿',
  subjects: SUBJECTS,
  build,
};
