import client from "./client";
import type {
  Class,
  ClassCreate,
  ClassDetail,
  ClassUpdate,
  Student,
} from "../types/class";

export async function listClasses(): Promise<Class[]> {
  const response = await client.get<Class[]>("/classes/");
  return response.data;
}

export async function getClass(id: number): Promise<ClassDetail> {
  const response = await client.get<ClassDetail>(`/classes/${id}`);
  return response.data;
}

export async function createClass(data: ClassCreate): Promise<Class> {
  const response = await client.post<Class>("/classes/", data);
  return response.data;
}

export async function updateClass(
  id: number,
  data: ClassUpdate,
): Promise<Class> {
  const response = await client.patch<Class>(`/classes/${id}`, data);
  return response.data;
}

export async function deleteClass(id: number): Promise<void> {
  await client.delete(`/classes/${id}`);
}

export async function addStudent(
  classId: number,
  name: string,
): Promise<Student> {
  const response = await client.post<Student>(`/classes/${classId}/students`, {
    name,
  });
  return response.data;
}

export async function updateStudent(
  classId: number,
  studentId: number,
  name: string,
): Promise<Student> {
  const response = await client.patch<Student>(
    `/classes/${classId}/students/${studentId}`,
    { name },
  );
  return response.data;
}

export async function removeStudent(
  classId: number,
  studentId: number,
): Promise<void> {
  await client.delete(`/classes/${classId}/students/${studentId}`);
}
