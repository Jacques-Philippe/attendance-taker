export interface Student {
  id: number;
  name: string;
  classId: number;
}

export interface Class {
  id: number;
  name: string;
  period: string;
  teacherId: number;
}

export interface ClassDetail extends Class {
  students: Student[];
}

export interface ClassCreate {
  name: string;
  period: string;
}

export interface ClassUpdate {
  name?: string;
  period?: string;
}
