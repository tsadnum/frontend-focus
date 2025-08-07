import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user-service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { UserEditDialogComponent } from '../user-edit-dialog-component/user-edit-dialog-component';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatOption, MatSelect} from '@angular/material/select';
import {DatePipe} from '@angular/common';
import {UserResponseDTO} from '../../../models/user';

@Component({
  selector: 'app-user-list-component',
  templateUrl: './user-list-component.html',
  styleUrls: ['./user-list-component.css'],
  imports: [
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSuffix,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatDatepickerInput,
    MatButton,
    MatOption,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    DatePipe,
    MatHeaderRow,
    MatRowDef,
    MatHeaderRowDef,
    MatRow,
    MatPaginator,
    MatSortHeader
  ]
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'status',
    'createdAt',
    'lastLoginAt',
    'roles',
    'actions',
  ];

  filter = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: ''
  };

  dataSource = new MatTableDataSource<UserResponseDTO>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(params?: any): void {
    this.userService.getUsers(params).subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  applyFilters(): void {
    const params: any = {};

    if (this.filter.startDate) {
      params.startDate = this.formatDate(this.filter.startDate);
    }

    if (this.filter.endDate) {
      params.endDate = this.formatDate(this.filter.endDate);
    }

    if (this.filter.status) {
      params.status = this.filter.status;
    }

    this.loadUsers(params);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  editUser(user: UserResponseDTO): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      data: { ...user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user.id, result).subscribe(() => {
          this.applyFilters();
        });
      }
    });
  }
}
