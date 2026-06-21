// As regras do Firestore ainda estão em modo de teste (leitura/escrita aberta
// para qualquer um), como configurado no console. Antes de qualquer uso
// público real, isso precisa ser travado com regras adequadas — por exemplo:
// só o dono (ownerId) pode editar/excluir seu próprio projeto; qualquer
// pessoa pode criar uma validação (são anônimas, por design), mas ninguém
// deve poder editar ou apagar validações de outros.

import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type ContentType = "link" | "video" | "document" | "file";

export interface ProjectDoc {
  id: string;
  ownerId: string;
  title: string;
  contentType: ContentType;
  contentUrl: string;
  slug: string;
  createdAt: Timestamp | null;
}

const projectsCollection = collection(db, "projects");

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function createProject(data: {
  ownerId: string;
  title: string;
  contentType: ContentType;
  contentUrl: string;
}): Promise<string> {
  const slug = generateSlug();
  await addDoc(projectsCollection, {
    ...data,
    slug,
    createdAt: Timestamp.now(),
  });
  return slug;
}

export async function getProjectBySlug(slug: string): Promise<ProjectDoc | null> {
  const snapshot = await getDocs(query(projectsCollection, where("slug", "==", slug)));
  const docSnap = snapshot.docs[0];
  if (!docSnap) return null;
  return { id: docSnap.id, ...docSnap.data() } as ProjectDoc;
}

export async function getProjectsByOwner(ownerId: string): Promise<ProjectDoc[]> {
  const snapshot = await getDocs(query(projectsCollection, where("ownerId", "==", ownerId)));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ProjectDoc);
}

export interface ValidationDoc {
  id: string;
  projectId: string;
  designRating: number;
  uxRating: number;
  bugs: string;
  comment: string;
  createdAt: Timestamp | null;
}

const validationsCollection = collection(db, "validations");

export async function createValidation(data: {
  projectId: string;
  designRating: number;
  uxRating: number;
  bugs: string;
  comment: string;
}): Promise<void> {
  await addDoc(validationsCollection, {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function getValidationsByProject(projectId: string): Promise<ValidationDoc[]> {
  const snapshot = await getDocs(query(validationsCollection, where("projectId", "==", projectId)));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ValidationDoc);
}
