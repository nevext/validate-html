// As regras do Firestore ainda estão em modo de teste (leitura/escrita aberta
// para qualquer um), como configurado no console. Antes de qualquer uso
// público real, isso precisa ser travado com regras adequadas — por exemplo:
// - projects: leitura aberta; escrita só se request.auth.uid == ownerId.
// - builds: leitura aberta (a página pública precisa ler sem login); criação/
//   edição só se request.auth.uid == ownerId (denormalizado na própria build
//   pra não precisar de um get() cruzado até o projeto).
// - validations: criação aberta pra qualquer um (são anônimas, por design),
//   mas sem permitir update/delete — validações devem ser imutáveis.
// - users: leitura/escrita só do próprio dono (request.auth.uid == doc id).

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type ContentType = "link" | "video" | "document" | "file";
export type BuildStatus = "green" | "yellow" | "red" | "blue" | "gray";

export interface ProjectDoc {
  id: string;
  ownerId: string;
  ownerEmail: string;
  title: string;
  contentType: ContentType;
  createdAt: Timestamp | null;
}

export interface BuildDoc {
  id: string;
  projectId: string;
  ownerId: string;
  label: string;
  contentUrl: string;
  slug: string;
  ownerNote: string;
  status: BuildStatus;
  previousBuildId: string | null;
  createdAt: Timestamp | null;
}

export interface ValidationDoc {
  id: string;
  buildId: string;
  ratings: Record<string, number>;
  bugs: string;
  comment: string;
  createdAt: Timestamp | null;
}

const projectsCollection = collection(db, "projects");
const buildsCollection = collection(db, "builds");
const validationsCollection = collection(db, "validations");

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}

function sortByCreatedAtDesc<T extends { createdAt: Timestamp | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

// ---------- projects ----------

export async function createProject(data: {
  ownerId: string;
  ownerEmail: string;
  title: string;
  contentType: ContentType;
}): Promise<string> {
  const docRef = await addDoc(projectsCollection, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getProject(id: string): Promise<ProjectDoc | null> {
  const docSnap = await getDoc(doc(projectsCollection, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as ProjectDoc;
}

export async function getProjectsByOwner(ownerId: string): Promise<ProjectDoc[]> {
  const snapshot = await getDocs(query(projectsCollection, where("ownerId", "==", ownerId)));
  const projects = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ProjectDoc);
  return sortByCreatedAtDesc(projects);
}

// ---------- builds ----------

export async function createBuild(data: {
  projectId: string;
  ownerId: string;
  label: string;
  contentUrl: string;
  ownerNote: string;
  previousBuildId: string | null;
}): Promise<{ id: string; slug: string }> {
  const slug = generateSlug();
  const docRef = await addDoc(buildsCollection, {
    ...data,
    slug,
    status: "gray" satisfies BuildStatus,
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id, slug };
}

export async function getBuild(id: string): Promise<BuildDoc | null> {
  const docSnap = await getDoc(doc(buildsCollection, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as BuildDoc;
}

export async function getBuildBySlug(slug: string): Promise<BuildDoc | null> {
  const snapshot = await getDocs(query(buildsCollection, where("slug", "==", slug)));
  const docSnap = snapshot.docs[0];
  if (!docSnap) return null;
  return { id: docSnap.id, ...docSnap.data() } as BuildDoc;
}

export async function getBuildsByProject(projectId: string): Promise<BuildDoc[]> {
  const snapshot = await getDocs(query(buildsCollection, where("projectId", "==", projectId)));
  const builds = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as BuildDoc);
  return sortByCreatedAtDesc(builds);
}

export async function updateBuildStatus(buildId: string, status: BuildStatus): Promise<void> {
  await updateDoc(doc(buildsCollection, buildId), { status });
}

// ---------- validations ----------

export async function createValidation(data: {
  buildId: string;
  ratings: Record<string, number>;
  bugs: string;
  comment: string;
}): Promise<void> {
  await addDoc(validationsCollection, {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function getValidationsByBuild(buildId: string): Promise<ValidationDoc[]> {
  const snapshot = await getDocs(query(validationsCollection, where("buildId", "==", buildId)));
  const validations = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ValidationDoc);
  return sortByCreatedAtDesc(validations);
}

// ---------- user profile ----------

export interface UserProfile {
  course: string;
  university: string;
}

const usersCollection = collection(db, "users");

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(usersCollection, uid));
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
}

export async function upsertUserProfile(uid: string, data: UserProfile): Promise<void> {
  await setDoc(doc(usersCollection, uid), data, { merge: true });
}
