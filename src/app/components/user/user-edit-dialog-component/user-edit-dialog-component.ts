import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {UserRequestDTO} from '../../../models/user';

@Component({
  selector: 'app-user-edit-dialog-component',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatSelect,
    MatDialogActions,
    MatButton,
  ],
  templateUrl: './user-edit-dialog-component.html',
  styleUrl: './user-edit-dialog-component.css'
})
export class UserEditDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserRequestDTO,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      email: [data.email, [Validators.required, Validators.email]],
      firstName: [data.firstName, Validators.required],
      lastName: [data.lastName, Validators.required],
      roles: [data.roles, Validators.required],
      status: [data.status, Validators.required]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
