interface Props {
  listening: boolean;
  /** The microphone is really on; until then the button waits without pulsing. */
  recording: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function MicButton({ listening, recording, disabled, onPress }: Props) {
  return (
    <button
      className={`mic-btn ${recording ? 'mic-btn--on' : ''}`}
      onClick={onPress}
      disabled={disabled || listening}
      aria-label={recording ? 'מקשיב…' : 'לחץ וקרא בקול'}
    >
      🎤
    </button>
  );
}
