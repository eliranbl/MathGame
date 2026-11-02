import { useCallback, useEffect, useRef, useState } from 'react';
import { phrases, speak, stopSpeaking, toClips } from '../audio/speech';
import { sfx } from '../audio/sfx';
import { nextDifficulty, pushRecent } from '../engine/adaptive';
import { generateQuestion, type Question } from '../engine/generator';
import type { LevelDef } from '../engine/levels';
import { generateReadingQuestion, type ReadingQuestion } from '../engine/reading/generator';
import { pointsFor, starsFor } from '../engine/scoring';
import type { RoundResult } from '../state/useGameData';
import { ChoiceButtons } from '../components/ChoiceButtons';
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
  startDifficulty: number;
  roundLength: number;
  profileColor: string;
  totalScore: number;
  muted: boolean;
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

export function PlayScreen({ level, startDifficulty, roundLength, profileColor, totalScore, muted, onToggleMute, onExit, onFinish }: Props) {
  const [question, setQuestion] = useState<AnyQuestion>(() => makeQuestion(level, startDifficulty));
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

  useEffect(() => {
    speak(question.speak);
  }, [question]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      stopSpeaking();
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
    setQuestion(makeQuestion(level, r.difficulty, r.recent));
    setIndex(next);
    setEggs((e) => e.map((s, i) => (i === next ? 'current' : s)));
    setAttempt(0);
    setWrongPicks([]);
    setTyped('');
    setPlaced([]);
    setFeedback('none');
  }, [index, roundLength, onFinish, level, question.key]);

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
      speak(question.world === 'reading' ? [phrases.tryAgain(), ...toClips(question.hintSpeak)] : phrases.tryAgain());
      return;
    }
    setEggs((e) => e.map((s, i) => (i === index ? 'missed' : s)));
    setFeedback('reveal');
    speak(question.revealSpeak);
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

      <main className={`play-card ${feedback === 'correct' ? 'play-card--correct' : ''}`} key={index}>
        <button className="speak-btn" onClick={() => speak(question.speak)} aria-label="הקראה חוזרת">
          🔊
        </button>
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
            onReplay={() => speak(question.speak)}
          />
        )}
        <div className="mascot">
          {bubble && <span className="mascot-bubble">{bubble}</span>}
          <Dino dino={avatarDino(profileColor)} mood={mood} size={120} />
        </div>
      </main>

      <section className="answer-area">
        {question.world === 'reading' ? (
          question.spell ? (
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
            value={typed}
            maxDigits={level.world === 'math' && level.maxHard >= 100 ? 3 : 2}
            disabled={locked}
            onChange={setTyped}
            onSubmit={() => answer(Number(typed))}
          />
        )}
      </section>
    </div>
  );
}
