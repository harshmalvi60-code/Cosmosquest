/**
 * Quiz logic — turns a subject's authored questions into a normalized,
 * shuffled set the UI can render, and handles difficulty scaling.
 *
 * Authored question shapes (any may appear in a subject's `quiz` array):
 *   Legacy MC : ["question", ["a","b","c","d"], answerIndex]
 *   MC        : { t:'mc',  q, options:[...],           answer:index }
 *   True/False: { t:'tf',  q,                          answer:true|false }
 *   Picture   : { t:'pic', q, options:[{shape,color,label}], answer:index }
 *
 * Difficulty: a subject may also provide `quizHard` (two-step reasoning).
 * Once a kid has completed enough of a world, later missions swap in the
 * harder set so recall gives way to thinking.
 */

export function normalizeQuestion(raw) {
  if (Array.isArray(raw)) {
    return { kind: 'mc', q: raw[0], options: raw[1].slice(), answer: raw[2] };
  }
  const kind = raw.t || 'mc';
  if (kind === 'tf') {
    return { kind: 'tf', q: raw.q, answer: !!raw.answer };
  }
  if (kind === 'pic') {
    return { kind: 'pic', q: raw.q, options: raw.options.map((o) => ({ ...o })), answer: raw.answer };
  }
  return { kind: 'mc', q: raw.q, options: raw.options.slice(), answer: raw.answer };
}

/**
 * Decide difficulty (0 = base, 1 = harder) from how much of the world is done.
 * Harder questions kick in once the player is past the first third.
 */
export function difficultyFor(progressDone, progressTotal) {
  if (progressTotal <= 0) return 0;
  return progressDone >= Math.ceil(progressTotal / 3) ? 1 : 0;
}

export function buildQuiz(subject, difficulty = 0) {
  const source = (difficulty >= 1 && subject.quizHard) ? subject.quizHard : subject.quiz;
  return source.map(normalizeQuestion);
}

/** Fisher–Yates, returns a new array. */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
