import { attachMarker, updateMarkers, ringPosition } from './helpers.js';

/**
 * World 20 — Machines & Inventions. A warm "workshop" version of Digital
 * World's blueprint look (amber wireframe instead of cyan). Each invention is
 * built as an exploded diagram whose parts fly together and ASSEMBLE when the
 * subject is tapped, using the engine's onSelect hook. Subject list per the
 * dedupe note: Internet & Robots stay in Digital World; here we have Printing
 * Press, Steam Engine and Telephone instead.
 */

const AMBER = 0xF2A93B;
const M = (THREE, c = AMBER, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.35, emissive: c, emissiveIntensity: 0.2, flatShading: true, ...o });

const SUBJECTS = {
  wheel: {
    name: 'The Wheel', type: 'Invention · Gets Things Rolling', emoji: '🛞', badge: 'Wheel Wizard', build: 'wheel',
    mission: '🛞 The wheel is one of the oldest and greatest inventions ever. Ready to get things rolling?',
    stats: [['~5,500 yrs', 'Old invention'], ['Rolls', 'Moves heavy loads'], ['Axle', 'Wheel spins on it'], ['Everywhere', 'Cars to clocks']],
    facts: ['🛞 The wheel is one of humanity\'s oldest and most important inventions, from over 5,000 years ago.', '🌀 A wheel turns on a rod called an axle, letting it roll smoothly.', '💪 Rolling needs far less effort than dragging, so wheels move heavy loads easily.', '⏰ Wheels are everywhere — cars, bikes, trains, and even inside clocks and machines.'],
    fun: 'The wheel was invented for making pottery FIRST — people spun clay on it before they ever put wheels on carts!',
    quiz: [
      ['Why is the wheel so useful?', ['Rolling moves heavy loads easily', 'It looks nice', 'It floats', 'It glows'], 0],
      { t: 'tf', q: 'A wheel turns on a rod called an axle.', answer: true },
      { t: 'pic', q: 'Which shape is a wheel?', options: [
        { shape: 'circle', color: '#F2A93B', label: 'Round' }, { shape: 'square', color: '#F2A93B', label: 'Square' }, { shape: 'triangle', color: '#F2A93B', label: 'Triangle' }], answer: 0 },
    ],
    quizHard: [
      ['Rolling a load needs far less effort than dragging it. Why does the wheel make moving easier?', ['It cuts down the rubbing (friction)', 'It makes things lighter', 'It adds an engine', 'It removes gravity'], 0],
      { t: 'tf', q: 'Wheels are used not just on vehicles but inside machines and clocks too.', answer: true },
      ['A wheel needs an axle to spin on. What would happen to a wheel with no axle?', ['It couldn\'t spin in place to roll a cart', 'It would roll better', 'It would fly', 'Nothing changes'], 0],
    ],
  },
  electricity: {
    name: 'Electricity', type: 'Invention · Power on Tap', emoji: '⚡', badge: 'Power Pioneer', build: 'electricity',
    mission: '⚡ Flip a switch and electricity lights up your world in an instant. Ready to power up?',
    stats: [['Flow', 'Of tiny charges'], ['Power stations', 'Make it'], ['Wires', 'Carry it'], ['Instant', 'Travels super fast']],
    facts: ['⚡ Electricity is a flow of tiny charged particles, usually through metal wires.', '🏭 Power stations generate it, and wires carry it to homes, schools and shops.', '💡 It powers lights, phones, computers and most modern machines.', '🚀 Electricity travels incredibly fast — flip a switch and the light comes on instantly!'],
    fun: 'Electricity travels through wires nearly as fast as light — which is why a light comes on the instant you flip the switch!',
    quiz: [
      ['What is electricity?', ['A flow of tiny charges', 'A kind of rock', 'A sort of cloud', 'A wheel'], 0],
      { t: 'tf', q: 'Wires carry electricity to our homes.', answer: true },
      { t: 'pic', q: 'Which symbol means electricity?', options: [
        { shape: 'triangle', color: '#F6E15A', label: 'Lightning bolt' }, { shape: 'circle', color: '#4BA6E8', label: 'Water drop' }, { shape: 'square', color: '#6BCB77', label: 'Leaf' }], answer: 0 },
    ],
    quizHard: [
      ['Power stations make electricity and wires carry it to your home. What is that whole system called?', ['A power grid or network', 'A wheel', 'A river', 'A cloud'], 0],
      { t: 'tf', q: 'Because electricity travels so fast, a switched-on light seems to come on instantly.', answer: true },
      ['Most modern machines need electricity. What would stop working in a power cut?', ['Lights, computers and many machines', 'The Sun', 'The wind', 'Nothing at all'], 0],
    ],
  },
  printingpress: {
    name: 'Printing Press', type: 'Invention · Spreading Ideas', emoji: '📚', badge: 'Print Pioneer', build: 'press',
    mission: '📚 Before the printing press, every book was copied by hand! Ready to see the machine that spread reading?',
    stats: [['~1440', 'Gutenberg\'s press'], ['Copies', 'Many books fast'], ['Movable type', 'Reusable letters'], ['Spread ideas', 'To everyone']],
    facts: ['📚 Before the printing press, every book had to be copied out slowly by hand.', '🖨️ Around 1440, Johannes Gutenberg built a press that could print pages quickly.', '🔤 It used little metal letters (movable type) arranged and inked to stamp pages.', '🌍 Suddenly books were cheaper, so reading and ideas spread to many more people.'],
    fun: 'Before the printing press, copying one book by hand could take a person over a YEAR — the press could print many in days!',
    quiz: [
      ['What did the printing press do?', ['Print books and pages quickly', 'Cook food', 'Fly in the air', 'Tell the time'], 0],
      { t: 'tf', q: 'Before the printing press, books were copied by hand.', answer: true },
      { t: 'pic', q: 'What does a printing press make lots of?', options: [
        { shape: 'square', color: '#E8DFC8', label: 'Printed pages' }, { shape: 'circle', color: '#4BA6E8', label: 'Water' }, { shape: 'triangle', color: '#6BCB77', label: 'Leaves' }], answer: 0 },
    ],
    quizHard: [
      ['The press made books cheap and fast. How did that change the world?', ['Reading and ideas spread to many more people', 'Books disappeared', 'People stopped reading', 'Nothing changed'], 0],
      { t: 'tf', q: 'Movable type meant the same metal letters could be rearranged to print any page.', answer: true },
      ['Copying a book by hand took about a year; the press printed many in days. What does that show?', ['Machines can do slow jobs far faster', 'Hands are faster', 'Books are magic', 'Presses are slow'], 0],
    ],
  },
  airplanes: {
    name: 'Airplanes', type: 'Invention · Taking Flight', emoji: '✈️', badge: 'Flight Pioneer', build: 'plane',
    mission: '✈️ Airplanes let people soar through the sky and cross the world in hours. Ready for takeoff?',
    stats: [['1903', 'Wright brothers'], ['Wings', 'Give lift'], ['Engines', 'Push it forward'], ['Fast travel', 'Across the world']],
    facts: ['✈️ Airplanes fly using wings that create an upward force called lift.', '🕊️ The first powered flight was by the Wright brothers in 1903 — and lasted just 12 seconds!', '🚀 Engines push the plane forward fast enough for the wings to lift it.', '🌍 Today planes carry people across the whole world in just hours.'],
    fun: 'The Wright brothers\' first flight in 1903 was shorter than the wingspan of a modern jumbo jet!',
    quiz: [
      ['What gives an airplane lift?', ['Its wings', 'Its wheels', 'Its paint', 'Its seats'], 0],
      { t: 'tf', q: 'The first powered flight was by the Wright brothers.', answer: true },
      { t: 'pic', q: 'Which shape gives a plane lift?', options: [
        { shape: 'triangle', color: '#B0B8C4', label: 'Wings' }, { shape: 'circle', color: '#B0B8C4', label: 'Ball' }, { shape: 'square', color: '#B0B8C4', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Wings give lift and engines give speed. Why does a plane need both to fly?', ['It must move fast for the wings to lift it', 'Wings are just for show', 'Engines make it heavier only', 'It doesn\'t need either'], 0],
      { t: 'tf', q: 'The first flight lasted only 12 seconds, yet it changed travel forever.', answer: true },
      ['Planes cross the world in hours. Before planes, that journey took what?', ['Weeks or months by ship', 'A few minutes', 'No time at all', 'One second'], 0],
    ],
  },
  rockets: {
    name: 'Rockets', type: 'Invention · Reaching Space', emoji: '🚀', badge: 'Rocket Pioneer', build: 'rocket',
    mission: '🚀 A rocket is powerful enough to escape Earth\'s gravity and reach space! Ready to blast off?',
    stats: [['Escape gravity', 'Reaches space'], ['Push down', 'To go up'], ['Fuel', 'Burns lots'], ['Stages', 'Drop off empty parts']],
    facts: ['🚀 A rocket is the only vehicle powerful enough to escape Earth\'s gravity and reach space.', '⬇️ It works by pushing hot gas downward, which pushes the rocket up.', '🔥 Rockets burn enormous amounts of fuel very fast.', '🪜 Big rockets come in stages that drop off once empty to save weight.'],
    fun: 'A big rocket can burn several tonnes of fuel every SECOND at liftoff — that\'s how it lifts its huge weight!',
    quiz: [
      ['How does a rocket move upward?', ['It pushes gas down, which pushes it up', 'It flaps wings', 'It rolls uphill', 'It floats like a balloon'], 0],
      { t: 'tf', q: 'Rockets are powerful enough to reach space.', answer: true },
      { t: 'pic', q: 'Which shape matches a rocket?', options: [
        { shape: 'tall', color: '#DDE4EC', label: 'Tall & pointed' }, { shape: 'circle', color: '#DDE4EC', label: 'Round' }, { shape: 'square', color: '#DDE4EC', label: 'Boxy' }], answer: 0 },
    ],
    quizHard: [
      ['A rocket pushes gas down and rises up. What rule of motion is that?', ['Every push has an equal push back', 'Things fall up', 'Gas is magic', 'Rockets have no fuel'], 0],
      { t: 'tf', q: 'Dropping empty stages makes a rocket lighter, so it can keep speeding up.', answer: true },
      ['A rocket burns tonnes of fuel each second at liftoff. Why so much at the start?', ['It needs huge force to lift its weight and escape gravity', 'To make noise', 'To look bright', 'To waste fuel'], 0],
    ],
  },
  simplemachines: {
    name: 'Simple Machines', type: 'Invention · Work Made Easy', emoji: '⚙️', badge: 'Gear Genius', build: 'simple',
    mission: '⚙️ Levers, ramps, and pulleys are simple machines that make hard jobs easy. Ready to gain some power?',
    stats: [['Easier work', 'Their job'], ['Lever', 'See-saw tool'], ['Pulley', 'Lifts with rope'], ['Ramp', 'Slope to climb']],
    facts: ['⚙️ Simple machines are basic tools that make work easier by changing how we use force.', '🛝 A lever, like a see-saw, helps lift heavy things with a small push.', '🪝 A pulley uses a wheel and rope to lift loads more easily.', '📐 A ramp lets you move things up a slope instead of straight up.'],
    fun: '"Give me a long enough lever," said an ancient scientist, "and I could lift the whole Earth" — that\'s lever power!',
    quiz: [
      ['What do simple machines do?', ['Make work easier', 'Make work harder', 'Cook food', 'Play music'], 0],
      { t: 'tf', q: 'A lever can help lift heavy things with a small push.', answer: true },
      { t: 'pic', q: 'Which shape is a ramp?', options: [
        { shape: 'triangle', color: '#F2A93B', label: 'Slope' }, { shape: 'circle', color: '#F2A93B', label: 'Ball' }, { shape: 'square', color: '#F2A93B', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['A ramp lets you push a load up a gentle slope instead of lifting it straight up. Why is that easier?', ['You use less force over a longer distance', 'It removes the weight', 'It adds an engine', 'It uses magic'], 0],
      { t: 'tf', q: 'A long lever lets a small push move a very heavy load.', answer: true },
      ['A pulley uses a wheel and rope to lift a load. What simple machine is hidden inside a pulley?', ['A wheel', 'A ramp', 'A screw', 'A magnet'], 0],
    ],
  },
  steamengine: {
    name: 'Steam Engine', type: 'Invention · Power from Steam', emoji: '🚂', badge: 'Steam Chief', build: 'steam',
    mission: '🚂 The steam engine turned boiling water into power that changed the world. Ready to build up steam?',
    stats: [['Steam', 'Pushes pistons'], ['Fuel', 'Coal/wood burned'], ['Trains', 'It powered'], ['Factories', 'Ran on it']],
    facts: ['🚂 A steam engine burns fuel to boil water into steam, and the steam\'s push moves parts to do work.', '🏭 It powered the first trains and factory machines, sparking the Industrial Revolution.', '💪 Before it, machines relied on muscle, wind or water.', '🌍 Steam engines let people build, travel and make things faster than ever before.'],
    fun: 'Early steam trains scared some people so much they believed 30 km/h might make it hard to breathe — they were fine!',
    quiz: [
      ['What does a steam engine use to move its parts?', ['Steam', 'Ice', 'Wind only', 'Sunlight only'], 0],
      { t: 'tf', q: 'Steam engines powered the first trains.', answer: true },
      { t: 'pic', q: 'What does a steam engine boil to make steam?', options: [
        { shape: 'drop', color: '#4BA6E8', label: 'Water' }, { shape: 'circle', color: '#8A5A34', label: 'Rock' }, { shape: 'square', color: '#6BCB77', label: 'Leaf' }], answer: 0 },
    ],
    quizHard: [
      ['A steam engine goes fuel → boil water → steam → moving parts. What is it really turning heat into?', ['Movement (work)', 'Cold', 'Light only', 'Sound only'], 0],
      { t: 'tf', q: 'Before steam engines, machines mostly relied on muscle, wind or water power.', answer: true },
      ['Steam engines powered trains and factories. What big change did they help start?', ['The Industrial Revolution', 'The Ice Age', 'The Stone Age', 'Nothing much'], 0],
    ],
  },
  telephone: {
    name: 'Telephone', type: 'Invention · Voices Travel', emoji: '☎️', badge: 'Call Connector', build: 'phone',
    mission: '☎️ The telephone let people talk across huge distances for the first time. Ready to make the call?',
    stats: [['1876', 'Bell\'s phone'], ['Voice', 'Sent far away'], ['Signal', 'Sound becomes it'], ['Now wireless', 'Phones in pockets']],
    facts: ['☎️ The telephone lets people talk to each other across long distances.', '📞 Alexander Graham Bell made an early working telephone in 1876.', '🔊 It turns your voice into a signal that travels down a wire (or through the air), then back into sound.', '📱 Today\'s mobile phones do this wirelessly and fit in your pocket!'],
    fun: 'The very first telephone words Bell spoke were simply: "Mr. Watson, come here, I want to see you" — and it worked!',
    quiz: [
      ['What does a telephone let you do?', ['Talk to people far away', 'Cook dinner', 'Fly a kite', 'See in the dark'], 0],
      { t: 'tf', q: 'Alexander Graham Bell made an early telephone.', answer: true },
      { t: 'pic', q: 'Which lets you talk to someone far away?', options: [
        { shape: 'square', color: '#33333A', label: 'A telephone' }, { shape: 'circle', color: '#8A5A34', label: 'A rock' }, { shape: 'triangle', color: '#6BCB77', label: 'A leaf' }], answer: 0 },
    ],
    quizHard: [
      ['A phone turns your voice into a signal, sends it, then back into sound. Why turn voice into a signal at all?', ['A signal can travel far down a wire or through the air', 'Voices are too heavy', 'It sounds nicer', 'To slow it down'], 0],
      { t: 'tf', q: 'Early phones used wires, but today\'s mobiles send the signal wirelessly.', answer: true },
      ['Before the telephone, sending a message far away was slow. What did the phone change?', ['People could talk across distances instantly', 'Nothing changed', 'It made letters faster only', 'It replaced books'], 0],
    ],
  },
};

/* ---------------- procedural inventions (exploded → assemble) ---------------- */
/** Add a part with an assembled position `to`; it starts pushed out along a
 *  random offset and lerps in when the subject is tapped. */
function part(THREE, parts, mesh, to) {
  const dir = new THREE.Vector3(to.x + (Math.random() - 0.5), to.y + (Math.random() - 0.5), to.z).normalize();
  const from = to.clone().add(dir.multiplyScalar(4 + Math.random() * 2));
  mesh.position.copy(from);
  parts.push({ mesh, from, to: to.clone() });
}

function buildMachine(THREE, kind) {
  const g = new THREE.Group();
  const parts = [];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  if (kind === 'wheel') {
    const w = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.35, 10, 24), M(THREE)); w.rotation.y = Math.PI / 2; part(THREE, parts, w, V(0, 2.2, 0));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12), M(THREE, 0xC98A2A)); hub.rotation.z = Math.PI / 2; part(THREE, parts, hub, V(0, 2.2, 0));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), M(THREE, 0xE0C070)); sp.position.set(0, 2.2, 0); sp.rotation.x = a; part(THREE, parts, sp, V(0, 2.2, 0).clone()); sp.userData._rot = a; }
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3, 8), M(THREE, 0x9A968C)); axle.rotation.z = Math.PI / 2; part(THREE, parts, axle, V(0, 2.2, 0));
  } else if (kind === 'electricity') {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 12), new THREE.MeshBasicMaterial({ color: 0xFFF3B0 })); part(THREE, parts, bulb, V(0, 3.2, 0));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 12), M(THREE, 0x9A968C)); part(THREE, parts, base, V(0, 2.4, 0));
    const bolt = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 4), M(THREE, 0xF6E15A)); part(THREE, parts, bolt, V(0, 1.4, 0));
    const wire = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 6, 24, Math.PI * 1.4), M(THREE, 0xE0722E)); wire.position.y = 2.4; part(THREE, parts, wire, V(0, 2.4, 0));
  } else if (kind === 'press') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 2.4), M(THREE)); part(THREE, parts, frame, V(0, 1.2, 0));
    const plate = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1.8), M(THREE, 0xE8DFC8)); part(THREE, parts, plate, V(0, 2.6, 0));
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2, 10), M(THREE, 0x9A968C)); part(THREE, parts, screw, V(0, 3.4, 0));
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.2), M(THREE, 0xC98A2A)); part(THREE, parts, bar, V(0, 4.4, 0));
    for (const dx of [1.3, -1.3]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3.4, 8), M(THREE, 0xC98A2A)); part(THREE, parts, post, V(dx, 2.8, 0)); }
  } else if (kind === 'plane') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 2.6, 6, 10), M(THREE, 0xDDE4EC)); body.rotation.z = Math.PI / 2; part(THREE, parts, body, V(0, 2.6, 0));
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 4.4), M(THREE, 0xC0C8D4)); part(THREE, parts, wing, V(0, 2.6, 0));
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.1), M(THREE, 0xC0C8D4)); part(THREE, parts, tail, V(-1.8, 3, 0));
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 12), M(THREE, 0xE0722E)); nose.rotation.z = -Math.PI / 2; part(THREE, parts, nose, V(2, 2.6, 0));
  } else if (kind === 'rocket') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3, 14), M(THREE, 0xDDE4EC)); part(THREE, parts, body, V(0, 2.6, 0));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 14), M(THREE, 0xE23B2E)); part(THREE, parts, cone, V(0, 4.5, 0));
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const fin = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 4), M(THREE, 0xE0722E)); fin.position.set(Math.cos(a) * 0.7, 1.3, Math.sin(a) * 0.7); part(THREE, parts, fin, V(Math.cos(a) * 0.7, 1.3, Math.sin(a) * 0.7)); }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 10), new THREE.MeshBasicMaterial({ color: 0xF6C21E })); flame.rotation.x = Math.PI; part(THREE, parts, flame, V(0, 0.6, 0));
  } else if (kind === 'simple') {
    const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1, 4), M(THREE, 0x9A968C)); part(THREE, parts, fulcrum, V(0, 1, 0));
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 0.25, 0.5), M(THREE, 0xC98A2A)); part(THREE, parts, beam, V(0, 1.6, 0));
    const load = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), M(THREE, 0xE23B2E)); part(THREE, parts, load, V(1.7, 2.1, 0));
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.15, 8, 16), M(THREE)); wheel.position.y = 3.4; part(THREE, parts, wheel, V(-1.4, 3.4, 0));
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), M(THREE, 0xE0C070)); part(THREE, parts, rope, V(-1.4, 2.5, 0));
  } else if (kind === 'steam') {
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.6, 14), M(THREE, 0x8A6A3A)); boiler.rotation.z = Math.PI / 2; part(THREE, parts, boiler, V(0, 1.8, 0));
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 10), M(THREE, 0x5A4A2E)); part(THREE, parts, chimney, V(0.9, 3.2, 0));
    for (const dx of [1, -1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.2, 8, 16), M(THREE, 0x9A968C)); w.rotation.y = Math.PI / 2; part(THREE, parts, w, V(dx * 1, 0.7, 0)); }
    const piston = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.2), M(THREE, 0xC0C8D4)); part(THREE, parts, piston, V(-1.4, 1.8, 0));
  } else if (kind === 'phone') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1.4), M(THREE, 0x33333A)); part(THREE, parts, base, V(0, 1.6, 0));
    const dial = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 8, 16), M(THREE, 0xF2A93B)); dial.rotation.x = Math.PI / 2; part(THREE, parts, dial, V(0, 2.05, 0.2));
    const handset = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 1.6, 4, 8), M(THREE, 0x222)); handset.rotation.z = Math.PI / 2; part(THREE, parts, handset, V(0, 2.7, 0));
    for (const dx of [1, -1]) { const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 10), M(THREE, 0x222)); ear.rotation.x = Math.PI / 2; part(THREE, parts, ear, V(dx * 1, 2.7, 0)); }
    const cord = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20, Math.PI * 1.5), M(THREE, 0x555)); cord.position.set(-1, 2, 0); part(THREE, parts, cord, V(-1, 2, 0));
  }
  parts.forEach((p) => g.add(p.mesh));
  g.userData.parts = parts;
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;
  let lastT = 0;

  const grid = new THREE.GridHelper(R * 2.4, 30, 0x7A5A2A, 0x4a3818);
  grid.position.y = -1; group.add(grid);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildMachine(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 4);
    holder.position.set(p.x, p.y + 1, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 1, parts: item.userData.parts, assemble: 0, target: 0 };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  // Tapping a subject assembles its exploded parts.
  function onSelect(key) {
    const m = clickables.find((c) => c.userData.key === key);
    if (m) m.userData.target = 1;
  }

  function update(dt, t, camera) {
    lastT = t;
    clickables.forEach((m) => {
      const u = m.userData;
      m.rotation.y += dt * 0.16;
      m.position.y = u.baseY + Math.sin(t * 0.6 + u.bobPhase) * 0.4;
      u.assemble += (u.target - u.assemble) * Math.min(1, dt * 2.2);
      const e = 1 - Math.pow(1 - u.assemble, 3);
      u.parts.forEach((p) => p.mesh.position.lerpVectors(p.from, p.to, e));
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, onSelect, home: { radius: 118 } };
}

export default {
  key: 'machines',
  name: 'Machines & Inventions',
  icon: '⚙️',
  blurb: 'From the wheel to rockets — meet the ideas that changed everything.',
  unlockCost: 840,
  category: 'Ideas & Machines',
  theme: { primary: 0xF2A93B, secondary: 0xE0722E, bg: 0x140f06, light: 0xFFE6B8, ambient: 0x4a3a1a },
  masterTitle: 'Inventor Master ⚙️',
  subjects: SUBJECTS,
  build,
};
