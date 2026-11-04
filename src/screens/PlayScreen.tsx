import { useCallback, useEffect, useRef, useState } from 'react';
import { canListen, listen, stopListening } from '../audio/listen';
import { phrases, speak, stopSpeaking, toClips, type Speech } from '../audio/speech';
import { sfx } from '../audio/sfx';
import { nextDifficulty, pushRecent } from '../engine/adaptive';
import { generateQuestion, type Question } from '../engine/generator';
import type { LevelDef } from '../engine/levels';
import { generateReadingQuestion, type ReadingQuestion } from '../engine/reading/generator';
import { matchesSpoken } from '../engine/reading/match';
import { pointsFor, starsFor } from '../engine/scoring';
import type { RoundResult } from '../state/useGameData';
import { ChoiceButtons } from '../components/ChoiceButtons';
import { ExplainPanel } from '../components/ExplainPanel';
import { MicButton } from '../components/MicButton';
import { IconButton, ProgressEggs, ScoreBadge, type EggState } from '../components/Common';
import { Dino, type DinoMood } from '../components/Dino';
import { avatarDino } from '../components/dinos';
import { NumberPad } from '../components/NumberPad';
import { QuestionView } from '../components/QuestionView';
import { ReadingView } from '../components/ReadingView';
import { SpellTiles, nextSpellTile } from '../components/SpellBoard';
import { TileChoices } from '../components/TileChoices';

interface Props {
  level: LevelDef;
  /** Endless challenge: each question comes from a level picked here instead of `level`. */
  pickLevel?: () => LevelDef;
  startDifficulty: number;
  roundLength: number;
  profileColor: string;
  totalScore: number;
  muted: boolean;
  micEnabled: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  onFinish: (result: RoundResult) => void;
}

type Feedback = 'none' | 'correct' | 'wrong' | 'reveal';
type AnyQuestion = Question | ReadingQuestion;

function makeQuestion(level: LevelDef, difficulty: number, recent: string[] = []): AnyQuestion {
  return level.world === 'math'
    ? generateQuestion(level, difficulty, recent)
    : generateReadingQuestion(level, difficulty, recent);
}

const NEXT_DELAY = 1300;
const REVEAL_DELAY = 2600;

