import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 4 — Ocean Life. Eight sea creatures staged inside a blue-tinted
 * underwater environment: a sandy floor, rising bubble particles and a
 * shifting caustic light. Creatures are procedural silhouettes that gently
 * swim (bob + idle fins/tentacles). Same content shape as the other worlds.
 */

const SUBJECTS = {
  shark: {
    name: 'Great White Shark', type: 'Ocean · Top Hunter', emoji: '🦈', badge: 'Shark Whisperer', build: 'shark',
    mission: '🦈 The Great White can smell a single drop of blood from far away. Ready to meet the ocean\'s top hunter?',
    stats: [['Rows', 'Of replaceable teeth'], ['Electricity', 'It can sense'], ['Smell', 'Its super sense'], ['Top hunter', 'Its ocean role']],
    facts: ['🦈 A great white has rows of teeth — when one falls out, a new one rolls forward to replace it.', '👃 It can smell a tiny drop of blood from hundreds of metres away.', '⚡ It senses the faint electricity given off by other animals to find hidden prey.', '🥩 It doesn\'t chew — it bites off chunks and swallows them whole.'],
    fun: 'A great white can grow and lose over 20,000 teeth in its life — new ones roll in like a conveyor belt!',
    quiz: [
      ['What happens when a great white loses a tooth?', ['A new one moves forward to replace it', 'It stays toothless', 'It grows a beak', 'Nothing ever'], 0],
      { t: 'tf', q: 'Sharks can sense the electricity given off by other animals.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a shark\'s fin above the water?', options: [
        { shape: 'triangle', color: '#7C8794', label: 'Fin' }, { shape: 'circle', color: '#7C8794', label: 'Ball' }, { shape: 'square', color: '#7C8794', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['A great white always has rows of spare teeth ready. Why is that so useful for a hunter?', ['It never gets stuck with no teeth', 'It looks scary', 'It can smile more', 'It needs fewer meals'], 0],
      { t: 'tf', q: 'Because sharks sense electricity, they can find prey hidden under the sand.', answer: true },
      ['Smelling blood from far away helps a shark do what?', ['Find food across a big ocean', 'Swim faster', 'Breathe air', 'See colours'], 0],
    ],
  },
  seaturtle: {
    name: 'Sea Turtle', type: 'Ocean · Ancient Traveller', emoji: '🐢', badge: 'Ocean Navigator', build: 'turtle',
    mission: '🐢 Sea turtles cross whole oceans and return to the very beach they were born. Ready to follow their journey?',
    stats: [['Air', 'They breathe it'], ['Home beach', 'Return to lay eggs'], ['80+ yrs', 'Can live'], ['Magnetic', 'Sense to steer']],
    facts: ['🐢 Sea turtles are reptiles that breathe air, but spend almost their whole life in the sea.', '🏖️ Female turtles return to the exact beach where they hatched to lay their own eggs.', '💨 They can hold their breath for hours while resting underwater.', '🧭 They sense Earth\'s magnetic field like a built-in compass to find their way.'],
    fun: 'A baby sea turtle can swim thousands of km and, years later, find the very same beach where it hatched!',
    quiz: [
      ['Where do female sea turtles go to lay their eggs?', ['The beach where they hatched', 'The deepest sea', 'A river', 'A coral cave'], 0],
      { t: 'tf', q: 'Sea turtles breathe air, not water.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a turtle\'s shell?', options: [
        { shape: 'hexagon', color: '#5E8C4A', label: 'Dome' }, { shape: 'star', color: '#5E8C4A', label: 'Star' }, { shape: 'square', color: '#5E8C4A', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Sea turtles sense Earth\'s magnetic field. How does that help on a huge ocean?', ['They can navigate like using a compass', 'They swim faster', 'They breathe underwater', 'They glow'], 0],
      { t: 'tf', q: 'Because turtles breathe air, they must come up to the surface now and then.', answer: true },
      ['A turtle returns to its birth beach years later. What amazing skill does that show?', ['Powerful navigation and memory', 'Super speed', 'Breathing water', 'Changing colour'], 0],
    ],
  },
  jellyfish: {
    name: 'Jellyfish', type: 'Ocean · Ancient Drifter', emoji: '🎐', badge: 'Jelly Genius', build: 'jelly',
    mission: '🎐 A jellyfish has no brain, no heart and no bones — yet it has ruled the seas for ages. Ready to explore?',
    stats: [['No brain', 'Or heart or bones'], ['95%', 'Water'], ['Sting', 'From its tentacles'], ['500 M yrs', 'Older than dinosaurs']],
    facts: ['🎐 A jellyfish has no brain, no heart and no bones at all.', '💧 It is about 95% water — almost like living jelly.', '⚡ Its trailing tentacles have tiny stingers to catch small prey.', '⏳ Jellyfish have drifted the oceans for over 500 million years — long before the dinosaurs.'],
    fun: 'Jellyfish are 95% water — lift one out of the sea and it almost vanishes as it dries!',
    quiz: [
      ['What is a jellyfish mostly made of?', ['Water', 'Bone', 'Metal', 'Sand'], 0],
      { t: 'tf', q: 'A jellyfish has a big brain to think with.', answer: false },
      { t: 'pic', q: 'Which shape looks most like a jellyfish\'s bell?', options: [
        { shape: 'oval', color: '#C58BE8', label: 'Bell' }, { shape: 'square', color: '#C58BE8', label: 'Box' }, { shape: 'triangle', color: '#C58BE8', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['A jellyfish is 95% water. What does that tell you about how it moves?', ['It mostly drifts with the ocean currents', 'It runs on the seabed', 'It flies', 'It digs tunnels'], 0],
      { t: 'tf', q: 'Since jellyfish have survived 500 million years, being simple can still be very successful.', answer: true },
      ['Jellyfish have no bones. So what keeps their soft body in shape?', ['The water around and inside them', 'A metal frame', 'Tiny wheels', 'Air pockets'], 0],
    ],
  },
  clownfish: {
    name: 'Clownfish', type: 'Ocean · Team Player', emoji: '🐠', badge: 'Anemone Ally', build: 'clownfish',
    mission: '🐠 The Clownfish makes its home in a stinging anemone that would hurt other fish. Ready to find out how?',
    stats: [['Anemone', 'Its stinging home'], ['Immune', 'To the stings'], ['Teamwork', 'With the anemone'], ['Mucus', 'Protective coat']],
    facts: ['🐠 A clownfish lives among the stinging arms of a sea anemone.', '🛡️ A special slimy coat protects it from the anemone\'s stings.', '🤝 The anemone keeps the clownfish safe, and the clownfish keeps the anemone clean — teamwork!', '🏠 Clownfish rarely swim far from their cosy anemone home.'],
    fun: 'A clownfish and its anemone help each other so well that neither would do as well living alone!',
    quiz: [
      ['Where does a clownfish make its home?', ['In a sea anemone', 'In a shell', 'In the sand', 'In a cave'], 0],
      { t: 'tf', q: 'The clownfish is stung and hurt by its own anemone home.', answer: false },
      { t: 'pic', q: 'Which colours is a clownfish?', options: [
        { shape: 'circle', color: '#F2822A', label: 'Orange & white' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['The clownfish and anemone each help the other. What is this kind of partnership called?', ['Teamwork (both help each other)', 'A fight', 'A race', 'A trick'], 0],
      { t: 'tf', q: 'A clownfish\'s slimy coat is what stops the anemone stings from hurting it.', answer: true },
      ['Why does a clownfish stay close to its anemone instead of wandering off?', ['The anemone keeps it safe from predators', 'It is lazy', 'It cannot swim', 'It is stuck'], 0],
    ],
  },
  dolphin: {
    name: 'Dolphin', type: 'Ocean · Brainiac', emoji: '🐬', badge: 'Echo Expert', build: 'dolphin',
    mission: '🐬 Dolphins "see" with sound and sleep with half their brain awake. Ready to meet the ocean\'s brainiacs?',
    stats: [['Echolocation', 'See with sound'], ['Blowhole', 'Breathes through'], ['Pod', 'Its group'], ['Half-brain', 'How it sleeps']],
    facts: ['🐬 Dolphins are very clever and use clicking sounds and echoes (echolocation) to find things in dark water.', '💨 They breathe air through a blowhole on top of their head.', '👨‍👩‍👧 They live in friendly groups called pods and work together.', '😴 A dolphin sleeps with only half its brain at a time, so it never forgets to breathe.'],
    fun: 'A dolphin only ever sleeps with HALF its brain — the other half stays awake to breathe and watch for danger!',
    quiz: [
      ['How do dolphins find things in dark water?', ['Echolocation — clicks and echoes', 'By smell only', 'By taste', 'They can\'t'], 0],
      { t: 'tf', q: 'Dolphins breathe air, not water.', answer: true },
      { t: 'pic', q: 'Which colour is a dolphin?', options: [
        { shape: 'oval', color: '#8DA2B5', label: 'Grey' }, { shape: 'oval', color: '#FF7FB0', label: 'Pink' }, { shape: 'oval', color: '#E3B23C', label: 'Gold' }], answer: 0 },
    ],
    quizHard: [
      ['A dolphin sleeps with half its brain awake. Why must it never fully switch off?', ['It must keep surfacing to breathe air', 'It might get cold', 'It could float away', 'Its eyes would close'], 0],
      { t: 'tf', q: 'Echolocation lets a dolphin "see" prey even when the water is too dark for eyes.', answer: true },
      ['Dolphins live and hunt in pods. How does staying in a group help them?', ['They can protect each other and hunt as a team', 'They get lonely faster', 'They swim slower', 'They breathe less'], 0],
    ],
  },
  anglerfish: {
    name: 'Anglerfish', type: 'Ocean · Deep-Sea Fisher', emoji: '🎣', badge: 'Deep Diver', build: 'angler',
    mission: '🎣 In the pitch-black deep sea, the Anglerfish fishes with a glowing lure on its head. Ready to dive deep?',
    stats: [['Glowing lure', 'On its head'], ['Deep dark', 'Where it lives'], ['Bacteria', 'Make the glow'], ['Big mouth', 'Gulps big prey']],
    facts: ['🎣 The anglerfish lives deep down where no sunlight ever reaches.', '💡 It dangles a glowing lure in front of its mouth to attract curious prey in the dark.', '🦠 The glow is made by tiny living bacteria — a lamp powered by life!', '👄 Its stretchy mouth and stomach can swallow prey even bigger than itself.'],
    fun: 'The anglerfish\'s glowing "fishing rod" is lit by living bacteria — the whole deep sea is full of animals that make their own light!',
    quiz: [
      ['How does an anglerfish attract prey in the dark?', ['With a glowing lure', 'By singing', 'By shouting', 'With bright sunlight'], 0],
      { t: 'tf', q: 'The deep sea where anglerfish live is full of sunlight.', answer: false },
      { t: 'pic', q: 'Which glows in the dark deep sea?', options: [
        { shape: 'star', color: '#F6E15A', label: 'Bright' }, { shape: 'circle', color: '#25303A', label: 'Dark' }, { shape: 'square', color: '#25303A', label: 'Dark' }], answer: 0 },
    ],
    quizHard: [
      ['The anglerfish\'s lure glows because of living bacteria. What is this "living light" called?', ['Bioluminescence (light made by life)', 'Electricity', 'Sunlight', 'Fire'], 0],
      { t: 'tf', q: 'A glowing lure only works well because the deep sea is completely dark.', answer: true },
      ['Food is rare in the deep sea. Why is a huge stretchy mouth helpful there?', ['It can swallow any meal it finds, even a big one', 'It looks friendly', 'It helps it swim', 'It keeps it warm'], 0],
    ],
  },
  coralpolyp: {
    name: 'Coral Polyp', type: 'Ocean · Reef Builder', emoji: '🪸', badge: 'Reef Architect', build: 'polyp',
    mission: '🪸 A coral polyp is a tiny animal, but millions together build giant reefs. Ready to meet the reef\'s builder?',
    stats: [['Tiny animal', 'Builds reefs'], ['Skeleton', 'Stony cup home'], ['Algae', 'Its food partner'], ['Colony', 'Millions together']],
    facts: ['🪸 A coral polyp is a tiny soft animal, a bit like a miniature sea anemone.', '🏰 It builds a hard, stony cup around itself for protection.', '🌿 Tiny algae live inside it and share food they make from sunlight.', '👥 Millions of polyps together build a whole coral reef over many years.'],
    fun: 'The Great Barrier Reef was built by tiny coral polyps — each smaller than your fingernail — over thousands of years!',
    quiz: [
      ['What is a coral polyp?', ['A tiny animal', 'A plant', 'A rock', 'A fish'], 0],
      { t: 'tf', q: 'Millions of coral polyps together build a coral reef.', answer: true },
      { t: 'pic', q: 'Which colour is healthy coral?', options: [
        { shape: 'circle', color: '#FF7FB0', label: 'Pink' }, { shape: 'circle', color: '#6E6E7A', label: 'Grey' }, { shape: 'circle', color: '#25303A', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['Algae inside a polyp make food from sunlight. What does that mean corals need to grow well?', ['Clean, shallow, sunny water', 'Deep dark water', 'Ice', 'Dry land'], 0],
      { t: 'tf', q: 'Because each polyp is tiny, a big reef takes a very long time to build.', answer: true },
      ['Why does a coral polyp build a hard stony cup around its soft body?', ['For protection', 'To swim faster', 'To fly', 'To glow'], 0],
    ],
  },
  giantsquid: {
    name: 'Giant Squid', type: 'Ocean · Deep Legend', emoji: '🦑', badge: 'Kraken Finder', build: 'squid',
    mission: '🦑 The Giant Squid has eyes as big as dinner plates to see in the deep dark. Ready to hunt a sea legend?',
    stats: [['Plate-sized', 'Its huge eyes'], ['Deep sea', 'Where it lives'], ['10 arms', '8 + 2 long tentacles'], ['Rarely seen', 'Alive by humans']],
    facts: ['🦑 The giant squid is one of the largest animals, living deep in the ocean.', '👁️ It has the biggest eyes of any animal — as large as dinner plates — to catch faint light in the deep.', '🖐️ It has 8 arms plus 2 extra-long tentacles to grab prey from a distance.', '📷 It is so shy and deep that it was only filmed alive for the first time quite recently.'],
    fun: 'A giant squid\'s eye can be the size of a dinner plate — the biggest eyes of any animal on Earth!',
    quiz: [
      ['Why does a giant squid have such huge eyes?', ['To see in the dark deep sea', 'To look pretty', 'To scare boats', 'To sleep better'], 0],
      { t: 'tf', q: 'The giant squid lives in shallow water right by the beach.', answer: false },
      { t: 'pic', q: 'Giant squid have the biggest eyes. Tap the biggest!', options: [
        { shape: 'circle', color: '#E9E2C8', label: '', size: 1 }, { shape: 'circle', color: '#E9E2C8', label: '', size: 0.55 }, { shape: 'circle', color: '#E9E2C8', label: '', size: 0.32 }], answer: 0 },
    ],
    quizHard: [
      ['The deep sea has only very faint light. How do dinner-plate eyes help there?', ['Big eyes catch more of the faint light', 'Big eyes glow', 'Big eyes make it fast', 'Big eyes keep it warm'], 0],
      { t: 'tf', q: 'Giant squid are rarely seen because they live deep down and are very shy.', answer: true },
      ['Why are two extra-long tentacles useful to a giant squid?', ['To grab prey from far away', 'To walk on land', 'To fly', 'To dig'], 0],
    ],
  },
};

/* ---------------- procedural sea creatures ---------------- */
const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.1, flatShading: true, ...o });

function fishBody(THREE, color, len = 2.2) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), M(THREE, color));
  body.scale.set(len / 1.1, 0.8, 0.6); body.position.y = 1.8; idle(body, 'breathe', 0.03, 2); g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1, 4), M(THREE, color));
  tail.position.set(-len, 1.8, 0); tail.rotation.z = Math.PI / 2; tail.scale.set(1, 1, 1.4);
  idle(tail, 'sway', 0.4, 4, 'x'); g.add(tail);
  g.userData.body = body;
  return g;
}

function buildCreature(THREE, kind) {
  let g = new THREE.Group();
  if (kind === 'shark' || kind === 'dolphin') {
    const col = kind === 'shark' ? 0x7C8794 : 0x8DA2B5;
    g = fishBody(THREE, col, 2.6);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 4), M(THREE, col));
    fin.position.set(0, 3, 0); fin.scale.set(0.5, 1, 1); g.add(fin);
    if (kind === 'dolphin') {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1, 8), M(THREE, col));
      beak.position.set(2.6, 1.8, 0); beak.rotation.z = -Math.PI / 2; g.add(beak);
    }
  } else if (kind === 'clownfish') {
    g = fishBody(THREE, 0xF2822A, 1.6);
    for (let i = 0; i < 2; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.14, 8, 16), M(THREE, 0xF7F7F7));
      band.position.set(0.3 - i * 0.9, 1.8, 0); band.rotation.y = Math.PI / 2; band.scale.set(1, 0.8, 0.6); g.add(band);
    }
  } else if (kind === 'turtle') {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0x5E8C4A));
    shell.position.y = 1.6; shell.scale.set(1.3, 0.8, 1.3); idle(shell, 'breathe', 0.02, 1.5); g.add(shell);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0x6E9C58));
    head.position.set(1.9, 1.5, 0); g.add(head);
    for (const [dx, dz] of [[1, 1.2], [1, -1.2], [-1, 1.2], [-1, -1.2]]) {
      const flip = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 0.6), M(THREE, 0x6E9C58));
      flip.position.set(dx, 1.3, dz); flip.rotation.y = dz > 0 ? 0.5 : -0.5; idle(flip, 'flap', 0.4, 2.5, 'x'); g.add(flip);
    }
  } else if (kind === 'jelly') {
    const bell = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      M(THREE, 0xC58BE8, { transparent: true, opacity: 0.6, emissive: 0x6B3A8A, emissiveIntensity: 0.3 }));
    bell.position.y = 2.6; bell.scale.set(1, 0.9, 1); idle(bell, 'breathe', 0.07, 2.2); g.add(bell);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 2.4, 6), M(THREE, 0xD7A8F0, { transparent: true, opacity: 0.7 }));
      tent.position.set(Math.cos(a) * 1, 1.2, Math.sin(a) * 1); idle(tent, 'sway', 0.2, 2 + i * 0.1, 'x'); g.add(tent);
    }
  } else if (kind === 'angler') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 12), M(THREE, 0x2E3A44));
    body.position.y = 1.9; body.scale.set(1.1, 1, 0.9); idle(body, 'breathe', 0.04, 1.8); g.add(body);
    const mouth = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.2, 12), M(THREE, 0x1C2530));
    mouth.position.set(1.4, 1.6, 0); mouth.rotation.z = -Math.PI / 2; g.add(mouth);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), M(THREE, 0x22303A));
    rod.position.set(1.1, 3.2, 0); rod.rotation.z = 0.5; g.add(rod);
    const lure = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), new THREE.MeshBasicMaterial({ color: 0xF6E15A }));
    lure.position.set(1.8, 3.9, 0); idle(lure, 'bobY', 0.25, 3); g.add(lure);
    g.userData.lure = lure;
  } else if (kind === 'polyp') {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), M(THREE, 0x7A6E62));
    rock.position.y = 1; g.add(rock);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.6, 8), M(THREE, [0xFF7FB0, 0xFFB65E, 0xB26CFF][i % 3], { emissive: 0x40203a, emissiveIntensity: 0.2 }));
      stalk.position.set(Math.cos(a) * 0.9, 2.2, Math.sin(a) * 0.9); idle(stalk, 'sway', 0.12, 1.5 + i * 0.1, 'x');
      const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 10), M(THREE, 0xFFE0EE));
      mouth.position.y = 0.9; mouth.rotation.x = Math.PI / 2; stalk.add(mouth); g.add(stalk);
    }
  } else if (kind === 'squid') {
    const mantle = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.2, 12), M(THREE, 0xC65A6A));
    mantle.position.y = 2.6; idle(mantle, 'breathe', 0.03, 1.6); g.add(mantle);
    for (const dz of [0.5, -0.5]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), M(THREE, 0xF0EAD0));
      eye.position.set(0.7, 1.5, dz); g.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), M(THREE, 0x111));
      pupil.position.set(1.1, 1.5, dz); g.add(pupil);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.04, 2.6, 6), M(THREE, 0xD16A7A));
      arm.position.set(Math.cos(a) * 0.6, 0.4, Math.sin(a) * 0.6); arm.rotation.x = Math.sin(a) * 0.4; arm.rotation.z = Math.cos(a) * 0.4;
      idle(arm, 'wiggle', 0.2, 2 + i * 0.15, 'x'); g.add(arm);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 44;

  // Sandy sea floor.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 24, 48),
    new THREE.MeshStandardMaterial({ color: 0xC9B98A, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -10; group.add(floor);

  // Rising bubble particles.
  const N = 220;
  const bg = new THREE.BufferGeometry();
  const bp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { bp[i * 3] = (Math.random() - 0.5) * 140; bp[i * 3 + 1] = Math.random() * 80 - 10; bp[i * 3 + 2] = (Math.random() - 0.5) * 140; }
  bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const bubbles = new THREE.Points(bg, new THREE.PointsMaterial({ color: 0xBFE9FF, size: 0.8, transparent: true, opacity: 0.5 }));
  group.add(bubbles);

  // Caustic-style shifting light that dances over the scene.
  const caustic = new THREE.PointLight(0x9FE0FF, 1.2, 400);
  caustic.position.set(0, 60, 0); group.add(caustic);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const creature = buildCreature(THREE, def.build);
    holder.add(creature);
    const p = ringPosition(i, keys.length, R, 8);
    holder.position.set(p.x, p.y, p.z);
    holder.userData = { key, def, focusRadius: 8, phase: Math.random() * 6, bobPhase: Math.random() * 6, baseY: p.y,
      anims: collectIdle(creature), lure: creature.userData.lure || null };
    attachMarker(THREE, holder, isDone(key), 6.2);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    // Bubbles float up and wrap around.
    const arr = bg.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += dt * 6;
      if (arr[i * 3 + 1] > 70) arr[i * 3 + 1] = -10;
    }
    bg.attributes.position.needsUpdate = true;
    caustic.intensity = 1 + Math.sin(t * 2) * 0.4;
    caustic.position.x = Math.sin(t * 0.4) * 40;
    caustic.position.z = Math.cos(t * 0.3) * 40;

    clickables.forEach((m) => {
      m.rotation.y += dt * 0.18;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.7;
      runIdle(m.userData.anims, t);
      if (m.userData.lure) { // pulse the anglerfish glow
        const s = 1 + Math.sin(t * 4 + m.userData.phase) * 0.25;
        m.userData.lure.scale.setScalar(s);
        m.userData.lure.material.opacity = 0.7 + Math.sin(t * 4) * 0.3;
      }
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 120 } };
}

export default {
  key: 'ocean',
  name: 'Ocean Life',
  icon: '🐬',
  blurb: 'Dive with sharks, turtles, jellyfish & the deep-sea deep.',
  unlockCost: 40,
  theme: { primary: 0x2FB6D6, secondary: 0x2560C0, bg: 0x061523, light: 0x9FE0FF, ambient: 0x1a466a },
  category: 'Nature & Life',
  masterTitle: 'Ocean Master 🌊',
  subjects: SUBJECTS,
  build,
};
