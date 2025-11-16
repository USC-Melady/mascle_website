export interface PersonBase {
  id: string;
  name: string;
  title: string;
  image: string;
  email: string;
  website?: string;
  interests?: string[];
}

export interface Faculty extends PersonBase {
  type: 'faculty';
  position: string;
  department: string;
  researchAreas: string[];
  publications?: string[];
}

export interface Student extends PersonBase {
  type: 'student';
  program: 'PhD' | 'Masters' | 'Undergraduate';
  advisor: string;
  graduationYear: number;
  thesis?: string;
}

export type Person = Faculty | Student; 