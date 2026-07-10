import { attachMarker, updateMarkers, ringPosition } from './helpers.js';

/**
 * World 8 — Plants & Botany. Every subject starts as a tiny sprout poking out
 * of a little mound of soil; tapping it plays a "time-lapse" — the plant grows
 * from sprout to full form as the info panel opens (driven by the engine's
 * onSelect hook). Photosynthesis (an idea, not a plant) is shown as an abstract
 * glowing leaf ringed by a little sun and rising oxygen bubbles — chosen as a
 * clear "sunlight in, oxygen out" metaphor.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.04, flatShading: true, ...o });

const SUBJECTS = {
  sunflower: {
    name: 'Sunflower', type: 'Plant · Sun Chaser', emoji: '🌻', badge: 'Sun Chaser', build: 'sunflower',
    mission: '🌻 A young sunflower turns its face to follow the Sun across the sky. Ready to grow one?',
    stats: [['Follows Sun', 'Young flowers do'], ['3 m', 'Can grow tall'], ['Spiral', 'Seed pattern'], ['Bees', 'It feeds them']],
    facts: ['🌻 Young sunflowers turn their faces to follow the Sun across the sky each day.', '📏 They can grow taller than a grown-up — up to about 3 metres!', '🌀 Their seeds are packed into a beautiful spiral pattern.', '🐝 The big bright face is a perfect landing pad for hungry bees.'],
    fun: 'A single sunflower head can hold up to 2,000 seeds, all packed in a neat spiral!',
    quiz: [
      ['What do young sunflowers do during the day?', ['Turn to follow the Sun', 'Close up tight', 'Dig underground', 'Change colour'], 0],
      { t: 'tf', q: 'Sunflower seeds grow in a spiral pattern.', answer: true },
      { t: 'pic', q: 'Which colour is a sunflower?', options: [
        { shape: 'circle', color: '#F2C21E', label: 'Yellow' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#B26CFF', label: 'Purple' }], answer: 0 },
    ],
    quizHard: [
      ['Young sunflowers turn to face the Sun. Why would that help the plant?', ['It catches more sunlight to grow', 'It stays cooler', 'It hides from bees', 'It scares birds'], 0],
      { t: 'tf', q: 'A bright sunflower face helps attract bees, which then help the plant make seeds.', answer: true },
      ['A sunflower packs its seeds in a tight spiral. What is a good reason for that?', ['It fits the most seeds in the space', 'It looks scary', 'It keeps seeds warm to fly', 'It makes fewer seeds'], 0],
    ],
  },
  cactus: {
    name: 'Cactus', type: 'Plant · Desert Survivor', emoji: '🌵', badge: 'Desert Survivor', build: 'cactus',
    mission: '🌵 A cactus can survive months in the desert without a drop of rain. Ready to discover its secret?',
    stats: [['Stem', 'Stores its water'], ['Spines', 'Instead of leaves'], ['Waxy skin', 'Locks in water'], ['Months', 'Without rain']],
    facts: ['🌵 A cactus stores water inside its thick stem to survive long dry spells.', '📌 It has sharp spines instead of leaves — spines lose less water and keep animals away.', '💧 Its waxy skin stops precious water escaping in the heat.', '☀️ A cactus can live for months with no rain at all.'],
    fun: 'A big saguaro cactus can soak up and store hundreds of litres of water after a single desert rain!',
    quiz: [
      ['Where does a cactus store its water?', ['In its thick stem', 'In its flowers', 'Underground only', 'In its spines'], 0],
      { t: 'tf', q: 'A cactus has spines instead of normal leaves.', answer: true },
      { t: 'pic', q: 'Which colour is a cactus?', options: [
        { shape: 'circle', color: '#4E9E5A', label: 'Green' }, { shape: 'circle', color: '#E7CE97', label: 'Sandy' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }], answer: 0 },
    ],
    quizHard: [
      ['A cactus has spines instead of broad leaves. How does that help it survive the desert?', ['Spines lose much less water than leaves', 'Spines make more shade', 'Spines catch rain', 'Spines help it walk'], 0],
      { t: 'tf', q: 'Storing water in its stem lets a cactus keep drinking long after the rain stops.', answer: true },
      ['A cactus has a thick waxy skin. In a boiling desert, why is that useful?', ['It keeps water from escaping', 'It makes it colder', 'It helps it fly', 'It attracts rain'], 0],
    ],
  },
  flytrap: {
    name: 'Venus Flytrap', type: 'Plant · Bug Hunter', emoji: '🪤', badge: 'Bug Snapper', build: 'flytrap',
    mission: '🪤 The Venus flytrap is a plant that HUNTS — snapping shut on unlucky insects. Ready to see it bite?',
    stats: [['Snaps shut', 'On insects'], ['Trigger hairs', 'Feel the prey'], ['Poor soil', 'Why it hunts'], ['Days', 'To digest a bug']],
    facts: ['🪤 The Venus flytrap is a plant that eats insects — its leaves snap shut like a trap!', '✌️ Tiny trigger hairs must be touched twice quickly before it snaps, so it ignores raindrops.', '🌱 It grows in poor soil, so it catches bugs to get the nutrients it\'s missing.', '⏳ It takes several days to slowly digest a caught insect.'],
    fun: 'A Venus flytrap only snaps if its trigger hairs are touched TWICE in a row — it can basically count to two!',
    quiz: [
      ['What does a Venus flytrap catch and eat?', ['Insects', 'Fish', 'Rocks', 'Sunbeams'], 0],
      { t: 'tf', q: 'A Venus flytrap eats bugs because its soil is poor in nutrients.', answer: true },
      { t: 'pic', q: 'Which colour is a Venus flytrap\'s trap?', options: [
        { shape: 'circle', color: '#5BB86A', label: 'Green' }, { shape: 'circle', color: '#8A8F98', label: 'Grey' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }], answer: 0 },
    ],
    quizHard: [
      ['The trap only shuts if two hairs are touched quickly. Why is "counting to two" clever?', ['It avoids wasting energy on raindrops', 'It looks cool', 'It scares bees', 'It grows faster'], 0],
      { t: 'tf', q: 'Because its soil lacks nutrients, catching bugs is how the flytrap gets what it needs.', answer: true },
      ['Most plants make food from sunlight only. Why does the flytrap ALSO catch bugs?', ['To get nutrients missing from poor soil', 'Because sunlight is boring', 'To scare gardeners', 'To grow spines'], 0],
    ],
  },
  sequoia: {
    name: 'Giant Sequoia', type: 'Plant · Living Giant', emoji: '🌲', badge: 'Forest Titan', build: 'sequoia',
    mission: '🌲 A giant sequoia can live over 3,000 years and tower higher than a 25-storey building. Ready to grow a giant?',
    stats: [['3,000+ yrs', 'Can live'], ['83 m', 'Can grow tall'], ['Fireproof', 'Thick bark'], ['Tiny seeds', 'Oat-flake sized']],
    facts: ['🌲 Giant sequoias are among the largest living things on the whole planet.', '⏳ Some are over 3,000 years old — older than many countries!', '🔥 Their thick, spongy bark protects them from forest fires.', '🌰 Each towering giant grows from a seed no bigger than an oat flake.'],
    fun: 'A giant sequoia is so wide that people have cut tunnels through the trunk — and driven cars right through!',
    quiz: [
      ['How long can a giant sequoia live?', ['Over 3,000 years', 'About 3 years', 'About 30 years', 'One year'], 0],
      { t: 'tf', q: 'A giant sequoia grows from a tiny seed.', answer: true },
      { t: 'pic', q: 'Which shape matches a tall sequoia tree?', options: [
        { shape: 'tall', color: '#7FA05E', label: 'Tall' }, { shape: 'circle', color: '#7FA05E', label: 'Round' }, { shape: 'square', color: '#7FA05E', label: 'Blocky' }], answer: 0 },
    ],
    quizHard: [
      ['A sequoia\'s thick bark protects it from fire. How does that help it live so long?', ['It survives fires that kill other trees', 'It burns brighter', 'It stays small', 'It floats away'], 0],
      { t: 'tf', q: 'Since a giant sequoia grows from an oat-sized seed, huge things can start incredibly small.', answer: true },
      ['A tree that is 3,000 years old started growing when? Think about it!', ['Thousands of years ago', 'Last week', 'This morning', 'It has always existed'], 0],
    ],
  },
  bamboo: {
    name: 'Bamboo', type: 'Plant · Speed Grower', emoji: '🎋', badge: 'Speed Sprout', build: 'bamboo',
    mission: '🎋 Bamboo can grow almost a metre in a single day — the fastest-growing plant on Earth. Ready to watch it shoot up?',
    stats: [['Fastest', 'Growing plant'], ['~90 cm', 'Grow in a day'], ['A grass', 'Not a tree'], ['Pandas', 'Love to eat it']],
    facts: ['🎋 Bamboo is the fastest-growing plant in the world — some kinds grow almost a metre in a single day!', '🌾 It\'s actually a giant grass, not a tree.', '🏗️ It\'s light but super strong, so people build houses and scaffolding from it.', '🐼 Giant pandas munch on bamboo almost all day long.'],
    fun: 'You could almost WATCH some bamboo grow — the fastest kinds shoot up nearly a metre in just one day!',
    quiz: [
      ['What is special about how bamboo grows?', ['It grows extremely fast', 'It grows underground', 'It never grows', 'It shrinks'], 0],
      { t: 'tf', q: 'Bamboo is actually a type of grass, not a tree.', answer: true },
      { t: 'pic', q: 'Which colour is fresh bamboo?', options: [
        { shape: 'tall', color: '#7DBE4E', label: 'Green' }, { shape: 'tall', color: '#8A5A34', label: 'Brown' }, { shape: 'tall', color: '#4BA6E8', label: 'Blue' }], answer: 0 },
    ],
    quizHard: [
      ['Bamboo grows super fast toward the light. Why is growing fast an advantage for a plant?', ['It reaches sunlight before others shade it', 'It gets tired', 'It scares pandas', 'It stays hidden'], 0],
      { t: 'tf', q: 'Because bamboo is both light and strong, it makes good building material.', answer: true },
      ['Pandas eat bamboo almost all day. What does that suggest about bamboo as a food?', ['It has little energy, so they must eat lots', 'It is super rich, so they eat little', 'It is poisonous', 'It tastes like meat'], 0],
    ],
  },
  mushroom: {
    name: 'Mushroom', type: 'Fungus · Not a Plant!', emoji: '🍄', badge: 'Fungus Finder', build: 'mushroom',
    mission: '🍄 Surprise — a mushroom isn\'t a plant at all! Ready to dig up the secret of the fungus?',
    stats: [['A fungus', 'Not a plant'], ['No sunlight', 'Needed to grow'], ['Recycler', 'Breaks down dead stuff'], ['Network', 'Hidden underground']],
    facts: ['🍄 A mushroom is a fungus, NOT a plant — it doesn\'t make food from sunlight the way plants do.', '♻️ It grows by breaking down dead leaves and wood, recycling them back into soil.', '🕸️ The mushroom you see is just the "fruit" — a huge web of threads spreads hidden underground.', '🌑 Because it doesn\'t need light, a mushroom can grow in dark, damp places.'],
    fun: 'The biggest living thing on Earth is a honey fungus whose hidden network covers an area bigger than 1,000 football pitches!',
    quiz: [
      ['Is a mushroom a plant?', ['No — it\'s a fungus', 'Yes, a green plant', 'It\'s an animal', 'It\'s a rock'], 0],
      { t: 'tf', q: 'Mushrooms need bright sunlight to make food, just like plants.', answer: false },
      { t: 'pic', q: 'Which colour is a classic spotted toadstool cap?', options: [
        { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['A mushroom breaks down dead leaves and wood. Why is that job important for a forest?', ['It recycles them into fresh soil', 'It makes more trees fall', 'It blocks the Sun', 'It scares animals'], 0],
      { t: 'tf', q: 'Because a fungus doesn\'t use sunlight, it can grow in dark places where plants can\'t.', answer: true },
      ['The mushroom you see is just the "fruit" of a hidden underground network. What does that tell you?', ['Most of the fungus is out of sight', 'It has no roots at all', 'It is only the cap', 'It floats in the air'], 0],
    ],
  },
  seed: {
    name: 'Seed & Sprout', type: 'Plant · The Beginning', emoji: '🌱', badge: 'Sprout Starter', build: 'seed',
    mission: '🌱 Inside every seed sleeps a tiny plant, waiting to wake up. Ready to sprout one?',
    stats: [['Baby plant', 'Sleeps inside'], ['Water + warmth', 'Wakes it up'], ['Roots', 'Grow down first'], ['Shoot', 'Grows up to light']],
    facts: ['🌱 A seed holds a tiny baby plant and a packed lunch of food to get it started.', '💧 It "wakes up" and sprouts (germinates) when it gets water and warmth.', '⬇️ The root grows DOWN first to drink water, then a shoot grows UP toward the light.', '⏳ Some seeds can wait years for the right moment to start growing.'],
    fun: 'Scientists once grew a healthy plant from a seed that had been frozen in the ground for 32,000 years!',
    quiz: [
      ['What does a seed need to start growing?', ['Water and warmth', 'Loud noises', 'Ice and dark', 'Nothing at all'], 0],
      { t: 'tf', q: 'A seed has a tiny baby plant inside it.', answer: true },
      { t: 'pic', q: 'Which colour is a healthy new sprout?', options: [
        { shape: 'drop', color: '#6BCB77', label: 'Green' }, { shape: 'drop', color: '#8A8F98', label: 'Grey' }, { shape: 'drop', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['A sprouting seed grows its root DOWN before its shoot goes up. Why root first?', ['To reach water to drink', 'To hide from the Sun', 'To stay small', 'To fall over'], 0],
      { t: 'tf', q: 'The food packed inside a seed feeds the baby plant until it grows leaves.', answer: true },
      ['Some seeds wait years before sprouting. Why is waiting for water a smart plan?', ['It sprouts only when it can survive', 'It likes being lazy', 'It forgets to grow', 'It waits for winter'], 0],
    ],
  },
  photosynthesis: {
    name: 'Photosynthesis', type: 'Plant · Nature\'s Recipe', emoji: '☀️', badge: 'Sunlight Chef', build: 'photo',
    mission: '☀️ Plants make their own food out of sunlight, water, and air. Ready to unlock nature\'s magic recipe?',
    stats: [['Sunlight', 'The energy'], ['Water + Air', 'The ingredients'], ['Sugar', 'The food made'], ['Oxygen', 'Given out']],
    facts: ['☀️ Plants make their own food using sunlight — this amazing trick is called photosynthesis.', '🥤 They mix sunlight, water, and a gas from the air (carbon dioxide) to make sugar.', '🫧 As they do it, they give out oxygen — the very air we breathe!', '🟢 The green stuff in leaves, called chlorophyll, is what catches the sunlight.'],
    fun: 'Almost all the oxygen you breathe was made by plants and tiny ocean life doing photosynthesis!',
    quiz: [
      ['What do plants use to make their own food?', ['Sunlight, water and air', 'Only soil', 'Meat', 'Moonlight only'], 0],
      { t: 'tf', q: 'Plants give out oxygen that we breathe.', answer: true },
      { t: 'pic', q: 'What gives a plant the energy to make food?', options: [
        { shape: 'circle', color: '#F6D64A', label: 'The Sun' }, { shape: 'circle', color: '#33313F', label: 'Darkness' }, { shape: 'circle', color: '#6E6E7A', label: 'A rock' }], answer: 0 },
    ],
    quizHard: [
      ['Plants give out oxygen during photosynthesis. Why does that matter to you?', ['It makes the air we breathe', 'It makes the Sun brighter', 'It cools the soil', 'It has no effect'], 0],
      { t: 'tf', q: 'Green chlorophyll in leaves is what catches sunlight for photosynthesis.', answer: true },
      ['Leaves are usually broad and flat. How does that shape help photosynthesis?', ['It catches lots of sunlight', 'It stores water', 'It scares bugs', 'It helps roots grow'], 0],
    ],
  },
};

/* ---------------- procedural plants (built base-up so they scale to grow) ---------------- */
function buildPlant(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'sunflower') {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 6, 8), M(THREE, 0x4E9E4A));
    stem.position.y = 3; g.add(stem);
    const centre = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 20), M(THREE, 0x6B4A1E));
    centre.position.y = 6.2; centre.rotation.x = -0.5; g.add(centre);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 4), M(THREE, 0xF2C21E));
      petal.position.set(Math.cos(a) * 1.5, 6.2, Math.sin(a) * 1.5 - 0.3); petal.rotation.set(-0.5, 0, a + Math.PI / 2); g.add(petal);
    }
  } else if (kind === 'cactus') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(1, 4, 6, 12), M(THREE, 0x4E9E5A));
    body.position.y = 3; g.add(body);
    for (const dx of [1, -1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.6, 6, 10), M(THREE, 0x4E9E5A));
      arm.position.set(dx * 1.2, 3.2, 0); arm.rotation.z = dx * -0.9; g.add(arm);
    }
    for (let i = 0; i < 24; i++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 4), M(THREE, 0xE9DFC4));
      const a = Math.random() * Math.PI * 2, y = 1 + Math.random() * 4;
      spine.position.set(Math.cos(a), y, Math.sin(a)); spine.rotation.z = -Math.cos(a) * 1.5; spine.rotation.x = Math.sin(a) * 1.5; g.add(spine);
    }
  } else if (kind === 'flytrap') {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.4 + k * 0.4, 6), M(THREE, 0x4E8E3A));
      stem.position.set(Math.cos(a) * 0.6, 1.4 + k * 0.2, Math.sin(a) * 0.6); stem.rotation.z = Math.cos(a) * 0.3; g.add(stem);
      for (const side of [1, -1]) {
        const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8, 0, Math.PI), M(THREE, side > 0 ? 0x6BBE55 : 0xC1443C, { side: THREE.DoubleSide }));
        lobe.position.set(Math.cos(a) * 0.6, 2.8 + k * 0.4, Math.sin(a) * 0.6 + side * 0.1);
        lobe.rotation.set(side * 0.6, a, 0); lobe.scale.set(1, 0.7, 1); g.add(lobe);
      }
    }
  } else if (kind === 'sequoia') {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 7, 10), M(THREE, 0x8A4B2E));
    trunk.position.y = 3.5; g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(3 - i * 0.6, 3.5, 8), M(THREE, 0x3E7D3A));
      cone.position.y = 6 + i * 2; g.add(cone);
    }
  } else if (kind === 'bamboo') {
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const cx = Math.cos(a) * 0.9, cz = Math.sin(a) * 0.9;
      for (let s = 0; s < 4; s++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 1.6, 8), M(THREE, 0x7DBE4E, { emissive: 0x2a3d18, emissiveIntensity: 0.15 }));
        seg.position.set(cx, 0.9 + s * 1.7, cz); g.add(seg);
        const node = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 10), M(THREE, 0x5A9E38));
        node.position.set(cx, 1.7 + s * 1.7, cz); node.rotation.x = Math.PI / 2; g.add(node);
      }
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 4), M(THREE, 0x8ACE5E));
      leaf.position.set(cx, 7.6, cz); leaf.rotation.z = 0.6; g.add(leaf);
    }
  } else if (kind === 'mushroom') {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3, 10), M(THREE, 0xF0E6D0));
    stalk.position.y = 1.5; g.add(stalk);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0xE23B2E));
    cap.position.y = 3; cap.scale.set(1, 0.75, 1); g.add(cap);
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.4;
      const spot = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), M(THREE, 0xFFFFFF));
      spot.position.set(Math.cos(a) * r, 3 + Math.cos(r) * 0.6, Math.sin(a) * r); spot.rotation.x = -Math.PI / 2 + 0.3; g.add(spot);
    }
  } else if (kind === 'seed') {
    const sprout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 6), M(THREE, 0x6BCB77));
    sprout.position.y = 1.2; g.add(sprout);
    for (const dx of [1, -1]) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), M(THREE, 0x7DD07A));
      leaf.position.set(dx * 0.7, 2.2, 0); leaf.scale.set(1.3, 0.4, 0.8); leaf.rotation.z = dx * -0.6; g.add(leaf);
    }
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0x8A5A34));
    seed.position.y = 0.4; seed.scale.set(1.2, 0.9, 1); g.add(seed);
  } else if (kind === 'photo') {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 12), M(THREE, 0x4EAE4A, { emissive: 0x1e4d1e, emissiveIntensity: 0.35 }));
    leaf.position.y = 3; leaf.scale.set(1.4, 0.25, 1); g.add(leaf);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3, 6), M(THREE, 0x4E8E3A));
    stem.position.y = 1.5; g.add(stem);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 12), new THREE.MeshBasicMaterial({ color: 0xF6D64A }));
    sun.position.set(2.4, 5, 0); sun.name = 'sun'; g.add(sun); g.userData.sun = sun;
    for (let i = 0; i < 5; i++) { // rising oxygen bubbles
      const o2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xBFE9FF, transparent: true, opacity: 0.6 }));
      o2.position.set(-1.5 + i * 0.4, 3.5 + i * 0.5, 0); o2.name = 'o2'; g.add(o2);
    }
    g.userData.bubbles = g.children.filter((c) => c.name === 'o2');
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 44;

  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 22, 48),
    new THREE.MeshStandardMaterial({ color: 0x5B7A3A, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    // Little mound of soil (does not scale — the plant grows out of it).
    const soil = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x6B4A2E, roughness: 1 }));
    soil.scale.set(1.4, 0.5, 1.4); holder.add(soil);

    const plant = buildPlant(THREE, def.build);
    plant.scale.setScalar(0.16); // starts as a sprout
    holder.add(plant);

    const p = ringPosition(i, keys.length, R, 0);
    holder.position.set(p.x, 0, p.z);
    holder.userData = { key, def, focusRadius: 8, phase: Math.random() * 6, plant,
      grow: 0, growTarget: 0, sun: plant.userData.sun || null, bubbles: plant.userData.bubbles || null };
    attachMarker(THREE, holder, isDone(key), 3.4);
    clickables.push(holder);
    group.add(holder);
  });

  // Triggered by the engine when a subject is tapped — plays the grow time-lapse.
  function onSelect(key) {
    const m = clickables.find((c) => c.userData.key === key);
    if (m) m.userData.growTarget = 1;
  }

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      const u = m.userData;
      u.grow += (u.growTarget - u.grow) * Math.min(1, dt * 2.6);
      const s = 0.16 + u.grow * 0.84;
      u.plant.scale.setScalar(s);
      m.rotation.y += dt * 0.15;
      if (u.sun) u.sun.position.set(Math.cos(t) * 2.6 * s, 5 * s, Math.sin(t) * 2.6 * s);
      if (u.bubbles) u.bubbles.forEach((o2, k) => {
        o2.position.y = (3.5 + ((t * 1.5 + k) % 3)) * s;
        o2.material.opacity = 0.6 * (1 - ((t * 1.5 + k) % 3) / 3);
      });
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, onSelect, home: { radius: 108 } };
}

export default {
  key: 'plants',
  name: 'Plants & Botany',
  icon: '🌱',
  blurb: 'Grow from seed to giant sequoia and meet nature\'s strangest plants.',
  unlockCost: 144,
  category: 'Nature & Life',
  theme: { primary: 0x5FB84A, secondary: 0xF2C21E, bg: 0x0a1408, light: 0xEAF7C8, ambient: 0x3a5a2e },
  masterTitle: 'Botany Master 🌱',
  subjects: SUBJECTS,
  build,
};
