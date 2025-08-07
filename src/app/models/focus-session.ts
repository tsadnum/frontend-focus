export interface FocusSession {
  sessionDate: string;
  startTime: string;
  endTime: string;
  timerMode: TimerMode;
}

export enum TimerMode {
  WORK = 'WORK',
  SHORT_BREAK='SHORT_BREAK',
  LONG_BREAK='LONG_BREAK',
}

export const POMODORO_TIMES: Record<TimerMode, number> = {
  WORK: 35 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60
};

export const MODE_LABELS: Record<TimerMode, string> = {
  WORK: 'Work',
  SHORT_BREAK: 'Short Break',
  LONG_BREAK: 'Long Break'
};
