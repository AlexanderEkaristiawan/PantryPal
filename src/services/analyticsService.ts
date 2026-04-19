// services/analyticsService.ts
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import { FoodStatus } from './foodService'
import { ListingStatus } from './donationService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FoodSavedStats {
  totalItemsSaved: number
  totalQuantitySaved: number
}

export interface DonationStats {
  totalDonationsPosted: number
  totalDonationsClaimed: number
}

export interface WasteAvoidedStats {
  totalWasteAvoided: number
  breakdown: {
    used: number
    donated: number
  }
}

export interface MonthlyBreakdownEntry {
  month: string   // e.g. 'Jan 2026'
  saved: number
  donated: number
}

export interface CategoryBreakdownEntry {
  category: string
  count: number
}

export interface FullAnalytics {
  foodSaved: FoodSavedStats
  donationStats: DonationStats
  wasteAvoided: WasteAvoidedStats
  monthlyBreakdown: MonthlyBreakdownEntry[]
  categoryBreakdown: CategoryBreakdownEntry[]
}

// ─── Food Saved Stats ─────────────────────────────────────────────────────────

export async function getFoodSavedStats(uid: string): Promise<FoodSavedStats> {
  const q = query(
    collection(db, 'food'),
    where('user_id', '==', uid),
    where('status', '==', FoodStatus.USED)
  )
  const snap = await getDocs(q)
  const items = snap.docs.map(d => d.data())

  return {
    totalItemsSaved: items.length,
    totalQuantitySaved: items.reduce((sum, item) => sum + (item['quantity'] ?? 0), 0),
  }
}

// ─── Donation Stats ───────────────────────────────────────────────────────────

export async function getDonationStats(uid: string): Promise<DonationStats> {
  const q = query(
    collection(db, 'donationListings'),
    where('user_id', '==', uid)
  )
  const snap = await getDocs(q)
  const allListings = snap.docs.map(d => d.data())

  const claimed = allListings.filter(
    l => l['status'] === ListingStatus.CLAIMED || l['status'] === ListingStatus.COMPLETED
  )

  return {
    totalDonationsPosted: allListings.length,
    totalDonationsClaimed: claimed.length,
  }
}

// ─── Waste Avoided Stats ──────────────────────────────────────────────────────

export async function getWasteAvoidedStats(uid: string): Promise<WasteAvoidedStats> {
  const q = query(collection(db, 'food'), where('user_id', '==', uid))
  const snap = await getDocs(q)
  const items = snap.docs.map(d => d.data())

  const wasteAvoided = items.filter(
    item => item['status'] === FoodStatus.USED || item['status'] === FoodStatus.DONATED
  )

  return {
    totalWasteAvoided: wasteAvoided.length,
    breakdown: {
      used: wasteAvoided.filter(i => i['status'] === FoodStatus.USED).length,
      donated: wasteAvoided.filter(i => i['status'] === FoodStatus.DONATED).length,
    },
  }
}

// ─── Monthly Breakdown ────────────────────────────────────────────────────────

export async function getMonthlyBreakdown(uid: string): Promise<MonthlyBreakdownEntry[]> {
  const q = query(
    collection(db, 'food'),
    where('user_id', '==', uid),
    orderBy('created_at', 'asc')
  )
  const snap = await getDocs(q)
  const items = snap.docs.map(d => d.data())

  const monthMap: Record<string, MonthlyBreakdownEntry> = {}

  items.forEach(item => {
    if (!item['created_at']) return
    const date = item['created_at'].toDate
      ? item['created_at'].toDate()
      : new Date(item['created_at'])
    const key = date.toLocaleString('default', { month: 'short', year: 'numeric' })

    if (!monthMap[key]) monthMap[key] = { month: key, saved: 0, donated: 0 }
    if (item['status'] === FoodStatus.USED) monthMap[key].saved++
    if (item['status'] === FoodStatus.DONATED) monthMap[key].donated++
  })

  return Object.values(monthMap)
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

export async function getCategoryBreakdown(uid: string): Promise<CategoryBreakdownEntry[]> {
  const q = query(collection(db, 'food'), where('user_id', '==', uid))
  const snap = await getDocs(q)
  const items = snap.docs.map(d => d.data())

  const categoryMap: Record<string, number> = {}
  items.forEach(item => {
    const cat: string = item['category_id'] ?? 'Uncategorized'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
  })

  return Object.entries(categoryMap).map(([category, count]) => ({ category, count }))
}

// ─── Full Analytics ───────────────────────────────────────────────────────────

export async function getFullAnalytics(uid: string): Promise<FullAnalytics> {
  const [foodSaved, donationStats, wasteAvoided, monthlyBreakdown, categoryBreakdown] =
    await Promise.all([
      getFoodSavedStats(uid),
      getDonationStats(uid),
      getWasteAvoidedStats(uid),
      getMonthlyBreakdown(uid),
      getCategoryBreakdown(uid),
    ])

  return { foodSaved, donationStats, wasteAvoided, monthlyBreakdown, categoryBreakdown }
}
