export interface UserResponseDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
  roles: string[];
}

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED' ;

export interface UserRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: UserStatus;
}
