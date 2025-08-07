import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-dashboard-profile-card-component',
  standalone: true,
  templateUrl: './dashboard-profile-card-component.html',
  styleUrls: ['./dashboard-profile-card-component.css','../../../shared/styles/dashboard-cards.css'],
  imports: [NgIf, MatCard, MatCardHeader, MatCardTitle, MatCardContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProfileCardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);

  readonly user = computed(() => this.dashboardDataService.user() ?? null);
}