export function PlayScreen({ level, pickLevel, startDifficulty, roundLength, profileColor, totalScore, muted, micEnabled, onToggleMute, onExit, onFinish }: Props) {
  const levelFor = () => pickLevel?.() ?? level;
  const [qLevel, setQLevel] = useState(levelFor);
  const [question, setQuestion] = useState<AnyQuestion>(() => makeQuestion(qLevel, startDifficulty));
  const [index, setIndex] = useState(0);
  const [eggs, setEggs] = useState<EggState[]>(() =>
    Array.from({ length: roundLength }, (_, i) => (i === 0 ? 'current' : 'pending')),
  );
  const [attempt, setAttempt] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<(number | string)[]>([]);
  const [typed, setTyped] = useState('');
  /** Spelling level: indices of tiles already placed, in order. */
  const [placed, setPlaced] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [score, setScore] = useState(0);
  const [listening, setListening] = useState(false);
  /** The microphone is recording: the child can start talking. */
  const [recording, setRecording] = useState(false);
  /** The "how do you solve it?" steps are open. */
  const [explaining, setExplaining] = useState(false);

  // Values that change every answer but don't drive rendering.
  const round = useRef({
    difficulty: startDifficulty,
    streak: 0,
    correctFirstTry: 0,
    recent: [] as string[],
    mistakes: [] as string[],
    score: 0,
    startedAt: Date.now(),
  });
  const timer = useRef<number>();
  const current = useRef(question);
  current.current = question;

  // Read-aloud questions fall back to picking the picture when the microphone is off or unsupported.
  const useMic = question.world === 'reading' && !!question.say && micEnabled && canListen();
  const prompt: Speech = question.world === 'reading' && question.say && !useMic ? 'מה כתוב כאן?' : question.speak;

  useEffect(() => {
    speak(prompt);
  }, [question]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      stopSpeaking();
      stopListening();
    },
    [],
  );

  const advance = useCallback(() => {
    const r = round.current;
    const next = index + 1;
    if (next >= roundLength) {
      onFinish({
        levelId: level.id,
        total: roundLength,
        correctFirstTry: r.correctFirstTry,
        score: r.score,
        stars: starsFor(r.correctFirstTry, roundLength),
        difficulty: r.difficulty,
        mistakes: r.mistakes,
        seconds: Math.round((Date.now() - r.startedAt) / 1000),
      });
      return;
    }
    r.recent = pushRecent(r.recent, question.key);
    const nextLevel = levelFor();
    setQLevel(nextLevel);
    setQuestion(makeQuestion(nextLevel, r.difficulty, r.recent));
    setIndex(next);
    setEggs((e) => e.map((s, i) => (i === next ? 'current' : s)));
    setAttempt(0);
    setWrongPicks([]);
    setTyped('');
    setPlaced([]);
    setFeedback('none');
    setExplaining(false);
  }, [index, roundLength, onFinish, level, pickLevel, question.key]);

  const answer = (value: number | string) => {
    if (feedback === 'correct' || feedback === 'reveal') return;
    const r = round.current;

    if (value === question.answer) {
      const firstTry = attempt === 0;
      r.streak = firstTry ? r.streak + 1 : 0;
      if (firstTry) r.correctFirstTry++;
      r.difficulty = nextDifficulty(r.difficulty, true, r.streak);
      r.score += pointsFor(firstTry, r.streak);
      setScore(r.score);
      setEggs((e) => e.map((s, i) => (i === index ? (firstTry ? 'first' : 'second') : s)));
      setFeedback('correct');
      sfx.correct();
      speak(phrases.praise());
      timer.current = window.setTimeout(advance, NEXT_DELAY);
      return;
    }

    sfx.wrong();
    r.mistakes.push(question.key);
    r.streak = 0;
    setWrongPicks((w) => [...w, value]);
    setTyped('');
    if (attempt === 0) {
      r.difficulty = nextDifficulty(r.difficulty, false, 0);
      setAttempt(1);
      setFeedback('wrong');
      speak(question.hintSpeak ? [phrases.tryAgain(), ...toClips(question.hintSpeak)] : phrases.tryAgain());
      return;
    }
    setEggs((e) => e.map((s, i) => (i === index ? 'missed' : s)));
    setFeedback('reveal');
    // With an explanation, the child walks through it and moves on when closing it.
    if (question.world === 'math' && question.explain) {
      setExplaining(true);
      return;
    }
    speak(question.revealSpeak);
    timer.current = window.setTimeout(advance, REVEAL_DELAY);
  };

  const closeExplain = () => {
    setExplaining(false);
    if (feedback === 'reveal') advance();
    else speak(question.speak);
  };

  /** Division with a remainder fills two slots: ✓ on the first moves on to the remainder. */
  const twoSlots = question.world === 'math' && question.answer2 !== undefined;
  const slotValue = typed.split('|').pop()!;
  const submitTyped = () => {
    if (question.world !== 'math') return;
    if (twoSlots && !typed.includes('|')) {
      setTyped(`${typed}|`);
      return;
    }
    const [first, second] = typed.split('|').map(Number);
    answer(!twoSlots || second === question.answer2 ? first : -first - 1);
  };

  /** Read aloud: a match answers; a miss isn't counted as a mistake, since the recognizer may simply not have understood. */
  const hear = async () => {
    if (question.world !== 'reading' || !question.say || locked || listening) return;
    const q = question;
    setListening(true);
    const heard = await listen(q.lang, {
      accept: (h) => matchesSpoken(q.say!, h),
      onReady: () => {
        sfx.tap();
        setRecording(true);
      },
    });
    if (current.current !== q) return;
    setListening(false);
    setRecording(false);
    if (matchesSpoken(q.say!, heard)) {
      answer(q.answer);
      return;
    }
    round.current.streak = 0;
    if (attempt === 0) {
      setAttempt(1);
      setFeedback('wrong');
      speak([phrases.notHeard(), ...toClips(q.hintSpeak)]);
      return;
    }
    setEggs((e) => e.map((s, i) => (i === index ? 'second' : s)));
    setFeedback('reveal');
    speak(q.revealSpeak);
    timer.current = window.setTimeout(advance, REVEAL_DELAY);
  };

  /** Spelling: a right tile fills the next slot, a wrong one counts as a mistake. */
  const pickTile = (i: number) => {
    if (question.world !== 'reading' || !question.spell || locked) return;
    const { letters, tiles } = question.spell;
    if (tiles[i] !== letters[placed.length]) {
      answer(`tile:${i}`);
      return;
    }
    sfx.tap();
    const next = [...placed, i];
    setPlaced(next);
    if (next.length === letters.length) answer(question.answer);
  };

  const locked = feedback === 'correct' || feedback === 'reveal';
  const mood: DinoMood = feedback === 'correct' ? 'cheer' : feedback === 'wrong' || feedback === 'reveal' ? 'think' : 'happy';
  const bubble = feedback === 'correct' ? '🎉' : feedback === 'wrong' ? '🤔' : feedback === 'reveal' ? '💡' : null;

  return (
    <div className="screen play">
      <header className="topbar">
        <IconButton label="חזרה למפה" onClick={onExit}>
          🏠
        </IconButton>
        <ProgressEggs states={eggs} />
        <ScoreBadge score={totalScore + score} />
        <IconButton label={muted ? 'הפעלת קול' : 'השתקה'} onClick={onToggleMute}>
          {muted ? '🔇' : '🔊'}
        </IconButton>
      </header>

      <section className={`play-card ${feedback === 'correct' ? 'play-card--correct' : ''}`} key={index}>
        <button className="speak-btn" onClick={() => speak(prompt)} aria-label="הקראה חוזרת">
          🔊
        </button>
        {question.world === 'math' && question.explain && (attempt > 0 || feedback === 'reveal') && (
          <button className="explain-btn" onClick={() => setExplaining(true)} aria-label="איך פותרים?">
            💡
          </button>
        )}
        {question.world === 'math' ? (
          <QuestionView
            question={question}
            typed={typed}
            hint={attempt > 0}
            revealed={feedback === 'reveal' || (feedback === 'correct' && question.mode === 'pad')}
            wrongPicks={wrongPicks.filter((w): w is number => typeof w === 'number')}
            onPickGroup={answer}
          />
        ) : (
          <ReadingView
            question={question}
            placed={placed.length}
            revealed={feedback === 'reveal'}
            onReplay={() => speak(prompt)}
          />
        )}
        <div className="mascot">
          {bubble && <span className="mascot-bubble">{bubble}</span>}
          <Dino dino={avatarDino(profileColor)} mood={mood} size={120} />
        </div>
      </section>

      <section className="answer-area">
        {question.world === 'reading' ? (
          useMic ? (
            <MicButton listening={listening} recording={recording} disabled={locked} onPress={hear} />
          ) : question.spell ? (
            <SpellTiles
              tiles={question.spell.tiles}
              lang={question.lang}
              placed={placed}
              // A letter tapped too early is still needed later, so only letters not in the rest of the word stay disabled.
              wrong={wrongPicks
                .filter((w): w is string => typeof w === 'string')
                .map((w) => Number(w.slice(5)))
                .filter((i) => !question.spell!.letters.slice(placed.length).includes(question.spell!.tiles[i]))}
              hintTile={attempt > 0 && !locked ? nextSpellTile(question.spell, placed) : null}
              disabled={locked}
              onPick={pickTile}
            />
          ) : (
            <TileChoices
              choices={question.choices}
              style={question.choiceStyle}
              lang={question.lang}
              wrongPicks={wrongPicks.filter((w): w is string => typeof w === 'string')}
              correct={locked ? question.answer : null}
              disabled={locked}
              onPick={answer}
            />
          )
        ) : question.kind === 'compare' ? null : question.mode === 'choice' ? (
          <ChoiceButtons
            choices={question.choices}
            wrongPicks={wrongPicks.filter((w): w is number => typeof w === 'number')}
            correct={locked ? question.answer : null}
            disabled={locked}
            onPick={answer}
          />
        ) : (
          <NumberPad
            value={slotValue}
            maxDigits={qLevel.world === 'math' && qLevel.maxHard >= 100 ? 3 : 2}
            disabled={locked}
            onChange={(v) =>
              // Deleting in an empty remainder slot goes back to the first one.
              setTyped(typed.endsWith('|') && !v ? typed.slice(0, -1) : typed.includes('|') ? `${typed.split('|')[0]}|${v}` : v)
            }
            onSubmit={submitTyped}
          />
        )}
      </section>

      {explaining && question.world === 'math' && question.explain && <ExplainPanel steps={question.explain} onClose={closeExplain} />}
    </div>
  );
}
