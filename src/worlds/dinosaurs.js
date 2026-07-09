import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 6 — Dinosaurs. Eight prehistoric subjects (7 dinosaurs + the asteroid
 * extinction event) scattered across a low-poly prehistoric landscape with
 * rolling hills and a smoking volcano in the background. Same content shape as
 * the other worlds; the asteroid is a special glowing object, not a creature.
 */

const SUBJECTS = {
  trex: {
    name: 'T-Rex', type: 'Dinosaur · King Predator', emoji: '🦖', badge: 'Rex Wrangler', build: 'trex',
    mission: '🦖 The mighty T-Rex had a bite strong enough to crush a car. Ready to meet the king of dinosaurs?',
    stats: [['Bite', 'Could crush a car'], ['Tiny arms', 'But a huge head'], ['12 m', 'Length'], ['Smell', 'Superb sense']],
    facts: ['🦖 Tyrannosaurus Rex was one of the largest meat-eating dinosaurs ever.', '💥 Its bite was strong enough to crush a car — the most powerful bite of any land animal known.', '🦾 It had surprisingly tiny arms, but a massive head with banana-sized teeth.', '👃 It had a brilliant sense of smell to sniff out its next meal from far away.'],
    fun: 'A single T-Rex tooth could be over 20 cm long — about the size of a banana — and it had around 60 of them!',
    quiz: [
      ['How strong was a T-Rex\'s bite?', ['Strong enough to crush a car', 'Weaker than yours', 'Just enough for leaves', 'It had no teeth'], 0],
      { t: 'tf', q: 'T-Rex had very tiny arms.', answer: true },
      { t: 'pic', q: 'Which tooth shape belongs to a meat-eater like T-Rex?', options: [
        { shape: 'triangle', color: '#EDE6D0', label: 'Sharp' }, { shape: 'square', color: '#EDE6D0', label: 'Flat' }, { shape: 'circle', color: '#EDE6D0', label: 'Round' }], answer: 0 },
    ],
    quizHard: [
      ['T-Rex had tiny arms but a giant head. Which part did most of its hunting?', ['Its powerful jaws', 'Its little arms', 'Its tail', 'Its feet only'], 0],
      { t: 'tf', q: 'A superb sense of smell would help a hunter like T-Rex find food from far away.', answer: true },
      ['Its teeth were huge and pointed, not flat. What does that tell us about its diet?', ['It ate meat', 'It ate only leaves', 'It ate sand', 'It didn\'t eat'], 0],
    ],
  },
  triceratops: {
    name: 'Triceratops', type: 'Dinosaur · Horned Giant', emoji: '🦕', badge: 'Horn Hero', build: 'triceratops',
    mission: '🦕 Triceratops had three sharp horns and a giant bony frill. Ready to meet the dino with its own armour?',
    stats: [['3 horns', 'On its face'], ['Frill', 'Bony neck shield'], ['Plants', 'Its food'], ['Herd', 'Lived in groups']],
    facts: ['🦕 Triceratops had three horns on its face and a huge bony frill behind its head.', '🌿 It was a plant-eater, about the size of an elephant.', '🛡️ It used its horns to defend itself against predators like T-Rex.', '🐘 The frill may have protected its neck and helped it show off to other dinosaurs.'],
    fun: 'Triceratops means "three-horned face" — its skull, including the frill, could be over 2 metres long!',
    quiz: [
      ['How many horns did Triceratops have?', ['Three', 'One', 'Ten', 'None'], 0],
      { t: 'tf', q: 'Triceratops was a plant-eater.', answer: true },
      { t: 'pic', q: 'Which shape matches a Triceratops horn?', options: [
        { shape: 'triangle', color: '#C9A46B', label: 'Horn' }, { shape: 'circle', color: '#C9A46B', label: 'Ball' }, { shape: 'square', color: '#C9A46B', label: 'Block' }], answer: 0 },
    ],
    quizHard: [
      ['Triceratops ate plants but had sharp horns. What were the horns mainly for?', ['Defending against predators', 'Eating leaves', 'Digging holes', 'Flying'], 0],
      { t: 'tf', q: 'Living in a herd would help Triceratops stay safer from hunters like T-Rex.', answer: true },
      ['A big bony frill sat over its neck. What handy job could that frill do?', ['Shield its neck from bites', 'Help it swim', 'Let it fly', 'Store water'], 0],
    ],
  },
  velociraptor: {
    name: 'Velociraptor', type: 'Dinosaur · Clever Hunter', emoji: '🦖', badge: 'Raptor Ranger', build: 'raptor',
    mission: '🦖 The real Velociraptor was turkey-sized, feathered and fast — a clever little hunter. Ready to explore?',
    stats: [['Turkey-sized', 'Smaller than films'], ['Feathers', 'It had them'], ['Sickle claw', 'On each foot'], ['Fast', 'Speedy & clever']],
    facts: ['🦖 The real Velociraptor was much smaller than in movies — about the size of a turkey.', '🪶 It had feathers, just like a bird!', '🦶 Each foot had a big curved "sickle" claw for hunting.', '🧠 It was fast and clever, and may have hunted in packs.'],
    fun: 'The real Velociraptor was only about the size of a turkey — and covered in feathers, not scaly skin!',
    quiz: [
      ['How big was a real Velociraptor?', ['About the size of a turkey', 'As big as a bus', 'As tall as a house', 'Tiny as an ant'], 0],
      { t: 'tf', q: 'Velociraptors had feathers.', answer: true },
      { t: 'pic', q: 'Which shape matches a raptor\'s curved claw?', options: [
        { shape: 'crescent', color: '#3B3B44', label: 'Curved' }, { shape: 'square', color: '#3B3B44', label: 'Straight' }, { shape: 'circle', color: '#3B3B44', label: 'Round' }], answer: 0 },
    ],
    quizHard: [
      ['Velociraptors had feathers, like birds. What does that hint about where birds came from?', ['Birds are related to dinosaurs', 'Birds came from fish', 'Birds are plants', 'Birds came from rocks'], 0],
      { t: 'tf', q: 'Hunting in a pack could help small raptors bring down prey bigger than themselves.', answer: true },
      ['A raptor was small but fast. How does being small and quick help a hunter?', ['It can dart and turn to catch prey', 'It makes it slow', 'It scares nobody', 'It needs no food'], 0],
    ],
  },
  brachiosaurus: {
    name: 'Brachiosaurus', type: 'Dinosaur · Gentle Giant', emoji: '🦕', badge: 'Long-Neck Legend', build: 'brachio',
    mission: '🦕 Brachiosaurus was as tall as a four-storey building, with a neck to reach the treetops. Ready to look up?',
    stats: [['Treetops', 'Its neck reached'], ['Long neck', 'Its trademark'], ['Plants', 'Its food'], ['4 storeys', 'Its height']],
    facts: ['🦕 Brachiosaurus was one of the tallest dinosaurs — as tall as a four-storey building.', '🌳 Its super-long neck let it reach leaves at the tops of trees other dinosaurs couldn\'t.', '🍃 It was a gentle giant that ate only plants.', '🦵 Unusually, its front legs were longer than its back legs.'],
    fun: 'Brachiosaurus could hold its head about 12 metres up — high enough to peek over a four-storey building!',
    quiz: [
      ['Why did Brachiosaurus have such a long neck?', ['To reach leaves high in the trees', 'To swim faster', 'To dig holes', 'To fight'], 0],
      { t: 'tf', q: 'Brachiosaurus was a meat-eater.', answer: false },
      { t: 'pic', q: 'Which shape matches a very tall, long-necked dino?', options: [
        { shape: 'tall', color: '#7FA05E', label: 'Tall' }, { shape: 'circle', color: '#7FA05E', label: 'Round' }, { shape: 'square', color: '#7FA05E', label: 'Blocky' }], answer: 0 },
    ],
    quizHard: [
      ['A long neck let Brachiosaurus reach food other dinosaurs couldn\'t. Why is that an advantage?', ['Less competition for its food', 'It made it slower', 'It got cold', 'It scared trees'], 0],
      { t: 'tf', q: 'Because it was so huge, Brachiosaurus had to eat enormous amounts of plants every day.', answer: true },
      ['Its front legs were longer than its back legs. How would that help it?', ['It could hold its neck up higher to reach leaves', 'It could run backwards', 'It could fly', 'It could swim'], 0],
    ],
  },
  stegosaurus: {
    name: 'Stegosaurus', type: 'Dinosaur · Plated Grazer', emoji: '🦕', badge: 'Plate Protector', build: 'stego',
    mission: '🦕 Stegosaurus had a row of plates on its back and a spiky tail for defence. Ready to meet the armoured grazer?',
    stats: [['Plates', 'Row on its back'], ['Spikes', 'On its tail'], ['Walnut', 'Brain size'], ['Plants', 'Its food']],
    facts: ['🦕 Stegosaurus had a row of big bony plates standing up along its back.', '⚔️ Its tail had sharp spikes to swing at attackers.', '🌿 It was a plant-eater about the size of a bus.', '🥜 It had a surprisingly tiny brain — roughly the size of a walnut.'],
    fun: 'Stegosaurus was as big as a bus but had a brain only about the size of a walnut!',
    quiz: [
      ['What did Stegosaurus have along its back?', ['A row of bony plates', 'Feathers', 'A sail of skin', 'Nothing'], 0],
      { t: 'tf', q: 'Stegosaurus had a spiky tail to defend itself.', answer: true },
      { t: 'pic', q: 'Which shape matches a Stegosaurus back plate?', options: [
        { shape: 'diamond', color: '#B5763E', label: 'Plate' }, { shape: 'circle', color: '#B5763E', label: 'Ball' }, { shape: 'square', color: '#B5763E', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Stegosaurus was huge but had a walnut-sized brain. What does that suggest it relied on?', ['Instinct more than clever thinking', 'Reading books', 'Doing maths', 'Talking'], 0],
      { t: 'tf', q: 'A spiky tail is only useful for defence if a predator gets close enough to be hit.', answer: true },
      ['Its big back plates may have soaked up sunlight. How could that help a cold-blooded animal?', ['Warm up its body', 'Cool it down forever', 'Help it fly', 'Feed it'], 0],
    ],
  },
  pterodactyl: {
    name: 'Pterodactyl', type: 'Prehistoric · Sky Reptile', emoji: '🦅', badge: 'Sky Reptile', build: 'ptero',
    mission: '🦅 The Pterodactyl ruled the skies on wings of skin while dinosaurs walked below. Ready to take flight?',
    stats: [['Flew', 'Ruled the skies'], ['Skin wings', 'Not feathers'], ['Hollow bones', 'Light for flight'], ['Reptile', 'A flying one']],
    facts: ['🦅 Pterosaurs like Pterodactyl were flying reptiles that lived alongside the dinosaurs.', '🪂 Their wings were skin stretched over one very long finger — not feathers.', '🦴 Hollow, lightweight bones helped them get airborne.', '🐟 They swooped down to snatch fish and small animals.'],
    fun: 'Some later pterosaurs were as tall as a giraffe with wings wider than a small plane — the biggest flyers ever!',
    quiz: [
      ['What were a pterosaur\'s wings made of?', ['Skin', 'Feathers', 'Metal', 'Leaves'], 0],
      { t: 'tf', q: 'Pterosaurs could fly.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a pterosaur gliding?', options: [
        { shape: 'triangle', color: '#8A6A45', label: 'Wings' }, { shape: 'circle', color: '#8A6A45', label: 'Ball' }, { shape: 'square', color: '#8A6A45', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Pterosaurs had hollow, lightweight bones. Why is that helpful for a flyer?', ['Lighter bones make flying easier', 'Heavy bones fly better', 'Bones keep it warm', 'It has no bones'], 0],
      { t: 'tf', q: 'Pterosaurs lived at the same time as the dinosaurs, sharing their world.', answer: true },
      ['Their wings were skin over one long finger. That makes a pterosaur wing different from a bird\'s wing, which uses what?', ['Feathers', 'Skin only', 'Scales', 'Fur'], 0],
    ],
  },
  ankylosaurus: {
    name: 'Ankylosaurus', type: 'Dinosaur · Living Tank', emoji: '🦕', badge: 'Tank Commander', build: 'anky',
    mission: '🦕 The Ankylosaurus was a living tank, armoured head to tail with a club to swing. Ready to explore?',
    stats: [['Armour', 'Bony plates'], ['Club tail', 'A heavy hammer'], ['Tank', 'Its nickname'], ['Plants', 'Its food']],
    facts: ['🦕 Ankylosaurus was covered in thick bony plates like armour — even on its eyelids!', '🔨 It had a heavy club of bone at the end of its tail to swing at attackers.', '🌿 It was a low, wide plant-eater — like a living tank.', '🦖 Even a T-Rex would struggle to bite through its armour.'],
    fun: 'Ankylosaurus could swing its bony tail club hard enough to break the leg bones of an attacking predator!',
    quiz: [
      ['What was special about Ankylosaurus\'s tail?', ['It ended in a heavy bony club', 'It was feathered', 'It could grab things', 'It glowed'], 0],
      { t: 'tf', q: 'Ankylosaurus was covered in bony armour.', answer: true },
      { t: 'pic', q: 'Which shape matches its heavy round tail club?', options: [
        { shape: 'circle', color: '#8C7A5A', label: 'Club' }, { shape: 'star', color: '#8C7A5A', label: 'Spiky' }, { shape: 'triangle', color: '#8C7A5A', label: 'Point' }], answer: 0 },
    ],
    quizHard: [
      ['Ankylosaurus had both armour and a club tail. What was the main purpose of both?', ['Defence against predators', 'Catching prey', 'Flying', 'Swimming fast'], 0],
      { t: 'tf', q: 'Because it ate plants, Ankylosaurus\'s armour and club were for protection, not hunting.', answer: true },
      ['It was low and very wide. How would that shape help against a big attacker?', ['Hard to flip over or bite underneath', 'Easy to knock down', 'Good for flying', 'Good for climbing'], 0],
    ],
  },
  asteroid: {
    name: 'Asteroid Impact', type: 'Event · The Great Extinction', emoji: '☄️', badge: 'Mystery Solver', build: 'asteroid',
    mission: '☄️ 66 million years ago, a city-sized asteroid changed life on Earth forever. Ready to uncover the mystery?',
    stats: [['66 M yrs', 'Years ago'], ['City-sized', 'The asteroid'], ['Dust', 'Blocked the Sun'], ['Birds', 'Dinos that survived']],
    facts: ['☄️ About 66 million years ago a huge, city-sized asteroid crashed into Earth.', '🌑 The impact threw up so much dust it blocked the Sun and cooled the whole planet.', '🌿 Plants struggled without sunlight, and the giant dinosaurs died out.', '🐦 But small feathered dinosaurs survived — and became today\'s birds!'],
    fun: 'Every bird alive today — from tiny sparrows to giant ostriches — is a living dinosaur that survived the asteroid!',
    quiz: [
      ['What blocked the Sun after the asteroid struck?', ['Dust thrown into the sky', 'Rain', 'Snow', 'Leaves'], 0],
      { t: 'tf', q: 'Every single dinosaur died out, leaving none behind.', answer: false },
      { t: 'pic', q: 'Which came from space and struck the Earth?', options: [
        { shape: 'circle', color: '#7A7266', label: 'Asteroid' }, { shape: 'star', color: '#6BCB77', label: 'Leaf' }, { shape: 'drop', color: '#4BA6E8', label: 'Raindrop' }], answer: 0 },
    ],
    quizHard: [
      ['Dust blocked the Sun, so plants died. Why would that also doom the giant plant-eating dinosaurs?', ['No plants meant no food for them', 'They got too warm', 'They flew away', 'They turned into birds instantly'], 0],
      { t: 'tf', q: 'Since birds are the survivors of the dinosaurs, dinosaurs never fully disappeared.', answer: true },
      ['The dust cooled the whole planet. What does that tell you the Sun normally does for Earth?', ['Keeps it warm and lit', 'Makes it colder', 'Blocks dust', 'Does nothing'], 0],
    ],
  },
};

/* ---------------- procedural dinosaurs ---------------- */
const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.03, flatShading: true, ...o });

function legs(THREE, g, color, size, spots) {
  for (const [dx, dz] of spots) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * size, 0.34 * size, 1.6 * size, 7), M(THREE, color));
    leg.position.set(dx * size, 0.7 * size, dz * size); g.add(leg);
  }
}

function buildDino(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'trex' || kind === 'raptor') {
    const big = kind === 'trex';
    const col = big ? 0x6E7A4B : 0x8A6E3E;
    const s = big ? 1 : 0.55;
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 12, 10), M(THREE, col));
    body.scale.set(1.7, 1, 0.9); body.position.y = 2.2 * s; body.rotation.z = 0.2; idle(body, 'breathe', 0.04, 2.5); g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.8 * s, 1.1 * s, 1 * s), M(THREE, col));
    head.position.set(2.4 * s, 3 * s, 0); g.add(head);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.6 * s, 0.4 * s, 0.9 * s), M(THREE, 0x50421f));
    jaw.position.set(2.5 * s, 2.5 * s, 0); idle(jaw, 'flap', 0.12, 1.5, 'z'); g.add(jaw);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.7 * s, 4 * s, 6), M(THREE, col));
    tail.position.set(-3 * s, 2.2 * s, 0); tail.rotation.z = Math.PI / 2; idle(tail, 'sway', 0.2, 2, 'x'); g.add(tail);
    for (const dz of [0.6, -0.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * s, 0.5 * s, 2.4 * s, 8), M(THREE, col));
      leg.position.set(0, 1.1 * s, dz * s); g.add(leg);
    }
    if (kind === 'raptor') { // feather crest hint
      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 5), M(THREE, 0xB5622E));
      crest.position.set(-2.6 * s, 2.8 * s, 0); crest.rotation.z = -0.6; g.add(crest);
    }
  } else if (kind === 'triceratops' || kind === 'stego' || kind === 'anky' || kind === 'brachio') {
    const col = { triceratops: 0xA98A55, stego: 0x8A6A3E, anky: 0x7C7154, brachio: 0x7FA05E }[kind];
    const size = kind === 'brachio' ? 1.3 : 1;
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.7 * size, 14, 10), M(THREE, col));
    body.scale.set(1.8, 1, 1); body.position.y = 1.9 * size; idle(body, 'breathe', 0.03, 2); g.add(body);
    legs(THREE, g, col, size, [[1.4, 0.7], [1.4, -0.7], [-1.3, 0.7], [-1.3, -0.7]]);
    if (kind === 'brachio') {
      let prev = 2.6; // stacked neck
      for (let i = 0; i < 5; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.5 - i * 0.05, 0.6 - i * 0.05, 1.2, 8), M(THREE, col));
        seg.position.set(2.4 + i * 0.5, prev, 0); seg.rotation.z = -0.5; prev += 0.9; g.add(seg);
      }
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), M(THREE, col));
      head.position.set(5.4, prev, 0); g.add(head);
    } else {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.9 * size, 12, 10), M(THREE, col));
      head.position.set(3 * size, 2.4 * size, 0); g.add(head);
    }
    if (kind === 'triceratops') {
      const frill = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20), M(THREE, 0x967645, { side: THREE.DoubleSide }));
      frill.position.set(2.4, 2.8, 0); frill.rotation.y = Math.PI / 2; g.add(frill);
      for (const [y, len] of [[3.4, 1.2], [2.6, 1], [2.6, 1]]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, len, 6), M(THREE, 0xE9DFC4));
        horn.position.set(4 * size, y, 0); horn.rotation.z = -1; g.add(horn);
      }
    }
    if (kind === 'stego') {
      for (let i = 0; i < 6; i++) {
        const plate = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), M(THREE, 0xB5763E));
        plate.position.set(1.6 - i * 0.7, 3.4, 0); plate.rotation.y = Math.PI / 4; g.add(plate);
      }
      const spike1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1, 6), M(THREE, 0xE9DFC4));
      spike1.position.set(-3, 2.4, 0.3); spike1.rotation.z = 1.6; g.add(spike1);
    }
    if (kind === 'anky') {
      for (let i = 0; i < 6; i++) {
        const plate = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 0), M(THREE, 0x8C7A5A, { flatShading: true }));
        plate.position.set((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 1.4); g.add(plate);
      }
      const club = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), M(THREE, 0x6E5E44));
      club.position.set(-3.4, 1.9, 0); idle(club, 'sway', 0.3, 2, 'x'); g.add(club);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 6), M(THREE, col));
      tail.position.set(-2.6, 1.9, 0); tail.rotation.z = Math.PI / 2; g.add(tail);
    }
    if (kind !== 'anky') {
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.6 * size, 3.5 * size, 6), M(THREE, col));
      tail.position.set(-3 * size, 1.9 * size, 0); tail.rotation.z = Math.PI / 2; idle(tail, 'sway', 0.18, 1.6, 'x'); g.add(tail);
    }
  } else if (kind === 'ptero') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), M(THREE, 0x8A6A45));
    body.scale.set(1, 1.3, 1); body.position.y = 2.6; idle(body, 'breathe', 0.04, 2); g.add(body);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 6), M(THREE, 0xB59560));
    beak.position.set(0, 3.4, 0.6); beak.rotation.x = 1.2; g.add(beak);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 5), M(THREE, 0xC46A4A));
    crest.position.set(0, 3.7, -0.2); crest.rotation.x = -0.4; g.add(crest);
    for (const dx of [1, -1]) {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.6, 4), M(THREE, 0x7A5A38, { side: THREE.DoubleSide }));
      wing.position.set(dx * 2, 2.6, 0); wing.rotation.z = dx * Math.PI / 2; wing.scale.set(1, 1, 0.25);
      idle(wing, 'flap', 0.45, 4, 'x'); g.add(wing);
    }
    idle(g, 'bobY', 0.4, 2);
  } else if (kind === 'asteroid') {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 0),
      M(THREE, 0x7A7266, { emissive: 0xFF6A2B, emissiveIntensity: 0.4, flatShading: true }));
    rock.position.y = 3; idle(rock, 'breathe', 0.05, 3); g.add(rock);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xFF8C1A, transparent: true, opacity: 0.22, side: THREE.BackSide }));
    glow.position.y = 3; g.add(glow);
    const trail = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xFFB84D, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    trail.position.set(2.4, 5.4, 0); trail.rotation.z = -0.9; g.add(trail);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Prehistoric ground.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 40, 48),
    new THREE.MeshStandardMaterial({ color: 0x5C6B3A, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  // Rolling low-poly hills.
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, d = R + 22 + Math.random() * 30;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(6 + Math.random() * 6, 5 + Math.random() * 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x4E5B32, roughness: 1, flatShading: true }));
    hill.position.set(Math.cos(a) * d, 1, Math.sin(a) * d); group.add(hill);
  }

  // Smoking volcano in the background.
  const volcano = new THREE.Mesh(new THREE.ConeGeometry(18, 26, 7, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x4A3A2E, roughness: 1, flatShading: true }));
  volcano.position.set(-30, 12, -90); group.add(volcano);
  const lava = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: 0xFF6A2B }));
  lava.position.set(-30, 25, -90); group.add(lava);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x8A7C70, transparent: true, opacity: 0.35 }));
  smoke.position.set(-30, 34, -90); group.add(smoke);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const dino = buildDino(THREE, def.build);
    holder.add(dino);
    const p = ringPosition(i, keys.length, R, 4);
    holder.position.set(p.x, p.y, p.z);
    holder.userData = { key, def, focusRadius: 8, phase: Math.random() * 6, bobPhase: Math.random() * 6, baseY: p.y,
      anims: collectIdle(dino) };
    attachMarker(THREE, holder, isDone(key), 6.4);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    lava.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
    smoke.position.y = 34 + Math.sin(t * 0.6) * 1.5;
    smoke.material.opacity = 0.3 + Math.sin(t * 0.8) * 0.08;
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.15;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 122 } };
}

export default {
  key: 'dinosaurs',
  name: 'Dinosaurs',
  icon: '🦖',
  blurb: 'T-Rex, Triceratops & the giants of the ancient world.',
  unlockCost: 84,
  theme: { primary: 0x8BBE3D, secondary: 0x9A6A2F, bg: 0x14170a, light: 0xF0E4B0, ambient: 0x44502a },
  masterTitle: 'Dino Master 🦖',
  subjects: SUBJECTS,
  build,
};
