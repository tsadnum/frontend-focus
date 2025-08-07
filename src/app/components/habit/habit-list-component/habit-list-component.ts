import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {format, formatISO} from 'date-fns';
import {Habit} from '../../../models/habit';
import {HabitService} from '../../../services/habit-service';
import {HabitFormComponent} from '../habit-form-component/habit-form-component';
import {FormsModule, NgModel} from '@angular/forms';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatButton, MatFabButton, MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-habit-list-component',
  templateUrl: './habit-list-component.html',
  styleUrls: ['./habit-list-component.css'],
  imports: [
    FormsModule,
    MatSlideToggle,
    MatButton,
    NgForOf,
    MatFabButton,
    MatIcon,
    MatTooltip,
    MatIconButton,
    MatProgressSpinner,
    NgIf,
    RouterLink
  ]
})
export class HabitListComponent implements OnInit {
  habits: Habit[] = [];
  loading: boolean = false;


  constructor(private habitService: HabitService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits() {
    this.loading = true;
    this.habitService.getHabits().subscribe({
      next: (res) => {
        this.habits = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openForm(habit?: Habit) {
    const dialogRef = this.dialog.open(HabitFormComponent, {
      width: '500px',
      data: habit,
    });

    dialogRef.afterClosed().subscribe((result: Habit | undefined) => {
      if (!result?.id) {
        this.loadHabits();
        return;
      }

      const index = this.habits.findIndex(h => h.id === result.id);
      if (index > -1) {
        this.habits[index] = result;
      } else {
        this.habits.push(result);
      }

      this.habits.sort((a, b) => a.name.localeCompare(b.name));
      this.loadHabits();
    });
  }


  toggleActive(habit: Habit, event: MatSlideToggleChange) {
    this.habitService.updateHabit(habit.id!, habit)
      .subscribe({
        next: () => this.loadHabits(),
        error: () => {
          habit.active = !habit.active;
        }
      });
  }

  deleteHabit(id?: number) {
    if (!id) return;
    this.habitService.deleteHabit(id).subscribe(() => this.loadHabits());
  }

  markCompleted(habit: Habit) {
    const log = {
      habitId: habit.id!,
      completionTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      completed: true,
    };
    this.habitService.logHabit(log).subscribe(() => {
      alert(`Marked '${habit.name}' as done today`);
    });
  }
}
