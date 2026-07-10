import { attachMarker, updateMarkers, ringPosition } from './helpers.js';

/**
 * World 17 — Physics & Forces. A mini physics-sandbox: every subject visibly
 * demonstrates its force. Demos run continuously (a ball keeps bouncing, a
 * seesaw keeps tipping) AND replay from the start when you tap the subject, via
 * the engine's onSelect hook — so the info panel opens as the demo kicks off.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.1, flatShading: true, ...o });

const SUBJECTS = {
  gravity: {
    name: 'Gravity', type: 'Physics · The Big Pull', emoji: '🍎', badge: 'Gravity Guru', build: 'gravity',
    mission: '🍎 Drop anything and gravity pulls it down. Ready to feel the force that holds you to Earth?',
    stats: [['Pulls down', 'Everything'], ['Keeps us', 'On the ground'], ['Moon', 'Weaker gravity'], ['Mass', 'More = stronger']],
    facts: ['🍎 Gravity is a force that pulls objects toward each other.', '🌍 Earth\'s gravity pulls everything down, keeping us on the ground.', '🌕 The Moon has weaker gravity, so you\'d bounce and feel lighter there.', '⭐ The more massive something is, the stronger its pull — that\'s why planets hold onto moons.'],
    fun: 'Drop a hammer and a feather on the airless Moon and they land at the SAME time — astronauts actually tried it!',
    quiz: [
      ['What does gravity do?', ['Pulls things down and together', 'Pushes things up', 'Makes things vanish', 'Nothing'], 0],
      { t: 'tf', q: 'The Moon has weaker gravity than Earth.', answer: true },
      { t: 'pic', q: 'Which way does gravity pull a dropped apple?', options: [
        { shape: 'triangle', color: '#E23B2E', label: 'Down' }, { shape: 'triangle', color: '#4BA6E8', label: 'Up' }, { shape: 'circle', color: '#6BCB77', label: 'Sideways' }], answer: 0 },
    ],
    quizHard: [
      ['On the Moon you feel lighter and bounce. Why?', ['The Moon\'s gravity pulls you less', 'There is more gravity', 'You wear springs', 'The Moon pushes you'], 0],
      { t: 'tf', q: 'A more massive object has a stronger gravity pull.', answer: true },
      ['A hammer and feather land together on the airless Moon. What normally slows the feather on Earth?', ['Air pushing against it', 'Extra gravity', 'The Sun', 'Its colour'], 0],
    ],
  },
  friction: {
    name: 'Friction', type: 'Physics · The Grippy Force', emoji: '🛑', badge: 'Friction Fixer', build: 'friction',
    mission: '🛑 Friction is the grippy force that slows things down and stops you slipping. Ready to feel the drag?',
    stats: [['Slows things', 'That slide'], ['Grip', 'Lets you walk'], ['Heat', 'Rubbing makes it'], ['Rough', 'More friction']],
    facts: ['🛑 Friction is a force that slows down sliding when two things rub together.', '🚶 It\'s why you can walk without slipping and why brakes stop a bike.', '🔥 Rubbing your hands makes friction, which makes heat.', '🧊 Rough surfaces have more friction than smooth, slippery ones like ice.'],
    fun: 'Rub your hands together fast and they warm up — that heat is friction turning movement into warmth!',
    quiz: [
      ['What does friction do?', ['Slows down sliding', 'Speeds things up', 'Makes things fly', 'Cools everything'], 0],
      { t: 'tf', q: 'Ice is slippery because it has very little friction.', answer: true },
      { t: 'pic', q: 'Which surface has MORE friction (more grip)?', options: [
        { shape: 'square', color: '#8A6A48', label: 'Rough ground' }, { shape: 'circle', color: '#BFE9FF', label: 'Smooth ice' }, { shape: 'oval', color: '#DCF2FF', label: 'Wet glass' }], answer: 0 },
    ],
    quizHard: [
      ['Rubbing your hands makes them warm. What is friction turning the movement into?', ['Heat', 'Light', 'Sound only', 'Cold'], 0],
      { t: 'tf', q: 'Bike brakes work by using friction to slow the wheels.', answer: true },
      ['You slip on ice but not on a rough path. What does that tell you about ice?', ['It has very little friction', 'It has lots of grip', 'It is sticky', 'It is warm'], 0],
    ],
  },
  light: {
    name: 'Light', type: 'Physics · Fastest Thing', emoji: '💡', badge: 'Light Bringer', build: 'light',
    mission: '💡 Light zooms in straight lines faster than anything else. Ready to shine a light on how we see?',
    stats: [['Fastest', 'Nothing beats it'], ['Straight', 'It travels straight'], ['Reflects', 'Bounces off things'], ['Colours', 'White hides them']],
    facts: ['💡 Light is the fastest thing in the universe — nothing travels quicker.', '➡️ It moves in straight lines and lets us see the world.', '🔄 Light bounces (reflects) off things and into our eyes — that\'s how we see them.', '🌈 White light is secretly made of all the rainbow colours mixed together.'],
    fun: 'Light is so fast it could zip around the whole Earth more than SEVEN times in a single second!',
    quiz: [
      ['How does light travel?', ['In straight lines, very fast', 'In slow circles', 'Backwards', 'It doesn\'t move'], 0],
      { t: 'tf', q: 'White light is made of all the rainbow colours mixed together.', answer: true },
      { t: 'pic', q: 'Which is the fastest?', options: [
        { shape: 'star', color: '#F6E15A', label: 'Light' }, { shape: 'square', color: '#4BA6E8', label: 'A car' }, { shape: 'circle', color: '#6BCB77', label: 'A snail' }], answer: 0 },
    ],
    quizHard: [
      ['We see a ball because light does what?', ['Bounces off it into our eyes', 'Eats it', 'Sticks to it', 'Ignores it'], 0],
      { t: 'tf', q: 'A prism can split white light back into the rainbow colours hidden in it.', answer: true },
      ['Light from far stars is very old by the time it reaches us. Why?', ['Even super-fast light takes time over huge distances', 'Stars are slow', 'Light gets tired', 'It stops to rest'], 0],
    ],
  },
  sound: {
    name: 'Sound', type: 'Physics · Good Vibrations', emoji: '🔊', badge: 'Sound Sleuth', build: 'sound',
    mission: '🔊 Sound is a wiggle in the air that your ears catch. Ready to tune into how we hear?',
    stats: [['Vibrations', 'Sound is'], ['Needs air', 'Or water/solid'], ['No space', 'Sound can\'t travel'], ['Ears', 'Catch it']],
    facts: ['🔊 Sound is made by vibrations — tiny back-and-forth wiggles — travelling as waves.', '💨 It needs something to travel through, like air, water, or solids.', '🌑 In the emptiness of space there\'s no air, so sound can\'t travel — space is silent!', '👂 Your ears catch the waves and your brain turns them into what you hear.'],
    fun: 'In space, no one can hear a sound — with no air to carry it, even a huge explosion would be totally silent!',
    quiz: [
      ['What is sound made of?', ['Vibrations travelling as waves', 'Tiny lights', 'Drops of water', 'Small rocks'], 0],
      { t: 'tf', q: 'Sound cannot travel through empty space.', answer: true },
      { t: 'pic', q: 'Sound can travel through which one?', options: [
        { shape: 'circle', color: '#8FD0FF', label: 'Air' }, { shape: 'circle', color: '#0a0a12', label: 'Empty space' }, { shape: 'star', color: '#33313F', label: 'Nothing' }], answer: 0 },
    ],
    quizHard: [
      ['Space is silent even during huge explosions. Why can\'t we hear them?', ['There is no air to carry the sound', 'They are too far to see', 'Sound is too fast', 'Explosions are quiet'], 0],
      { t: 'tf', q: 'Because sound needs a material to travel through, it moves through water too.', answer: true },
      ['Your ears catch sound waves. What turns those waves into what you actually hear?', ['Your brain', 'Your nose', 'Your feet', 'The wind'], 0],
    ],
  },
  energy: {
    name: 'Energy', type: 'Physics · Power to Act', emoji: '⚡', badge: 'Energy Expert', build: 'energy',
    mission: '⚡ Energy is the power to make ANYTHING happen — and it never disappears. Ready to power up?',
    stats: [['Power', 'To do things'], ['Many forms', 'Heat, light, motion'], ['Changes', 'One form to another'], ['Never lost', 'Just moves']],
    facts: ['⚡ Energy is the ability to make things happen — to move, heat, light up, or grow.', '🔋 It comes in many forms: heat, light, sound, motion, and stored energy (like in food or a battery).', '🔄 Energy can change from one form to another — food energy becomes movement when you run.', '♾️ Energy is never destroyed; it just changes form or moves somewhere else.'],
    fun: 'The energy in your lunch originally came from the SUN — plants caught sunlight, and you eat the plants!',
    quiz: [
      ['What is energy?', ['The power to make things happen', 'A kind of rock', 'A colour', 'A sound only'], 0],
      { t: 'tf', q: 'Energy can change from one form to another.', answer: true },
      { t: 'pic', q: 'Where does most of Earth\'s energy come from?', options: [
        { shape: 'circle', color: '#F6D64A', label: 'The Sun' }, { shape: 'circle', color: '#33313F', label: 'Darkness' }, { shape: 'square', color: '#6E6E7A', label: 'A rock' }], answer: 0 },
    ],
    quizHard: [
      ['When you run, your food energy becomes movement. What does that show about energy?', ['It changes from one form to another', 'It disappears', 'It gets heavier', 'It stops existing'], 0],
      { t: 'tf', q: 'The energy in your lunch can be traced all the way back to the Sun.', answer: true },
      ['Energy is never destroyed, only moved or changed. So when a moving ball stops, where did its energy go?', ['Into heat and sound', 'It vanished', 'Into the past', 'Nowhere'], 0],
    ],
  },
  motion: {
    name: 'Motion', type: 'Physics · Getting Moving', emoji: '🏃', badge: 'Motion Master', build: 'motion',
    mission: '🏃 Nothing moves on its own — it needs a push or a pull. Ready to get things going?',
    stats: [['Movement', 'Changing place'], ['Push or pull', 'Starts it'], ['Force', 'Makes it move'], ['Keeps going', 'Until stopped']],
    facts: ['🏃 Motion is when something changes position — it moves.', '👐 To start or stop motion, you need a force: a push or a pull.', '➡️ Once moving, an object keeps going in a straight line until a force (like friction) slows it.', '💪 The bigger the push, the faster something speeds up.'],
    fun: 'In space, with almost no friction, a gentle push would send you gliding forever until you hit something!',
    quiz: [
      ['What do you need to start something moving?', ['A push or a pull', 'A song', 'A colour', 'Nothing'], 0],
      { t: 'tf', q: 'A moving object keeps going until a force stops it.', answer: true },
      { t: 'pic', q: 'What gets a still ball moving?', options: [
        { shape: 'triangle', color: '#6BCB77', label: 'A push' }, { shape: 'circle', color: '#6E6E7A', label: 'Nothing' }, { shape: 'square', color: '#4BA6E8', label: 'A wish' }], answer: 0 },
    ],
    quizHard: [
      ['A bigger push makes a ball speed up more. What is a push or pull called in science?', ['A force', 'A colour', 'A sound', 'A dream'], 0],
      { t: 'tf', q: 'In space with almost no friction, a gentle push could keep you gliding a long, long way.', answer: true },
      ['A rolling ball slows and stops on grass. What force usually stops it?', ['Friction', 'Gravity pulling sideways', 'Sound', 'Light'], 0],
    ],
  },
  bouncing: {
    name: 'Bouncing', type: 'Physics · Boing!', emoji: '🏀', badge: 'Bounce Boss', build: 'bouncing',
    mission: '🏀 Boing! A bouncing ball squishes and springs back. Ready to find out why things bounce?',
    stats: [['Squish', 'Then springs back'], ['Elastic', 'Bouncy material'], ['Lower', 'Each bounce'], ['Hard floor', 'Bounces best']],
    facts: ['🏀 When a bouncy ball hits the ground, it squishes flat, then springs back — pushing itself up.', '🎈 Springy, elastic materials like rubber bounce best.', '⬇️ Each bounce is a little lower, because some energy turns into heat and sound.', '🧱 A hard floor gives a better bounce than soft grass or sand.'],
    fun: 'A dropped ball never bounces back higher than where it started — a little energy escapes as heat and sound each time!',
    quiz: [
      ['Why does a ball bounce back up?', ['It squishes, then springs back', 'It has an engine', 'The floor pushes forever', 'Magic'], 0],
      { t: 'tf', q: 'Each bounce is usually a little lower than the last.', answer: true },
      { t: 'pic', q: 'Which floor gives the best bounce?', options: [
        { shape: 'square', color: '#9A968C', label: 'Hard floor' }, { shape: 'circle', color: '#E3B23C', label: 'Soft sand' }, { shape: 'oval', color: '#6BCB77', label: 'Grass' }], answer: 0 },
    ],
    quizHard: [
      ['Each bounce is lower than the last. Where does the "missing" bounce energy go?', ['It turns into heat and sound', 'It vanishes forever', 'Into the ball\'s colour', 'Up to the Moon'], 0],
      { t: 'tf', q: 'A rubber ball bounces better than a lump of clay because rubber is elastic.', answer: true },
      ['A ball bounces higher on tile than on sand. Why does soft sand kill the bounce?', ['Sand soaks up the ball\'s energy', 'Sand is sticky', 'Sand is cold', 'Sand pushes down'], 0],
    ],
  },
  balancephys: {
    name: 'Balance', type: 'Physics · Finding the Middle', emoji: '⚖️', badge: 'Balance Boss', build: 'balance',
    mission: '⚖️ Balance is all about forces evening out. Ready to find the perfect middle?',
    stats: [['Even out', 'Forces balance'], ['Centre', 'Of gravity'], ['Seesaw', 'Balances at middle'], ['Wide base', 'More stable']],
    facts: ['⚖️ Something balances when the forces or weights on it are even.', '🎯 Every object has a balancing point called its centre of gravity.', '🛝 On a seesaw, two equal weights balance when they\'re the same distance from the middle.', '🦶 A wide base makes things steadier — that\'s why you stand with feet apart to keep balance.'],
    fun: 'Tightrope walkers carry a long pole because it lowers their centre of gravity and makes balancing much easier!',
    quiz: [
      ['When does a seesaw balance?', ['Equal weights, equal distance from the middle', 'When one side is heavier', 'Never', 'Only when empty'], 0],
      { t: 'tf', q: 'A wider base makes something more stable.', answer: true },
      { t: 'pic', q: 'Which is steadier and harder to tip over?', options: [
        { shape: 'square', color: '#C08A4A', label: 'Wide base' }, { shape: 'tall', color: '#C08A4A', label: 'Tall & thin' }, { shape: 'circle', color: '#C08A4A', label: 'A ball' }], answer: 0 },
    ],
    quizHard: [
      ['A tightrope walker\'s long pole helps them balance. How?', ['It lowers their centre of gravity', 'It makes them heavier only', 'It helps them fly', 'It blocks the wind'], 0],
      { t: 'tf', q: 'Two children of the same weight balance a seesaw by sitting the same distance from the middle.', answer: true },
      ['You stand with feet apart to keep from falling. What does a wider base give you?', ['More stability', 'More speed', 'More height', 'Less weight'], 0],
    ],
  },
};

/* ---------------- procedural physics demos ---------------- */
function buildPhysics(THREE, kind) {
  const g = new THREE.Group();
  const floor = () => { const f = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 3), M(THREE, 0x5A5A66)); f.position.y = 0.2; g.add(f); return f; };
  if (kind === 'gravity') {
    floor();
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 12), M(THREE, 0xE23B2E)); apple.position.y = 5; g.add(apple); g.userData.apple = apple;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5), M(THREE, 0x5A3A1E)); stalk.position.y = 0.55; apple.add(stalk);
  } else if (kind === 'friction') {
    floor();
    const block = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.8), M(THREE, 0xE3B23C)); block.position.set(-2.5, 0.8, 0); g.add(block); g.userData.block = block;
  } else if (kind === 'light') {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 12), new THREE.MeshBasicMaterial({ color: 0xFFF3B0 })); bulb.position.y = 3; g.add(bulb);
    const rays = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.18, 2, 4), new THREE.MeshBasicMaterial({ color: 0xF6E15A, transparent: true, opacity: 0.6 }));
      ray.position.set(Math.cos(a) * 1.8, 3 + Math.sin(a) * 1.8, 0); ray.rotation.z = -a + Math.PI / 2; g.add(ray); rays.push(ray);
    }
    g.userData.rays = rays;
  } else if (kind === 'sound') {
    const speaker = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), M(THREE, 0x33333A)); speaker.position.y = 1.4; g.add(speaker);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.3, 0.4, 16), M(THREE, 0x8A909A)); cone.position.set(0, 1.4, 0.7); cone.rotation.x = Math.PI / 2; g.add(cone);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 8, 24), new THREE.MeshBasicMaterial({ color: 0x8FD0FF, transparent: true, opacity: 0.7 }));
      ring.position.set(0, 1.4, 1); ring.rotation.y = Math.PI / 2; g.add(ring); rings.push(ring);
    }
    g.userData.rings = rings;
  } else if (kind === 'energy') {
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: 0xF6E15A })); orb.position.y = 2.4; g.add(orb); g.userData.orb = orb;
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xFFD060, transparent: true, opacity: 0.2, side: THREE.BackSide })); halo.position.y = 2.4; g.add(halo);
  } else if (kind === 'motion') {
    const track = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 1), M(THREE, 0x5A5A66)); track.position.y = 0.6; g.add(track);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 12), M(THREE, 0x4BA6E8)); ball.position.y = 1.3; g.add(ball); g.userData.ball = ball;
  } else if (kind === 'bouncing') {
    const f = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 3), M(THREE, 0x8A909A)); f.position.y = 0.2; g.add(f);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 12), M(THREE, 0xF2822A)); ball.position.y = 3; g.add(ball); g.userData.ball = ball;
  } else if (kind === 'balance') {
    const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 4), M(THREE, 0x8A909A)); fulcrum.position.y = 0.8; g.add(fulcrum);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 0.8), M(THREE, 0xC08A4A)); beam.position.y = 1.7; g.add(beam); g.userData.beam = beam;
    for (const dx of [1.8, -1.8]) { const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), M(THREE, 0xE23B2E)); box.position.set(dx, 0.6, 0); beam.add(box); }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;
  let lastT = 0;

  // Grid "lab bench" floor.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 24, 48),
    new THREE.MeshBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildPhysics(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 0);
    holder.position.set(p.x, 0, p.z);
    holder.userData = { key, def, focusRadius: 8, t0: 0, item };
    attachMarker(THREE, holder, isDone(key), 6.4);
    clickables.push(holder);
    group.add(holder);
  });

  // Tapping a subject replays its demo from the start.
  function onSelect(key) {
    const m = clickables.find((c) => c.userData.key === key);
    if (m) m.userData.t0 = lastT;
  }

  function demo(u, lt) {
    const d = u.item.userData;
    switch (u.def.build) {
      case 'gravity': { const p = lt % 2; d.apple.position.y = p < 0.9 ? 5 - 4.5 * (p / 0.9) ** 2 : 0.6; break; }
      case 'friction': { const p = lt % 2.6; d.block.position.x = p < 1.3 ? -2.5 + 4 * (1 - (1 - p / 1.3) ** 2) : 1.5; break; }
      case 'light': { d.rays.forEach((r, i) => { r.material.opacity = 0.35 + 0.4 * Math.abs(Math.sin(lt * 2 + i * 0.4)); }); break; }
      case 'sound': { d.rings.forEach((r, i) => { const ph = (lt * 0.7 + i / 3) % 1; r.scale.setScalar(0.3 + ph * 3); r.material.opacity = 0.8 * (1 - ph); }); break; }
      case 'energy': { d.orb.scale.setScalar(1 + Math.sin(lt * 3) * 0.18); d.orb.material.color.setHSL((lt * 0.25) % 1, 0.8, 0.6); d.orb.rotation.y += 0.02; break; }
      case 'motion': { d.ball.position.x = Math.sin(lt * 1.4) * 2.4; d.ball.rotation.z = -Math.sin(lt * 1.4) * 3; break; }
      case 'bouncing': { const env = 1 - (lt % 3) / 3; d.ball.position.y = 0.6 + Math.abs(Math.sin(lt * 3)) * 3 * env; break; }
      case 'balance': { d.beam.rotation.z = Math.sin(lt * 1.2) * 0.32; break; }
    }
  }

  function update(dt, t, camera) {
    lastT = t;
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.12;
      demo(m.userData, t - m.userData.t0);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, onSelect, home: { radius: 118 } };
}

export default {
  key: 'physics',
  name: 'Physics & Forces',
  icon: '⚡',
  blurb: 'Push, pull, bounce, and balance — the invisible rules of everything.',
  unlockCost: 612,
  category: 'Science & Space',
  theme: { primary: 0x5BC0DE, secondary: 0xF6E15A, bg: 0x0a1420, light: 0xDDF0FF, ambient: 0x2a4055 },
  masterTitle: 'Physics Master ⚡',
  subjects: SUBJECTS,
  build,
};
