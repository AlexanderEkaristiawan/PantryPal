// services/categoryService.ts
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
}

const CAT_COL = 'categories'

// ─── Default Categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'canned', name: 'Canned Goods' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'meat', name: 'Meat & Poultry' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'grains', name: 'Grains & Bread' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'condiments', name: 'Condiments & Sauces' },
  { id: 'other', name: 'Other' },
]

// ─── Get All Categories ───────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, CAT_COL), orderBy('name', 'asc'))
  const snap = await getDocs(q)

  if (snap.empty) return DEFAULT_CATEGORIES

  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category))
}

// ─── Add Category ─────────────────────────────────────────────────────────────

export async function addCategory(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, CAT_COL), { name })
  return docRef.id
}

// ─── Delete Category ──────────────────────────────────────────────────────────

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, CAT_COL, categoryId))
}

// ─── Seed Default Categories ──────────────────────────────────────────────────

export async function seedDefaultCategories(): Promise<void> {
  const existing = await getDocs(collection(db, CAT_COL))
  if (!existing.empty) return

  await Promise.all(
    DEFAULT_CATEGORIES.map(cat => addDoc(collection(db, CAT_COL), { name: cat.name }))
  )
}
