import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 7 — Bugs & Insects. The player "shrinks" to bug size in a miniature
 * garden: tall grass blades tower overhead as a scale reference, dew drops
 * sparkle, and a leaf canopy floats above. Eight mini-beasts, each a procedural
 * silhouette with idle animation. Same data shape as the other worlds.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.05, flatShading: true, ...o });

const SUBJECTS = {
  honeybee: {
    name: 'Honeybee', type: 'Insect · Garden Helper', emoji: '🐝', badge: 'Pollen Pilot', build: 'bee',
    mission: '🐝 A honeybee visits hundreds of flowers a day, helping the whole garden grow. Ready to buzz along?',
    stats: [['6 legs', 'Like all insects'], ['Pollen', 'It carries it'], ['Antennae', 'To smell & feel'], ['Colony', 'Lives in thousands']],
    facts: ['🐝 A honeybee is an insect — it has 6 legs, 3 body parts and 2 antennae.', '🌸 It carries pollen from flower to flower, helping plants make seeds and fruit.', '📡 It uses its antennae to smell and feel the world around it.', '👑 It lives in a busy colony of thousands of bees with a single queen.'],
    fun: 'One honeybee makes only about a twelfth of a teaspoon of honey in its whole life — teamwork makes the hive!',
    quiz: [
      ['How many legs does a honeybee have, like all insects?', ['6', '4', '8', '10'], 0],
      { t: 'tf', q: 'Bees help plants grow by carrying pollen.', answer: true },
      { t: 'pic', q: 'Which colours are on a honeybee?', options: [
        { shape: 'circle', color: '#F2C21E', label: 'Yellow & black' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#FF7FB0', label: 'Pink' }], answer: 0 },
    ],
    quizHard: [
      ['Bees carry pollen between flowers. What might happen to a garden with no bees?', ['Fewer plants would make fruit and seeds', 'Plants would grow faster', 'Nothing would change', 'Flowers would fly'], 0],
      { t: 'tf', q: 'Since a hive has one queen, all the other bees work together as a team.', answer: true },
      ['A bee uses its antennae to smell flowers. Why is a good sense of smell useful for it?', ['To find flowers full of nectar', 'To hear music', 'To see colours', 'To sting harder'], 0],
    ],
  },
  butterfly: {
    name: 'Butterfly', type: 'Insect · Transformer', emoji: '🦋', badge: 'Metamorph Master', build: 'butterfly',
    mission: '🦋 A butterfly starts life as a crawling caterpillar and completely transforms. Ready to see the change?',
    stats: [['4 stages', 'Egg to butterfly'], ['Feet', 'It tastes with them'], ['Straw tongue', 'To sip nectar'], ['Scales', 'Cover its wings']],
    facts: ['🐛 A butterfly begins as a caterpillar, then changes completely inside a chrysalis — that\'s metamorphosis!', '👣 It tastes food by standing on it — with its feet!', '🥤 It sips flower nectar through a long, curled, straw-like tongue.', '🌈 Its wings are covered in thousands of tiny coloured scales.'],
    fun: 'A butterfly tastes with its FEET — it stands on a leaf or flower to check if it\'s good before eating!',
    quiz: [
      ['What does a caterpillar turn into?', ['A butterfly', 'A bee', 'A bird', 'A leaf'], 0],
      { t: 'tf', q: 'A butterfly tastes food with its feet.', answer: true },
      { t: 'pic', q: 'Which colour is a bright butterfly wing?', options: [
        { shape: 'diamond', color: '#F2822A', label: 'Orange' }, { shape: 'diamond', color: '#6E6E7A', label: 'Grey' }, { shape: 'diamond', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['A caterpillar and a butterfly look totally different. How can they be the same animal?', ['The caterpillar transforms into the butterfly', 'They are cousins', 'They just look alike', 'They swap bodies'], 0],
      { t: 'tf', q: 'Tasting with its feet lets a butterfly check a leaf before laying eggs on it.', answer: true },
      ['A butterfly\'s tongue is a long curled straw. Why is that shape helpful?', ['To reach nectar deep inside flowers', 'To dig soil', 'To sting', 'To fly faster'], 0],
    ],
  },
  ant: {
    name: 'Ant', type: 'Insect · Mighty Worker', emoji: '🐜', badge: 'Colony Captain', build: 'ant',
    mission: '🐜 An ant can lift 50 times its own weight and never gets lost. Ready to meet the garden\'s mighty worker?',
    stats: [['50×', 'Its own weight lifted'], ['Scent trails', 'How they talk'], ['Colony', 'Millions together'], ['No ears', 'Feels vibrations']],
    facts: ['🐜 An ant is incredibly strong — it can carry about 50 times its own body weight!', '👃 It leaves a scent trail so other ants can follow it to food.', '🏙️ It lives in huge underground colonies, all working as one team.', '📳 An ant has no ears — it "hears" by feeling vibrations through the ground.'],
    fun: 'If you were as strong for your size as an ant, you could lift a car right over your head!',
    quiz: [
      ['How does an ant lead others to food?', ['It leaves a scent trail', 'It shouts', 'It draws a map', 'It waves'], 0],
      { t: 'tf', q: 'An ant can lift many times its own weight.', answer: true },
      { t: 'pic', q: 'Which colour is a common garden ant?', options: [
        { shape: 'circle', color: '#3B2A20', label: 'Dark brown' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['One ant finds food and lays a scent trail. Why does that help the whole colony?', ['Others can follow the trail to the food', 'It scares the food', 'It hides the food', 'It eats it alone'], 0],
      { t: 'tf', q: 'Because ants feel vibrations through the ground, stamping nearby can warn them of danger.', answer: true },
      ['Ants work together in huge numbers. How does teamwork help a tiny ant?', ['Together they do jobs too big for one', 'They get tired faster', 'They get lost', 'They fight always'], 0],
    ],
  },
  ladybug: {
    name: 'Ladybug', type: 'Insect · Garden Guardian', emoji: '🐞', badge: 'Aphid Hunter', build: 'ladybug',
    mission: '🐞 The tiny ladybug is a fierce garden guardian, munching pests all day. Ready to meet a helpful hunter?',
    stats: [['Aphids', 'Its favourite food'], ['Red', 'A warning colour'], ['Spots', 'On its back'], ['Hidden wings', 'Under its shell']],
    facts: ['🐞 A ladybug is a helpful hunter that eats tiny plant-munching pests called aphids.', '🚨 Its bright red colour warns birds "I taste bad — don\'t eat me!"', '🛡️ The spots sit on hard wing-covers that protect delicate flying wings tucked underneath.', '🌿 Gardeners love ladybugs because they keep plants safe from pests.'],
    fun: 'A single ladybug can gobble up to 5,000 plant pests in its lifetime — a gardener\'s best friend!',
    quiz: [
      ['What do ladybugs like to eat?', ['Tiny pests called aphids', 'Leaves only', 'Other ladybugs', 'Rocks'], 0],
      { t: 'tf', q: 'A ladybug\'s bright red colour warns predators to stay away.', answer: true },
      { t: 'pic', q: 'Which colour is a classic ladybug?', options: [
        { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#E3B23C', label: 'Yellow' }], answer: 0 },
    ],
    quizHard: [
      ['A ladybug is bright red so birds leave it alone. What is this warning colour a clever trick for?', ['Staying safe without fighting', 'Looking pretty only', 'Getting warm', 'Flying faster'], 0],
      { t: 'tf', q: 'Because ladybugs eat pests, they help gardens without any bug spray.', answer: true },
      ['A ladybug\'s spotted shell is hard, but its flying wings are soft. Why keep the wings tucked underneath?', ['To protect them until it flies', 'To keep them warm to eat', 'To hide from food', 'To make spots'], 0],
    ],
  },
  dragonfly: {
    name: 'Dragonfly', type: 'Insect · Flying Ace', emoji: '🪰', badge: 'Sky Acrobat', build: 'dragonfly',
    mission: '🌈 The dragonfly can fly backwards, hover, and see almost all around at once. Ready to meet a flying ace?',
    stats: [['Backwards', 'It can fly'], ['360°', 'Almost all-round sight'], ['Mosquitoes', 'It eats them'], ['Underwater', 'It starts life there']],
    facts: ['🪰 A dragonfly is an amazing flier — it can hover, zoom, and even fly backwards.', '👀 Its huge eyes let it see almost all the way around at the same time.', '🦟 It\'s a champion mosquito-catcher, snatching them right out of the air.', '💧 It begins life underwater as a young "nymph" before growing wings.'],
    fun: 'Dragonflies were flying before the dinosaurs — ancient ones had wings as wide as a hawk!',
    quiz: [
      ['What can a dragonfly do that most insects can\'t?', ['Fly backwards', 'Breathe fire', 'Turn invisible', 'Swim only'], 0],
      { t: 'tf', q: 'A dragonfly begins its life underwater.', answer: true },
      { t: 'pic', q: 'How many wings does a dragonfly have? Tap the count of 4!', options: [
        { shape: 'star', color: '#5AC8D6', label: '4 wings' }, { shape: 'triangle', color: '#5AC8D6', label: '2 wings' }, { shape: 'circle', color: '#5AC8D6', label: 'no wings' }], answer: 0 },
    ],
    quizHard: [
      ['A dragonfly\'s huge eyes see nearly all around. Why is that useful for a hunter of fast bugs?', ['It can spot and track prey anywhere', 'It can sleep with eyes open', 'It looks scary', 'It sees in the dark only'], 0],
      { t: 'tf', q: 'Being able to hover and fly backwards helps a dragonfly grab prey in mid-air.', answer: true },
      ['A dragonfly starts underwater, then grows wings. What does that tell you about its life?', ['It changes as it grows up', 'It never changes', 'It is born flying', 'It stays a nymph forever'], 0],
    ],
  },
  spider: {
    name: 'Spider', type: 'Arachnid · Not an Insect!', emoji: '🕷️', badge: 'Web Weaver', build: 'spider',
    mission: '🕷️ Surprise — a spider isn\'t even an insect! Ready to untangle the web of the eight-legged wonder?',
    stats: [['8 legs', 'Arachnid, not insect'], ['Silk', 'Stronger than steel'], ['2 body parts', 'Insects have 3'], ['No wings', 'It never flies']],
    facts: ['🕷️ A spider is an arachnid, NOT an insect — it has 8 legs and 2 body parts (insects have 6 legs and 3).', '🕸️ It spins silk from its body that, for its weight, is stronger than steel.', '🎯 It uses webs or clever tricks to catch its food.', '🙂 Almost all spiders are harmless to people and help by eating pests.'],
    fun: 'Spider silk is, for its weight, stronger than steel — a pencil-thick strand could stop a flying jet!',
    quiz: [
      ['Why isn\'t a spider an insect?', ['It has 8 legs (insects have 6)', 'It is too big', 'It has wings', 'It has no legs'], 0],
      { t: 'tf', q: 'Spiders have wings and can fly.', answer: false },
      { t: 'pic', q: 'A spider has 8 legs. Tap the one with the most legs!', options: [
        { shape: 'star', color: '#4B3B33', label: '8 legs' }, { shape: 'hexagon', color: '#4B3B33', label: '6 legs' }, { shape: 'triangle', color: '#4B3B33', label: '3 legs' }], answer: 0 },
    ],
    quizHard: [
      ['Insects have 6 legs and 3 body parts. A spider has 8 legs and 2. What does that make a spider?', ['An arachnid, not an insect', 'A big insect', 'A tiny bird', 'A beetle'], 0],
      { t: 'tf', q: 'Since most spiders eat pests, having a few spiders around can actually help a garden.', answer: true },
      ['Spider silk is super strong for its weight. Why is that useful to the spider?', ['Its web can hold struggling prey', 'It can wear it as a hat', 'It floats away', 'It glows'], 0],
    ],
  },
  firefly: {
    name: 'Firefly', type: 'Insect · Living Lantern', emoji: '✨', badge: 'Night Lighter', build: 'firefly',
    mission: '✨ On summer nights, fireflies flash their own living light. Ready to discover how they glow?',
    stats: [['Glows', 'Makes its own light'], ['Cold light', 'Almost no heat'], ['Flash code', 'To find friends'], ['A beetle', 'Its insect type']],
    facts: ['✨ A firefly makes its own light inside its belly — that\'s called bioluminescence!', '❄️ Its glow is "cold light", giving off almost no heat at all.', '💬 It flashes a special pattern to send messages and find a mate in the dark.', '🪲 A firefly is actually a kind of beetle.'],
    fun: 'A firefly\'s glow is nearly all light and almost no heat — far more efficient than a light bulb!',
    quiz: [
      ['Where does a firefly make its light?', ['Inside its own body', 'From the Moon', 'From a battery', 'From the Sun'], 0],
      { t: 'tf', q: 'A firefly\'s light is hot like a real flame.', answer: false },
      { t: 'pic', q: 'Which one glows in the dark like a firefly?', options: [
        { shape: 'star', color: '#F6E15A', label: 'Bright' }, { shape: 'circle', color: '#2B2B33', label: 'Dark' }, { shape: 'square', color: '#2B2B33', label: 'Dark' }], answer: 0 },
    ],
    quizHard: [
      ['A firefly\'s glow makes light but almost no heat. Why is "cold light" clever?', ['It doesn\'t waste energy as heat', 'It stays warm to fly', 'It cooks its food', 'It melts leaves'], 0],
      { t: 'tf', q: 'Fireflies flash in patterns, so their light is really a kind of code.', answer: true },
      ['Fireflies flash to find a mate at night. Why flash instead of call out?', ['Light is easy to see in the dark', 'They have no mouths', 'It is quieter to hide', 'Sound scares them'], 0],
    ],
  },
  mantis: {
    name: 'Praying Mantis', type: 'Insect · Patient Hunter', emoji: '🦗', badge: 'Ambush Ace', build: 'mantis',
    mission: '🦗 Still as a statue, the praying mantis waits… then strikes in a flash. Ready to meet a patient hunter?',
    stats: [['Rotating head', 'Looks over its shoulder'], ['Spiky arms', 'Grab prey fast'], ['Camouflage', 'Hides as a leaf'], ['Ambush', 'Waits, then strikes']],
    facts: ['🦗 A praying mantis stays perfectly still, then grabs prey with spiky front legs in a flash.', '🔄 It can turn its head almost all the way around to watch for food.', '🍃 It is often shaped and coloured like a leaf or twig to stay hidden.', '🙏 It holds its front legs folded, as if it is "praying".'],
    fun: 'A praying mantis can turn its head to look right over its shoulder — almost no other insect can do that!',
    quiz: [
      ['How does a praying mantis catch prey?', ['Waits still, then grabs it fast', 'Chases it for hours', 'Digs a pit', 'Sprays water'], 0],
      { t: 'tf', q: 'A mantis can turn its head to look over its shoulder.', answer: true },
      { t: 'pic', q: 'Which colour helps a mantis hide among leaves?', options: [
        { shape: 'circle', color: '#5BB86A', label: 'Green' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#F6E15A', label: 'Yellow' }], answer: 0 },
    ],
    quizHard: [
      ['A mantis is green and shaped like a leaf. How does that help it hunt?', ['Prey can\'t see it until too late', 'It scares prey away', 'It can fly higher', 'It glows at night'], 0],
      { t: 'tf', q: 'Turning its head to look around helps a mantis spot both prey and danger.', answer: true },
      ['A mantis waits perfectly still before striking. Why is being patient a good hunting trick?', ['Prey comes close without noticing', 'It gets more tired', 'It scares itself', 'It wastes energy'], 0],
    ],
  },
};

/* ---------------- procedural bugs ---------------- */
function wings(THREE, g, color, y, spread, len, speed, opacity = 0.55) {
  const list = [];
  for (const dz of [1, -1]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(len, 16),
      new THREE.MeshStandardMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, flatShading: true }));
    w.scale.set(1, 0.5, 1);
    w.position.set(0, y, dz * spread);
    w.rotation.x = Math.PI / 2;
    idle(w, 'flap', 0.5, speed, 'z');
    g.add(w); list.push(w);
  }
  return list;
}

function buildBug(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'bee' || kind === 'firefly') {
    const c1 = kind === 'bee' ? 0xF2C21E : 0x8A6A2E;
    for (let i = 0; i < 3; i++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.8 - i * 0.05, 14, 10), M(THREE, i % 2 ? 0x2A2A2A : c1));
      seg.position.set(-i * 0.6 + 0.6, 2, 0); seg.scale.set(0.85, 1, 1); g.add(seg);
    }
    wings(THREE, g, 0xCFEAFF, 2.7, 0.5, 0.8, 20, 0.5);
    idle(g, 'bobY', 0.3, 3);
    if (kind === 'firefly') {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), new THREE.MeshBasicMaterial({ color: 0xF6E15A }));
      glow.position.set(-1.2, 2, 0); glow.name = 'glow'; g.add(glow); g.userData.glow = glow;
    }
  } else if (kind === 'butterfly') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 2.2, 8), M(THREE, 0x33313F));
    body.position.y = 2.2; g.add(body);
    for (const dz of [1, -1]) {
      for (const [oy, r, col] of [[2.7, 1.1, 0xF2822A], [1.7, 0.85, 0xE3B23C]]) {
        const w = new THREE.Mesh(new THREE.CircleGeometry(r, 16),
          new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.85, side: THREE.DoubleSide, flatShading: true }));
        w.position.set(0, oy, dz * r * 0.8); w.rotation.x = Math.PI / 2; idle(w, 'flap', 0.6, 5, 'z'); g.add(w);
      }
    }
    idle(g, 'bobY', 0.35, 2);
  } else if (kind === 'ant') {
    const cols = [1.1, 0, -1.1];
    cols.forEach((x, i) => {
      const seg = new THREE.Mesh(new THREE.SphereGeometry([0.55, 0.45, 0.75][i], 12, 10), M(THREE, 0x3B2A20));
      seg.position.set(x, 1.4, 0); g.add(seg);
    });
    for (const dz of [1, -1]) for (const dx of [0.4, 0, -0.4]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 5), M(THREE, 0x2A1E16));
      leg.position.set(dx, 0.9, dz * 0.5); leg.rotation.x = dz * 0.7; idle(leg, 'sway', 0.15, 4 + dx, 'z'); g.add(leg);
    }
    for (const dz of [0.25, -0.25]) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 5), M(THREE, 0x2A1E16));
      ant.position.set(1.5, 1.9, dz); ant.rotation.z = -0.7; g.add(ant);
    }
  } else if (kind === 'ladybug') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0xE23B2E));
    dome.position.y = 1.2; dome.scale.set(1, 0.9, 1.15); idle(dome, 'breathe', 0.03, 2); g.add(dome);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0x1A1A1A));
    head.position.set(1.2, 1.2, 0); g.add(head);
    const line = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.08), M(THREE, 0x1A1A1A));
    line.position.set(0, 2.1, 0); g.add(line);
    for (let i = 0; i < 6; i++) {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), M(THREE, 0x1A1A1A));
      const a = (i / 6) * Math.PI * 2;
      spot.position.set(Math.cos(a) * 0.7, 1.9, Math.sin(a) * 0.7); g.add(spot);
    }
  } else if (kind === 'dragonfly') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 3.4, 8), M(THREE, 0x2F9E8E, { emissive: 0x0d3a34, emissiveIntensity: 0.3 }));
    body.rotation.z = Math.PI / 2; body.position.y = 2; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0x1FA0B0));
    head.position.set(1.8, 2, 0); g.add(head);
    for (const dx of [0.4, -0.4]) for (const dz of [1, -1]) {
      const w = new THREE.Mesh(new THREE.CircleGeometry(1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xBFE9FF, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
      w.scale.set(1, 0.32, 1); w.position.set(dx, 2.2, dz * 0.9); w.rotation.x = Math.PI / 2; idle(w, 'flap', 0.4, 14, 'z'); g.add(w);
    }
    idle(g, 'bobY', 0.3, 2.5);
  } else if (kind === 'spider') {
    const abd = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 12), M(THREE, 0x3B2E28));
    abd.position.set(-0.6, 1.3, 0); idle(abd, 'breathe', 0.03, 2); g.add(abd);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), M(THREE, 0x2E2420));
    head.position.set(0.9, 1.3, 0); g.add(head);
    for (const dz of [1, -1]) for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 2, 5), M(THREE, 0x241C18));
      leg.position.set(0.6 - i * 0.5, 1.1, dz * 0.7); leg.rotation.x = dz * 1; leg.rotation.z = 0.5 - i * 0.25;
      idle(leg, 'sway', 0.12, 3 + i, 'x'); g.add(leg);
    }
  } else if (kind === 'mantis') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 2.4, 8), M(THREE, 0x6BBE55));
    body.rotation.z = 0.5; body.position.y = 1.8; idle(body, 'breathe', 0.03, 2); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0x7BCE65));
    head.position.set(1, 3, 0); idle(head, 'sway', 0.3, 1.5, 'y'); g.add(head);
    for (const dz of [0.2, -0.2]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), M(THREE, 0x2A2A1A));
      eye.position.set(1.4, 3.1, dz); g.add(eye);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), M(THREE, 0x6BBE55));
      arm.position.set(1.2, 2.1, dz * 2); arm.rotation.z = 1.1; idle(arm, 'sway', 0.2, 2.5, 'z'); g.add(arm);
    }
    for (const dz of [1, -1]) for (const dx of [0.2, -0.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 5), M(THREE, 0x5AAD48));
      leg.position.set(dx, 1, dz * 0.5); leg.rotation.x = dz * 0.8; g.add(leg);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Garden floor.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 30, 48),
    new THREE.MeshStandardMaterial({ color: 0x3E7D3A, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  // Towering grass blades (scale reference — the kid is bug-sized).
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, d = R * (0.5 + Math.random() * 0.9);
    const h = 14 + Math.random() * 16;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.5, h, 4),
      new THREE.MeshStandardMaterial({ color: 0x4EA83E, roughness: 1, flatShading: true }));
    blade.position.set(Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d);
    blade.rotation.z = (Math.random() - 0.5) * 0.3; group.add(blade);
  }
  // Dew drops on the ground.
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.random() * R;
    const dew = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xBFE9FF, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.3 }));
    dew.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); dew.scale.y = 0.6; group.add(dew);
  }
  // Leaf canopy floating overhead.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(16, 6),
      new THREE.MeshStandardMaterial({ color: 0x5EBE4A, transparent: true, opacity: 0.22, side: THREE.DoubleSide, flatShading: true }));
    leaf.position.set(Math.cos(a) * 26, 40, Math.sin(a) * 26); leaf.rotation.x = -Math.PI / 2 + 0.3; group.add(leaf);
  }

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const bug = buildBug(THREE, def.build);
    holder.add(bug);
    const p = ringPosition(i, keys.length, R, 5);
    holder.position.set(p.x, p.y + 2, p.z);
    holder.userData = { key, def, focusRadius: 7, bobPhase: Math.random() * 6, baseY: p.y + 2,
      anims: collectIdle(bug), glow: bug.userData.glow || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.2;
      m.position.y = m.userData.baseY + Math.sin(t * 0.7 + m.userData.bobPhase) * 0.5;
      runIdle(m.userData.anims, t);
      if (m.userData.glow) {
        const s = 0.6 + (Math.sin(t * 5 + m.userData.bobPhase) * 0.5 + 0.5) * 0.9;
        m.userData.glow.scale.setScalar(0.7 + s * 0.5);
      }
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'bugs',
  name: 'Bugs & Insects',
  icon: '🐝',
  blurb: 'Buzz through the garden with bees, ants, and eight-legged surprises.',
  unlockCost: 112,
  category: 'Nature & Life',
  theme: { primary: 0x9BCF3C, secondary: 0xE3B23C, bg: 0x0c1608, light: 0xEAF7C8, ambient: 0x3d5a2a },
  masterTitle: 'Bug Master 🐝',
  subjects: SUBJECTS,
  build,
};
