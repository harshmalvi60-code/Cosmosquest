import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 3 — Animal Kingdom. Ten champion animals, each a low-poly silhouette
 * built from primitive geometries with a small idle animation (breathing,
 * tail sway, ear/wing flap) so they read as alive. Content follows the Nature
 * template: 4 stats, 4 facts, a WOW fact, a mission briefing, mixed-type base
 * quiz and a harder two-step quizHard set.
 */

const SUBJECTS = {
  lion: {
    name: 'Lion', type: 'Animal · Big Cat', emoji: '🦁', badge: 'Lion Tamer', build: 'lion',
    mission: '🦁 The Lion\'s roar can be heard 8km away. Ready to learn what makes it the king?',
    stats: [['8 km', 'Roar heard away'], ['Pride', 'Its family group'], ['Lionesses', 'Main hunters'], ['20 hrs', 'Rest each day']],
    facts: ['🦁 A lion\'s mighty roar can be heard up to 8 km away — the loudest of any big cat!', '👑 Lions live in family groups called prides, unlike most cats who live alone.', '🍖 The lionesses (female lions) do most of the hunting, working together as a team.', '😴 Lions are super lazy — they rest and sleep for up to 20 hours every day!'],
    fun: 'A lion\'s roar is so loud it can be heard from 8 km away — like hearing it from 80 football pitches!',
    quiz: [
      ['How far away can a lion\'s roar be heard?', ['8 km', '8 metres', '80 km', '800 km'], 0],
      { t: 'tf', q: 'Male lions do most of the hunting.', answer: false },
      { t: 'pic', q: 'Which colour is a lion\'s coat?', options: [
        { shape: 'circle', color: '#E0A44A', label: 'Golden' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Lionesses hunt together in a group. Why does teamwork help them catch big prey?', ['They can surround and outsmart it', 'They are slower together', 'They roar it to sleep', 'They dig traps'], 0],
      { t: 'tf', q: 'A "pride" is a lion\'s family, so a lion living all alone has no pride.', answer: true },
      ['Lions rest ~20 hours a day and hunt when it\'s cooler. Why hunt in the cool?', ['To avoid the daytime heat', 'Because prey glows at night', 'They can\'t see by day', 'To surprise the moon'], 0],
    ],
  },
  elephant: {
    name: 'Elephant', type: 'Animal · Giant', emoji: '🐘', badge: 'Gentle Giant', build: 'elephant',
    mission: '🐘 An elephant\'s trunk has 40,000 muscles and can pick up a single blade of grass. Ready to explore the biggest land animal?',
    stats: [['Biggest', 'Land animal'], ['40,000', 'Muscles in its trunk'], ['Rumbles', 'Talk through the ground'], ['150 kg', 'Food per day']],
    facts: ['🐘 Elephants are the largest animals that live on land.', '💪 An elephant\'s trunk has around 40,000 muscles — it can lift a log or pick up one blade of grass.', '👂 They flap their huge ears to fan themselves and stay cool.', '📳 Elephants "talk" using deep rumbles so low we can feel them travel through the ground.'],
    fun: 'An elephant\'s trunk has about 40,000 muscles — your whole body has only around 600!',
    quiz: [
      ['About how many muscles are in an elephant\'s trunk?', ['40,000', '40', '4', '400,000'], 0],
      { t: 'tf', q: 'Elephants flap their big ears to help keep cool.', answer: true },
      { t: 'pic', q: 'Elephants are the biggest on land. Tap the biggest!', options: [
        { shape: 'circle', color: '#9AA0AA', label: '', size: 1 }, { shape: 'circle', color: '#9AA0AA', label: '', size: 0.55 }, { shape: 'circle', color: '#9AA0AA', label: '', size: 0.32 }], answer: 0 },
    ],
    quizHard: [
      ['Big ears give an elephant more skin to lose heat from. So why flap them on a hot day?', ['To cool its blood down faster', 'To fly', 'To hear better only', 'To look bigger'], 0],
      { t: 'tf', q: 'Elephant rumbles travel through the ground, so elephants can "talk" even when far apart.', answer: true },
      ['A trunk lifts heavy logs AND picks up tiny grass. What does that make it most like?', ['A strong, gentle hand', 'A pair of scissors', 'A hammer only', 'A straw only'], 0],
    ],
  },
  bluewhale: {
    name: 'Blue Whale', type: 'Animal · Ocean Giant', emoji: '🐋', badge: 'Whale Watcher', build: 'whale',
    mission: '🐋 Bigger than any dinosaur, the Blue Whale\'s heart is the size of a car. Ready to meet the biggest animal ever?',
    stats: [['Biggest ever', 'Animal of all time'], ['30 m', 'Length'], ['Krill', 'Its tiny food'], ['Car-sized', 'Its heart']],
    facts: ['🐋 The blue whale is the biggest animal that has EVER lived — bigger than any dinosaur.', '❤️ Its heart is about the size of a small car.', '🦐 It eats tiny shrimp-like animals called krill — but tonnes of them every day!', '📣 Its call is louder than a jet plane and travels for miles through the ocean.'],
    fun: 'A blue whale\'s heart is so big that a small child could crawl through its largest blood vessel!',
    quiz: [
      ['What is the biggest animal that has ever lived?', ['The blue whale', 'The elephant', 'T-Rex', 'The lion'], 0],
      { t: 'tf', q: 'Blue whales eat tiny animals called krill.', answer: true },
      { t: 'pic', q: 'Which colour is a blue whale?', options: [
        { shape: 'oval', color: '#5E86C6', label: 'Blue-grey' }, { shape: 'oval', color: '#FF7FB0', label: 'Pink' }, { shape: 'oval', color: '#E3B23C', label: 'Gold' }], answer: 0 },
    ],
    quizHard: [
      ['A blue whale is enormous but eats tiny krill. How does it get enough food?', ['It gulps millions of krill at once', 'It eats one krill a day', 'It eats other whales', 'It doesn\'t eat'], 0],
      { t: 'tf', q: 'Since the blue whale is bigger than any dinosaur, no land animal today is bigger than it.', answer: true },
      ['Whale calls travel for miles underwater. Why is that handy for whales?', ['To talk across huge distances', 'To scare fish', 'To sleep', 'To blow bubbles'], 0],
    ],
  },
  cheetah: {
    name: 'Cheetah', type: 'Animal · Sprinter', emoji: '🐆', badge: 'Speed Demon', build: 'cheetah',
    mission: '🐆 The Cheetah goes from 0 to 100 km/h in seconds — the fastest runner on land. Ready to race?',
    stats: [['120 km/h', 'Top speed'], ['3 sec', '0 to 100 km/h'], ['Spots', 'Its coat pattern'], ['Tail', 'Steers at speed']],
    facts: ['🐆 The cheetah is the fastest land animal, reaching about 120 km/h.', '🏎️ It speeds up faster than a sports car — 0 to 100 km/h in around 3 seconds!', '🎯 Its long tail swings like a rudder to help it turn sharply while sprinting.', '🥵 It can only sprint for about 20 seconds before it gets too hot and must rest.'],
    fun: 'A cheetah reaches car-speed in about 3 seconds — but can only sprint for ~20 seconds before it must stop and cool down!',
    quiz: [
      ['What is the fastest land animal?', ['The cheetah', 'The lion', 'The elephant', 'The wolf'], 0],
      { t: 'tf', q: 'A cheetah can run at top speed for hours without stopping.', answer: false },
      { t: 'pic', q: 'Which colour is a cheetah\'s coat?', options: [
        { shape: 'circle', color: '#E4B96B', label: 'Tan' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['A cheetah overheats after ~20 seconds of sprinting. So how must it catch prey?', ['In one short, quick chase', 'Over a long chase of hours', 'By swimming after it', 'By waiting for winter'], 0],
      { t: 'tf', q: 'A cheetah steers with its long tail, so the tail helps it turn while running fast.', answer: true },
      ['A cheetah speeds up faster than a sports car. What does that tell you about its legs?', ['They are very powerful', 'They are weak', 'They have wheels', 'They are tiny'], 0],
    ],
  },
  octopus: {
    name: 'Octopus', type: 'Animal · Ocean Genius', emoji: '🐙', badge: 'Ink Master', build: 'octopus',
    mission: '🐙 With 3 hearts, 8 arms and the power to vanish, the Octopus is the ocean\'s genius. Ready to explore?',
    stats: [['8', 'Arms'], ['3', 'Hearts'], ['Blue', 'Its blood'], ['Camouflage', 'Changes colour']],
    facts: ['🐙 An octopus has 8 arms covered in suckers that can grip AND taste!', '💙 It has 3 hearts and blue-coloured blood.', '🎨 It can change the colour and texture of its skin to hide in a blink.', '🕳️ With no bones at all, it can squeeze its whole body through a tiny gap.'],
    fun: 'An octopus has no bones, so it can squeeze its entire body through a hole the size of a coin!',
    quiz: [
      ['How many hearts does an octopus have?', ['3', '1', '2', '8'], 0],
      { t: 'tf', q: 'An octopus has bones inside its body.', answer: false },
      { t: 'pic', q: 'What colour is an octopus\'s blood?', options: [
        { shape: 'drop', color: '#4B7BE8', label: 'Blue' }, { shape: 'drop', color: '#E33', label: 'Red' }, { shape: 'drop', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['An octopus has no bones. How does that help it escape a hungry predator?', ['It squeezes into tiny cracks to hide', 'It runs very fast', 'It flies away', 'It grows a shell'], 0],
      { t: 'tf', q: 'With 3 hearts, an octopus could keep going even if one heart stopped for a moment.', answer: true },
      ['Octopuses change skin colour to match rocks and coral. Why do that?', ['To hide from danger', 'To look pretty', 'To warm up', 'To glow in the dark'], 0],
    ],
  },
  eagle: {
    name: 'Eagle', type: 'Animal · Sky Hunter', emoji: '🦅', badge: 'Sky Sniper', build: 'eagle',
    mission: '🦅 An Eagle can spot a rabbit from 3 km up in the sky. Ready to soar with the sharpest eyes around?',
    stats: [['8×', 'Sharper sight than us'], ['3 km', 'Can spot prey from'], ['Talons', 'Grabbing claws'], ['Soars', 'Rides warm air']],
    facts: ['🦅 An eagle\'s eyesight is about 8 times sharper than a human\'s.', '🎯 It can spot a small rabbit from as high as 3 km up.', '🦶 Its powerful claws, called talons, grip and carry prey.', '🌤️ It soars for hours without flapping by riding columns of rising warm air.'],
    fun: 'An eagle\'s eyes are so sharp it could read a newspaper from right across a football field!',
    quiz: [
      ['About how much sharper is an eagle\'s eyesight than ours?', ['8 times', '2 times', 'The same', 'Half as sharp'], 0],
      { t: 'tf', q: 'Eagles must flap constantly and can never glide.', answer: false },
      { t: 'pic', q: 'Which shape looks most like an eagle in flight?', options: [
        { shape: 'triangle', color: '#7A5230', label: 'Wings out' }, { shape: 'circle', color: '#7A5230', label: 'Ball' }, { shape: 'square', color: '#7A5230', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['Eagles soar on rising warm air without flapping. Why is that helpful?', ['It saves energy while flying', 'It makes them slower', 'It cools them down', 'It hides them'], 0],
      { t: 'tf', q: 'Because an eagle sees 8× better than us, it can hunt from very high in the sky.', answer: true },
      ['An eagle grips prey with sharp talons. What are talons mainly for?', ['Catching and holding prey', 'Digging tunnels', 'Swimming', 'Cracking nuts'], 0],
    ],
  },
  chameleon: {
    name: 'Chameleon', type: 'Animal · Master of Disguise', emoji: '🦎', badge: 'Colour Changer', build: 'chameleon',
    mission: '🦎 The Chameleon changes colour AND moves each eye on its own. Ready to meet a master of disguise?',
    stats: [['Colours', 'Changes its skin'], ['360°', 'Each eye looks around'], ['Long', 'Tongue beats its body'], ['Grip', 'Curly tail holds on']],
    facts: ['🦎 A chameleon can change its skin colour — for hiding, for warmth, and even to show its mood.', '👀 Each of its eyes moves on its own, so it can look two ways at once.', '👅 Its sticky tongue shoots out longer than its whole body to snatch insects.', '🌀 Its curly tail and grippy feet hold tight to branches.'],
    fun: 'A chameleon can look forwards and backwards AT THE SAME TIME, because each eye moves on its own!',
    quiz: [
      ['What can a chameleon do with its two eyes?', ['Look two ways at once', 'See in the dark only', 'Shoot lasers', 'Nothing special'], 0],
      { t: 'tf', q: 'A chameleon\'s tongue is shorter than its body.', answer: false },
      { t: 'pic', q: 'Which shape matches a chameleon\'s curly tail?', options: [
        { shape: 'crescent', color: '#5BB86A', label: 'Curly' }, { shape: 'square', color: '#5BB86A', label: 'Straight' }, { shape: 'star', color: '#5BB86A', label: 'Spiky' }], answer: 0 },
    ],
    quizHard: [
      ['Each chameleon eye moves separately. How does that help it survive?', ['It watches for food and danger at the same time', 'It sees double films', 'It never blinks', 'It sleeps standing up'], 0],
      { t: 'tf', q: 'Chameleons change colour for more reasons than hiding — like their mood or warmth.', answer: true },
      ['Its tongue is longer than its body. Why would such a long tongue be useful?', ['To grab far-away insects fast', 'To taste the wind', 'To drink rain', 'To scare birds'], 0],
    ],
  },
  honeybee: {
    name: 'Honeybee', type: 'Animal · Busy Insect', emoji: '🐝', badge: 'Hive Helper', build: 'bee',
    mission: '🐝 A Honeybee dances to tell its friends exactly where the flowers are. Ready to explore the busiest insect around?',
    stats: [['Waggle dance', 'Shares flower maps'], ['Honey', 'They make it'], ['Pollinate', 'Help plants grow'], ['1 Queen', 'Per hive']],
    facts: ['🐝 Bees do a wiggly "waggle dance" to tell each other which way to fly to flowers.', '🍯 They turn flower nectar into honey inside the hive.', '🌸 As they visit flowers, they carry pollen that helps plants make seeds and fruit.', '👑 A hive has thousands of bees but only ONE queen.'],
    fun: 'To fill one small jar of honey, a hive\'s bees fly a total distance greater than twice around the Earth!',
    quiz: [
      ['How does a bee tell others where flowers are?', ['A waggle dance', 'By singing', 'By roaring', 'It doesn\'t'], 0],
      { t: 'tf', q: 'Bees help plants grow by carrying pollen between flowers.', answer: true },
      { t: 'pic', q: 'Which colour is honey?', options: [
        { shape: 'drop', color: '#E3A81E', label: 'Golden' }, { shape: 'drop', color: '#4BA6E8', label: 'Blue' }, { shape: 'drop', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Bees carry pollen from flower to flower. What might happen to plants if bees vanished?', ['Many plants couldn\'t make fruit or seeds', 'Plants would grow faster', 'Nothing would change', 'Plants would fly'], 0],
      { t: 'tf', q: 'A hive has just one queen, so every other bee is a worker or drone.', answer: true },
      ['A bee dances to share a flower\'s direction. Why beats each bee searching alone?', ['The whole hive finds food much faster', 'Dancing is just for fun', 'It scares the flowers', 'It makes wind'], 0],
    ],
  },
  wolf: {
    name: 'Wolf', type: 'Animal · Pack Hunter', emoji: '🐺', badge: 'Pack Leader', build: 'wolf',
    mission: '🐺 Wolves howl to call their pack across the whole forest. Ready to run with the ultimate team?',
    stats: [['Pack', 'Its family team'], ['Howl', 'Calls the pack'], ['Teamwork', 'How they hunt'], ['Dogs', 'Came from wolves']],
    facts: ['🐺 Wolves live and hunt in family teams called packs.', '🌙 They howl to find each other and to say "this is our home".', '🤝 By hunting as a team, a pack can catch animals bigger than any single wolf.', '🐕 Every pet dog in the world is descended from wolves!'],
    fun: 'A wolf\'s howl can carry up to 10 km — it\'s how the pack says "here I am!" across the forest.',
    quiz: [
      ['Why do wolves howl?', ['To call and find their pack', 'To scare the moon', 'To fall asleep', 'For no reason'], 0],
      { t: 'tf', q: 'Pet dogs are descended from wolves.', answer: true },
      { t: 'pic', q: 'Which colour is a grey wolf?', options: [
        { shape: 'circle', color: '#8A8F98', label: 'Grey' }, { shape: 'circle', color: '#FF7FB0', label: 'Pink' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Wolves hunt in a pack. How does hunting as a team help them?', ['They can catch prey bigger than one wolf', 'They get tired faster', 'They scare each other off', 'They hunt worse together'], 0],
      { t: 'tf', q: 'Since dogs came from wolves, wolves and dogs are relatives.', answer: true },
      ['A howl carries up to 10 km. Why is a long-distance call useful for a pack?', ['Members can regroup when spread far apart', 'To wake up humans', 'To sing songs', 'To call the clouds'], 0],
    ],
  },
  penguin: {
    name: 'Penguin', type: 'Animal · Polar Swimmer', emoji: '🐧', badge: 'Ice Slider', build: 'penguin',
    mission: '🐧 Penguins can\'t fly — but they "fly" underwater and huddle to beat the cold. Ready to waddle in?',
    stats: [['Swim', 'Not fly'], ['Huddle', 'To stay warm'], ['Tuxedo', 'Black & white coat'], ['Dads', 'Guard the egg']],
    facts: ['🐧 Penguins can\'t fly in the air, but they are brilliant swimmers, using their wings like flippers.', '🤗 They huddle together in big groups to share warmth in the freezing cold.', '🎩 Their black back and white belly hide them from predators above and below in the water.', '🥚 Emperor penguin dads balance the egg on their feet to keep it warm all winter.'],
    fun: 'Emperor penguin dads keep their egg warm on their feet for two freezing months — without eating a thing!',
    quiz: [
      ['How do penguins use their wings?', ['Like flippers to swim', 'To fly high', 'To dig tunnels', 'They don\'t use them'], 0],
      { t: 'tf', q: 'Penguins can fly through the air like other birds.', answer: false },
      { t: 'pic', q: 'Which colours is a penguin?', options: [
        { shape: 'circle', color: '#EDEDED', label: 'Black & white' }, { shape: 'circle', color: '#E3B23C', label: 'Gold' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Penguins huddle in large groups in the cold. Why does huddling help them?', ['They share body heat and stay warmer', 'They get colder', 'They can then fly', 'It scares the wind away'], 0],
      { t: 'tf', q: 'A penguin\'s black back and white belly help hide it from hunters in the water.', answer: true },
      ['Penguins have wings but swim instead of fly. What did their wings become good for?', ['Pushing through water', 'Digging snow', 'Making nests', 'Catching the wind'], 0],
    ],
  },
};

/* ---------------- procedural low-poly creatures ---------------- */
const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.05, flatShading: true, ...o });

function quadruped(THREE, { body, legs, size = 1, headScale = 1 }) {
  const g = new THREE.Group();
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5 * size, 12, 10), M(THREE, body));
  bodyMesh.scale.set(1.6, 1, 1); bodyMesh.position.y = 1.4; idle(bodyMesh, 'breathe', 0.04, 2); g.add(bodyMesh);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.9 * size * headScale, 12, 10), M(THREE, body));
  head.position.set(2.2 * size, 1.9, 0); g.add(head);
  for (const [dx, dz] of [[1.4, 0.7], [1.4, -0.7], [-1.2, 0.7], [-1.2, -0.7]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * size, 0.28 * size, 1.4 * size, 8), M(THREE, legs || body));
    leg.position.set(dx * size, 0.6, dz * size); g.add(leg);
  }
  g.userData.head = head; g.userData.body = bodyMesh;
  return g;
}

function buildCreature(THREE, kind) {
  let g = new THREE.Group();
  if (kind === 'lion') {
    g = quadruped(THREE, { body: 0xE0A44A, legs: 0xC98F3A });
    const mane = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.5, 8, 16), M(THREE, 0x8A5A1E));
    mane.position.set(2.2, 1.9, 0); mane.rotation.y = Math.PI / 2; g.add(mane);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 2, 6), M(THREE, 0xE0A44A));
    tail.position.set(-2.3, 1.6, 0); tail.rotation.z = 1; idle(tail, 'sway', 0.4, 2.5, 'x'); g.add(tail);
  } else if (kind === 'cheetah') {
    g = quadruped(THREE, { body: 0xE4B96B, legs: 0xD8A85A, headScale: 0.85 });
    g.children[0].scale.set(1.9, 0.8, 0.85);
    for (let i = 0; i < 10; i++) {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), M(THREE, 0x3A2A16));
      spot.position.set((Math.random() - 0.5) * 3, 1.4 + (Math.random() - 0.5), (Math.random() - 0.5) * 1.4); g.add(spot);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3, 6), M(THREE, 0xE4B96B));
    tail.position.set(-2.8, 1.6, 0); tail.rotation.z = 1.3; idle(tail, 'sway', 0.5, 3, 'x'); g.add(tail);
  } else if (kind === 'wolf') {
    g = quadruped(THREE, { body: 0x8A8F98, legs: 0x71767E, headScale: 0.9 });
    for (const dz of [0.35, -0.35]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 6), M(THREE, 0x71767E));
      ear.position.set(2.2, 2.7, dz); g.add(ear);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2, 6), M(THREE, 0x8A8F98));
    tail.position.set(-2.4, 1.5, 0); tail.rotation.z = 0.9; idle(tail, 'sway', 0.35, 2, 'x'); g.add(tail);
  } else if (kind === 'elephant') {
    g = quadruped(THREE, { body: 0x9AA0AA, legs: 0x878C96, size: 1.4, headScale: 1.1 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.22, 2.6, 8), M(THREE, 0x9AA0AA));
    trunk.position.set(3.5, 1.4, 0); trunk.rotation.z = 0.8; idle(trunk, 'sway', 0.25, 1.6, 'x'); g.add(trunk);
    for (const dz of [1, -1]) {
      const ear = new THREE.Mesh(new THREE.CircleGeometry(1.3, 16), M(THREE, 0x878C96, { side: THREE.DoubleSide }));
      ear.position.set(2.7, 2.4, dz * 1.1); ear.rotation.y = dz * 0.5; idle(ear, 'flap', 0.35, 3, 'y'); g.add(ear);
    }
  } else if (kind === 'whale') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), M(THREE, 0x5E86C6));
    body.scale.set(2.4, 1, 1); body.position.y = 1.8; idle(body, 'breathe', 0.03, 1.3); g.add(body);
    const fluke = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.5, 4), M(THREE, 0x4E76B6));
    fluke.position.set(-5, 1.8, 0); fluke.rotation.z = Math.PI / 2; fluke.scale.set(1, 1, 2.2);
    idle(fluke, 'sway', 0.3, 2, 'x'); g.add(fluke);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 4), M(THREE, 0x4E76B6));
    fin.position.set(1, 0.6, 1.8); fin.rotation.set(0.5, 0, 1); g.add(fin);
  } else if (kind === 'octopus') {
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), M(THREE, 0xB0568F));
    head.position.y = 2.6; head.scale.set(1, 1.2, 1); idle(head, 'breathe', 0.05, 2); g.add(head);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.6, 6), M(THREE, 0xC46BA0));
      arm.position.set(Math.cos(a) * 1.1, 1.1, Math.sin(a) * 1.1); arm.rotation.x = Math.sin(a) * 0.5; arm.rotation.z = Math.cos(a) * 0.5;
      idle(arm, 'wiggle', 0.25, 3 + i * 0.2, 'x'); g.add(arm);
    }
  } else if (kind === 'eagle') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), M(THREE, 0x7A5230));
    body.scale.set(1, 1.4, 1); body.position.y = 1.8; idle(body, 'breathe', 0.04, 2); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), M(THREE, 0xF2EFE6));
    head.position.set(0, 3, 0.2); g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 6), M(THREE, 0xE3A81E));
    beak.position.set(0, 3, 0.8); beak.rotation.x = Math.PI / 2; g.add(beak);
    for (const dx of [1, -1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.3), M(THREE, 0x6A4526));
      wing.position.set(dx * 1.8, 2, 0); idle(wing, 'flap', 0.5, 5, 'z'); g.add(wing);
    }
  } else if (kind === 'chameleon') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), M(THREE, 0x5BB86A, { emissive: 0x1e3a1e, emissiveIntensity: 0.2 }));
    body.scale.set(1.8, 1, 0.9); body.position.y = 1.6; idle(body, 'breathe', 0.04, 2); g.add(body);
    g.userData.colorBody = body;
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.16, 8, 16, Math.PI * 1.5), M(THREE, 0x5BB86A));
    tail.position.set(-1.9, 1.6, 0); tail.rotation.y = Math.PI / 2; g.add(tail);
    for (const dz of [0.5, -0.5]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), M(THREE, 0xE3C24A));
      eye.position.set(1.7, 2, dz); idle(eye, 'wiggle', 0.4, 3, 'y'); g.add(eye);
    }
  } else if (kind === 'bee') {
    for (let i = 0; i < 3; i++) {
      const band = new THREE.Mesh(new THREE.SphereGeometry(0.85 - i * 0.05, 14, 10), M(THREE, i % 2 ? 0x2A2A2A : 0xF2C21E));
      band.position.set(-i * 0.7 + 0.7, 2, 0); band.scale.set(0.8, 1, 1); g.add(band);
    }
    for (const dz of [0.6, -0.6]) {
      const wing = new THREE.Mesh(new THREE.CircleGeometry(0.8, 14), M(THREE, 0xCFEAFF, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      wing.position.set(0.4, 2.7, dz); wing.rotation.x = 1; idle(wing, 'flap', 0.6, 22, 'y'); g.add(wing);
    }
    idle(g, 'bobY', 0.3, 3);
  } else if (kind === 'penguin') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 12), M(THREE, 0x2B2B33));
    body.scale.set(1, 1.5, 0.9); body.position.y = 2; idle(body, 'breathe', 0.03, 2); g.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 10), M(THREE, 0xF2F4F7));
    belly.scale.set(1, 1.4, 0.6); belly.position.set(0, 2, 0.7); g.add(belly);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 6), M(THREE, 0xE3901E));
    beak.position.set(0, 3, 0.9); beak.rotation.x = Math.PI / 2; g.add(beak);
    for (const dx of [1, -1]) {
      const flip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.6), M(THREE, 0x2B2B33));
      flip.position.set(dx * 1.2, 2, 0); idle(flip, 'flap', 0.4, 4, 'z'); g.add(flip);
    }
    for (const dx of [0.4, -0.4]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), M(THREE, 0xE3901E));
      foot.position.set(dx, 0.6, 0.4); g.add(foot);
    }
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Savanna-style ground glow.
  const floor = new THREE.Mesh(new THREE.RingGeometry(R - 12, R + 14, 64),
    new THREE.MeshBasicMaterial({ color: 0xC79A3C, side: THREE.DoubleSide, transparent: true, opacity: 0.09 }));
  floor.rotation.x = Math.PI / 2; group.add(floor);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const island = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.2, 1.4, 20),
      new THREE.MeshStandardMaterial({ color: 0x6BA84E, roughness: 0.9 }));
    disc.position.y = -0.9; island.add(disc);

    const creature = buildCreature(THREE, def.build);
    island.add(creature);

    const p = ringPosition(i, keys.length, R, 5);
    island.position.set(p.x, p.y, p.z);
    island.userData = { key, def, focusRadius: 8, phase: Math.random() * 6, bobPhase: Math.random() * 6, baseY: p.y,
      anims: collectIdle(creature), colorBody: creature.userData.colorBody || null };
    attachMarker(THREE, island, isDone(key), 6.4);
    clickables.push(island);
    group.add(island);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.2;
      m.position.y = m.userData.baseY + Math.sin(t * 0.7 + m.userData.bobPhase) * 0.5;
      runIdle(m.userData.anims, t);
      if (m.userData.colorBody) { // chameleon colour-shift
        const h = (Math.sin(t * 0.5 + m.userData.phase) * 0.5 + 0.5) * 0.4 + 0.15;
        m.userData.colorBody.material.color.setHSL(h, 0.6, 0.5);
      }
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 120 } };
}

export default {
  key: 'animals',
  name: 'Animal Kingdom',
  icon: '🦁',
  blurb: 'Lions, whales, eagles & the champions of the animal world.',
  unlockCost: 24,
  theme: { primary: 0xF2A93B, secondary: 0xE0552B, bg: 0x1a1207, light: 0xFFE6B0, ambient: 0x5a4a2a },
  category: 'Nature & Life',
  masterTitle: 'Safari Master 🦁',
  subjects: SUBJECTS,
  build,
};
