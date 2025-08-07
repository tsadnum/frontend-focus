import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  computed,
  signal
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../security/auth-service';
import { NotificationService } from '../../services/notification-service';
import { Notification } from '../../models/notification';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-layout-component',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIcon,
    MatButton,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    CommonModule
  ],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit, OnDestroy {
  private _notifications = signal<Notification[]>([]);
  readonly notifications = computed(() => this._notifications());
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.isRead).length
  );

  private pollSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (list) => this._notifications.set(list.slice(0, 20)),
      error: () => this._notifications.set([])
    });
  }

  private startPolling(): void {
    this.pollSub = this.notificationService
      .watchNewNotifications(30000)
      .subscribe({
        next: (list) => this._notifications.set(list.slice(0, 20)),
        error: err => console.error('Polling error:', err)
      });
  }

  markAsRead(id: number): void {
    const current = this._notifications();
    const target = current.find(n => n.id === id);
    if (!target || target.isRead) return;

    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        target.isRead = true;
        this._notifications.set([...current]);
      },
      error: err => console.error('Mark as read error:', err)
    });
  }

  markAllAsRead(): void {
    const unread = this._notifications().filter(n => !n.isRead);
    if (unread.length === 0) return;

    forkJoin(unread.map(n => this.notificationService.markAsRead(n.id))).subscribe({
      next: () => {
        unread.forEach(n => n.isRead = true);
        this._notifications.set([...this._notifications()]);
      },
      error: err => console.error('Mark all error:', err)
    });
  }

  deleteNotification(id: number): void {
    this._notifications.set(this._notifications().filter(n => n.id !== id));
  }

  clearAllNotifications(): void {
    this._notifications.set([]);
  }

  formatTime(sentAt: string): string {
    const time = new Date(sentAt);
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return time.toLocaleDateString();
  }

  trackByNotificationId(index: number, n: Notification): number {
    return n.id;
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      TASK_DUE_SOON: 'assignment_late',
      TASK_DUE: 'assignment_late',
      HABIT_MISSED: 'fitness_center',
      GOAL_NEAR_DEADLINE: 'flag',
      FOCUS_REMINDER: 'psychology',
      UPCOMING_EVENT: 'event',
      EVENT_UPCOMING: 'event',
      PHYSICAL_ACTIVITY_MISSED: 'directions_run'
    };
    return icons[type] || 'notifications';
  }
}
