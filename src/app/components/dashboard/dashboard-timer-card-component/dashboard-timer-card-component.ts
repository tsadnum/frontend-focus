import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { FocusSessionService } from '../../../services/focus-session-service';
import { MatButton } from '@angular/material/button';
import { ChangeDetectorRef } from '@angular/core';
import {
  FocusSession,
  MODE_LABELS,
  POMODORO_TIMES,
  TimerMode
} from '../../../models/focus-session';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard-timer-card-component',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    NgIf
  ],
  templateUrl: './dashboard-timer-card-component.html',
  styleUrls: ['./dashboard-timer-card-component.css','../../../shared/styles/dashboard-cards.css']
})
export class DashboardTimerCardComponent implements OnInit, OnDestroy {

  mode: TimerMode = TimerMode.WORK;
  timeLeft = POMODORO_TIMES[this.mode];
  isRunning = false;
  hasStarted = false;
  sessionCount = 0;

  private timerSub: Subscription | null = null;
  private startTime!: Date;

  MODE_LABELS = MODE_LABELS;

  constructor(
    private focusSessionService: FocusSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.resetTimer();
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.hasStarted = true;
    this.startTime = new Date();

    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      this.cdr.detectChanges();
      if (this.timeLeft <= 0) this.completeSession();
    });
  }

  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.timerSub?.unsubscribe();
  }

  resetTimer() {
    if (this.isRunning) {
      this.saveSession();
    }

    this.pause();
    this.timeLeft = POMODORO_TIMES[this.mode];
    this.hasStarted = false;
  }

  skipSession() {
    if (this.isRunning || this.hasStarted) {
      this.completeSession();
      this.timeLeft = POMODORO_TIMES[this.mode];
      this.hasStarted = false;
    }
  }

  changeMode(newMode: TimerMode) {
    this.mode = newMode;
    this.resetTimer();
  }

  private completeSession() {
    this.isRunning = false;
    this.timerSub?.unsubscribe();
    this.saveSession();
    this.sessionCount++;
  }

  private saveSession() {
    const endTime = new Date();

    const dto: FocusSession = {
      sessionDate: this.formatDate(this.startTime),
      startTime: this.formatTime(this.startTime),
      endTime: this.formatTime(endTime),
      timerMode: this.mode
    };

    console.log('Saving session payload:', dto);

    this.focusSessionService.createSession(dto).subscribe({
      next: saved => console.log('Session saved', saved),
      error: err => console.error('Error saving session', err)
    });
  }

  formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  formatTime(d: Date): string {
    return d.toTimeString().slice(0, 8);
  }

  get minutes(): string {
    const m = Math.floor(this.timeLeft / 60);
    return String(m).padStart(2, '0');
  }

  get seconds(): string {
    const s = this.timeLeft % 60;
    return String(s).padStart(2, '0');
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }

  protected readonly TimerMode = TimerMode;
}
