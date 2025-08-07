import {
  Component,
  OnInit,
  ViewChild,
  inject,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../../services/event-service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventFormComponent } from '../event-form-component/event-form-component';
import { EventRequestDTO, EventResponseDTO } from '../../../models/event';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-event-calendar-component',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
    MatProgressSpinner
  ],
  templateUrl: './event-calendar-component.html',
  styleUrls: ['./event-calendar-component.css']
})
export class EventCalendarComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  events: EventResponseDTO[] = [];
  loading = false;
  currentView = 'dayGridMonth';
  currentDate = new Date();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: 'auto',
    selectable: true,
    selectMirror: true,
    editable: true,
    droppable: true,
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    weekends: true,
    firstDay: 1,
    locale: 'en',

    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    datesSet: this.handleDatesSet.bind(this),

    eventDisplay: 'block',
    eventBackgroundColor: 'transparent',
    eventBorderColor: 'transparent',
    eventTextColor: '#ffffff',

    eventDidMount: this.eventDidMount.bind(this),

    events: []
  };

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: EventResponseDTO[]) => {
          this.events = data;
          this.calendarOptions.events = this.mapEventsToCalendar(data);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.loading = false;
        }
      });
  }

  private mapEventsToCalendar(events: EventResponseDTO[]): EventInput[] {
    return events.map(event => ({
      id: String(event.id),
      title: event.title,
      start: event.startDateTime,
      end: event.endDateTime,
      extendedProps: {
        description: event.description || '',
        location: event.location || '',
        originalEvent: event
      },
      classNames: ['custom-event']
    }));
  }


  handleDateSelect(selectInfo: DateSelectArg): void {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        mode: 'create',
        startDate: selectInfo.startStr,
        endDate: selectInfo.endStr
      },
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'create') {
        const newEvent: EventRequestDTO = {
          ...result.data,
          startDateTime: this.toLocalISOString(new Date(selectInfo.startStr)),
          endDateTime: this.toLocalISOString(new Date(selectInfo.endStr))
        };
        this.loading = true;
        this.eventService.create(newEvent)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadEvents();
            },
            error: (error) => {
              console.error('Error creating event:', error);
              this.loading = false;
            }
          });
      }

      this.calendarComponent?.getApi().unselect();
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const eventId = +clickInfo.event.id!;
    const existingEvent = this.events.find(e => e.id === eventId);
    if (!existingEvent) return;

    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        mode: 'edit',
        event: existingEvent
      },
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.action === 'delete') {
        this.deleteEvent(eventId);
      } else if (result.action === 'update') {
        this.updateEvent(eventId, result.data);
      }
    });
  }

  handleEventDrop(dropInfo: EventDropArg): void {
    const eventId = +dropInfo.event.id!;
    const existingEvent = this.events.find(e => e.id === eventId);
    if (!existingEvent) {
      dropInfo.revert();
      return;
    }

    const updatedEvent: EventRequestDTO = {
      title: existingEvent.title,
      description: existingEvent.description,
      location: existingEvent.location,
      startDateTime: this.toLocalISOString(dropInfo.event.start!),
      endDateTime: this.toLocalISOString(dropInfo.event.end || dropInfo.event.start!)
    };

    this.eventService.update(eventId, updatedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadEvents(),
        error: (error) => {
          console.error('Error moving event:', error);
          dropInfo.revert();
        }
      });
  }

  handleEventResize(resizeInfo: any): void {
    const eventId = +resizeInfo.event.id!;
    const existingEvent = this.events.find(e => e.id === eventId);
    if (!existingEvent) {
      resizeInfo.revert();
      return;
    }

    const updatedEvent: EventRequestDTO = {
      title: existingEvent.title,
      description: existingEvent.description,
      location: existingEvent.location,
      startDateTime: this.toLocalISOString(resizeInfo.event.start!),
      endDateTime: this.toLocalISOString(resizeInfo.event.end || resizeInfo.event.start!)
    };

    this.eventService.update(eventId, updatedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadEvents(),
        error: (error) => {
          console.error('Error resizing event:', error);
          resizeInfo.revert();
        }
      });
  }

  handleDatesSet(dateInfo: any): void {
    this.currentView = dateInfo.view.type;
    this.currentDate = dateInfo.view.currentStart;
  }

  private updateEvent(eventId: number, eventData: EventRequestDTO): void {
    this.loading = true;
    this.eventService.update(eventId, eventData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadEvents(),
        error: (error) => {
          console.error('Error updating event:', error);
          this.loading = false;
        }
      });
  }

  private deleteEvent(eventId: number): void {
    this.loading = true;
    this.eventService.delete(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadEvents(),
        error: (error) => {
          console.error('Error deleting event:', error);
          this.loading = false;
        }
      });
  }

  goToToday(): void {
    this.calendarComponent?.getApi().today();
  }

  refreshEvents(): void {
    this.loadEvents();
  }

  createEventToday(): void {
    const now = new Date();
    const isoNow = now.toISOString();

    this.handleDateSelect({
      start: now,
      end: now,
      startStr: isoNow,
      endStr: isoNow,
      allDay: false,
      view: this.calendarComponent?.getApi().view!,
      jsEvent: null,
      dayEl: null,
      el: null
    } as DateSelectArg);
  }

  private toLocalISOString(date: Date): string {
    return date.toISOString().split('.')[0];
  }

  private eventDidMount(info: any): void {
    const element = info.el;

    element.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    element.style.border = '1px solid rgba(107, 114, 128, 0.3)';
    element.style.borderRadius = '12px';
    element.style.padding = '4px 8px';
    element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    element.style.transition = 'all 0.3s ease';

    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateY(-2px) scale(1.02)';
      element.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0) scale(1)';
      element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    });
  }
}
