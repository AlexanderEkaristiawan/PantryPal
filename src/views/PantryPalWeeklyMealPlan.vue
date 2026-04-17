<template>
  <div class="sp-wrap">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">🌿 PantryPal</div>
      <nav>
        <div
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: item.active }"
          @click="navigateTo(item.route)"
        >
          <span class="nav-dot"></span>
          {{ item.label }}
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <!-- Topbar -->
      <header class="topbar">
        <span class="logo-text">🌿 SavePlate</span>
        <div style="flex: 1"></div>
        <button class="tb-btn position-relative">
          Notifications
          <span class="badge">2</span>
        </button>
        <button class="tb-btn">Settings</button>
        <button class="tb-btn">Log out</button>
      </header>

      <!-- Content Grid -->
      <div class="content">
        <!-- Calendar Card -->
        <div class="card cal-card">
          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <span class="cal-month">{{ currentMonthYear }}</span>
            <button class="cal-nav" @click="nextMonth">›</button>
          </div>
          <div class="cal-grid">
            <div v-for="day in dayLabels" :key="day" class="cal-day-label">
              {{ day }}
            </div>
            <div
              v-for="day in calendarDays"
              :key="day.dateKey"
              class="cal-day"
              :class="{
                'other-month': !day.isCurrentMonth,
                today: day.isToday,
                selected: day.isSelected,
              }"
              @click="selectDate(day.date)"
            >
              {{ day.dayOfMonth }}
            </div>
          </div>
        </div>

        <!-- Meal Detail Card -->
        <div class="card meal-detail-card">
          <div class="meal-date-title">{{ formattedSelectedDate }}</div>
          <div v-for="slot in mealSlots" :key="slot.type" class="meal-slot">
            <div class="meal-slot-header">{{ slot.label }}</div>
            <div class="meal-slot-body">
              <span v-if="slot.meal" class="meal-name">{{ slot.meal }}</span>
              <span v-else class="meal-empty">Not planned yet</span>
              <button class="meal-edit-btn">
                {{ slot.meal ? 'Edit' : '+ Add' }}
              </button>
            </div>
          </div>
          <div class="meal-actions">
            <button class="meal-action-btn">Create Meal</button>
            <button class="meal-action-btn primary">Browse Recommendation</button>
          </div>
          <button class="save-btn">Save</button>
        </div>

        <!-- Inventory Card -->
        <div class="card inv-card">
          <div class="card-title">Inventory</div>
          <div class="inv-search-row">
            <input
              v-model="inventorySearch"
              placeholder="Search items..."
              class="form-control form-control-sm"
            />
            <button class="filter-btn-sm">Filter</button>
          </div>
          <div v-for="item in filteredInventory" :key="item.id" class="inv-item">
            <div class="inv-icon">{{ item.icon }}</div>
            <div class="inv-info">
              <div class="inv-name">{{ item.name }}</div>
              <div class="inv-sub">{{ item.location }} · Exp: {{ item.expiry }}</div>
            </div>
            <span v-if="item.warning" class="inv-tag warn">{{ item.tag }}</span>
            <button class="inv-add-btn">Add</button>
          </div>
        </div>

        <!-- Create Meal & Recommendations -->
        <div class="create-card">
          <div class="create-inner">
            <div class="card-title">Create New Meal</div>
            <div class="form-field">
              <label>Meal name</label>
              <input
                v-model="newMealName"
                placeholder="e.g. Nasi Goreng"
                class="form-control form-control-sm"
              />
            </div>
            <div class="form-field">
              <label>Ingredients used</label>
              <div v-for="(ing, idx) in selectedIngredients" :key="idx" class="ingr-item">
                {{ ing.icon }} {{ ing.name }}
                <span
                  style="margin-left: auto; color: #d85a30; cursor: pointer"
                  @click="removeIngredient(idx)"
                  >✕</span
                >
              </div>
              <div class="add-ingr" @click="showIngredientSelector = true">+ Add ingredients</div>
            </div>
            <button class="add-meal-btn" @click="addMeal">Add Meal</button>
          </div>

          <div class="create-inner">
            <div class="card-title">Recommendations</div>
            <div v-for="rec in recommendations" :key="rec.id" class="reco-item">
              <div class="reco-icon">{{ rec.icon }}</div>
              <div class="reco-info">
                <div class="reco-name">{{ rec.name }}</div>
                <div class="reco-sub">Uses: {{ rec.uses }}</div>
              </div>
              <button class="reco-add">+ Plan</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface InventoryItem {
  id: number
  icon: string
  name: string
  location: string
  expiry: string
  tag?: string
  warning?: boolean
}

interface Recommendation {
  id: number
  icon: string
  name: string
  uses: string
}

const router = useRouter()

const navItems = ref([
  { label: 'Dashboard', active: false, route: '/' },
  { label: 'Inventory', active: false, route: '/inventory' },
  { label: 'Meal Plan', active: true, route: '/meal-plan' },
  { label: 'Donation', active: false, route: '/donations' },
  { label: 'Analytics', active: false, route: '/analytics' },
  { label: 'Settings', active: false, route: '/settings' },
])

// Calendar state
const currentDate = ref(new Date(2026, 3, 14)) // April 14, 2026 (month index 3)
const selectedDate = ref(new Date(2026, 3, 14))

const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  dateKey: string
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month days
  const prevMonthDate = new Date(year, month, 0)
  const daysInPrevMonth = prevMonthDate.getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i)
    days.push({
      date,
      dayOfMonth: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      isSelected: date.getTime() === selectedDate.value.getTime(),
      dateKey: date.toISOString(),
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({
      date,
      dayOfMonth: d,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isSelected: date.getTime() === selectedDate.value.getTime(),
      dateKey: date.toISOString(),
    })
  }

  // Next month days to fill 42 cells (6 rows)
  const remainingCells = 42 - days.length
  for (let d = 1; d <= remainingCells; d++) {
    const date = new Date(year, month + 1, d)
    days.push({
      date,
      dayOfMonth: d,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      isSelected: date.getTime() === selectedDate.value.getTime(),
      dateKey: date.toISOString(),
    })
  }

  return days
})

const formattedSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = new Date(date)
  selectedDate.value.setHours(0, 0, 0, 0)
}

// Meal slots for selected date
const mealSlots = ref([
  { type: 'breakfast', label: 'Breakfast', meal: 'Cereal with UltraMilk' },
  { type: 'lunch', label: 'Lunch', meal: 'Chicken Wings' },
  { type: 'dinner', label: 'Dinner', meal: 'Chicken Katsu' },
  { type: 'snacks', label: 'Snacks', meal: '' },
])

// Inventory
const inventorySearch = ref('')
const inventoryItems = ref<InventoryItem[]>([
  {
    id: 1,
    icon: '🥛',
    name: 'UltraMilk · 500ml Original',
    location: 'Fridge',
    expiry: '6 Apr 2026',
    tag: '2d',
    warning: true,
  },
  {
    id: 2,
    icon: '🍞',
    name: 'Loaf of Bread · 300g',
    location: 'Pantry',
    expiry: '18 Apr 2026',
  },
  {
    id: 3,
    icon: '🍚',
    name: 'Leftover Rice',
    location: 'Fridge',
    expiry: '18 Apr 2026',
  },
  {
    id: 4,
    icon: '🥚',
    name: 'Eggs · 6 pcs',
    location: 'Fridge',
    expiry: '25 Apr 2026',
  },
])

const filteredInventory = computed(() => {
  if (!inventorySearch.value) return inventoryItems.value
  const q = inventorySearch.value.toLowerCase()
  return inventoryItems.value.filter(
    (item) => item.name.toLowerCase().includes(q) || item.location.toLowerCase().includes(q),
  )
})

// Create meal form
const newMealName = ref('')
const selectedIngredients = ref<{ icon: string; name: string }[]>([
  { icon: '🥛', name: 'UltraMilk · 500ml Original' },
  { icon: '🍞', name: 'Loaf of Bread · 300g' },
])
const showIngredientSelector = ref(false)

const removeIngredient = (index: number) => {
  selectedIngredients.value.splice(index, 1)
}

const addMeal = () => {
  // In a real app, this would save to Firestore
  alert(`Meal "${newMealName.value}" added!`)
  newMealName.value = ''
  selectedIngredients.value = []
}

// Recommendations
const recommendations = ref<Recommendation[]>([
  {
    id: 1,
    icon: '🍛',
    name: 'Nasi Goreng',
    uses: 'Rice, Eggs, Chicken',
  },
  {
    id: 2,
    icon: '🍜',
    name: 'Mie Goreng',
    uses: 'Noodles, Eggs, Veggies',
  },
  {
    id: 3,
    icon: '🥞',
    name: 'Milk Pancakes',
    uses: 'UltraMilk, Eggs, Flour',
  },
])

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<style scoped>
@import '../assets/variables.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.sp-wrap {
  display: flex;
  min-height: 100vh;
  background: var(--color-background-tertiary);
}

.sidebar {
  width: 180px;
  min-width: 180px;
  background: var(--color-background-primary);
  border-right: 0.5px solid var(--color-border-tertiary);
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.sidebar .logo {
  padding: 0.5rem 1rem 1.5rem;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  border-bottom: 0.5px solid var(--color-border-tertiary);
  margin-bottom: 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 1rem;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.nav-item:hover {
  background: var(--color-background-secondary);
}

.nav-item.active {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-weight: 500;
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border-secondary);
  flex-shrink: 0;
}

.nav-item.active .nav-dot {
  background: #1d9e75;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  background: var(--color-background-primary);
  border-bottom: 0.5px solid var(--color-border-tertiary);
  padding: 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.tb-btn {
  padding: 5px 12px;
  font-size: 12px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #d85a30;
  border-radius: 50%;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
}

.card {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  padding: 1rem 1.25rem;
}

.card-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
}

/* Calendar */
.cal-card {
  grid-column: 1/2;
  grid-row: 1/2;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.cal-month {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.cal-nav {
  background: none;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day-label {
  text-align: center;
  font-size: 10px;
  color: var(--color-text-tertiary);
  padding: 4px 0;
  font-weight: 500;
}

.cal-day {
  text-align: center;
  font-size: 12px;
  padding: 5px 2px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.cal-day:hover {
  background: var(--color-background-secondary);
}

.cal-day.today {
  background: #1d9e75;
  color: #fff;
  font-weight: 500;
}

.cal-day.selected {
  background: #e1f5ee;
  color: #0f6e56;
  font-weight: 500;
}

.cal-day.other-month {
  color: var(--color-text-tertiary);
}

/* Meal detail */
.meal-detail-card {
  grid-column: 2/3;
  grid-row: 1/2;
}

.meal-date-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.meal-slot {
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  margin-bottom: 8px;
  overflow: hidden;
}

.meal-slot-header {
  padding: 6px 10px;
  background: var(--color-background-secondary);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meal-slot-body {
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meal-name {
  font-size: 13px;
  color: var(--color-text-primary);
}

.meal-edit-btn {
  font-size: 11px;
  padding: 3px 10px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: none;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.meal-empty {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.meal-actions {
  display: flex;
  gap: 8px;
  margin-top: 0.75rem;
}

.meal-action-btn {
  flex: 1;
  padding: 7px;
  font-size: 12px;
  text-align: center;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.meal-action-btn.primary {
  background: #1d9e75;
  color: #fff;
  border-color: #1d9e75;
}

.save-btn {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  background: #1d9e75;
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

/* Inventory panel */
.inv-card {
  grid-column: 1/2;
  grid-row: 2/3;
}

.inv-search-row {
  display: flex;
  gap: 6px;
  margin-bottom: 0.75rem;
}

.inv-search-row input {
  flex: 1;
  padding: 6px 10px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  font-size: 12px;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.filter-btn-sm {
  padding: 6px 12px;
  font-size: 11px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.inv-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}

.inv-item:last-child {
  border-bottom: none;
}

.inv-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.inv-info {
  flex: 1;
}

.inv-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.inv-sub {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.inv-add-btn {
  font-size: 10px;
  padding: 3px 8px;
  border: 0.5px solid #1d9e75;
  border-radius: var(--border-radius-md);
  color: #1d9e75;
  background: none;
  cursor: pointer;
}

.inv-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 20px;
}

.inv-tag.warn {
  background: #faeeda;
  color: #854f0b;
}

/* Create meal + reco */
.create-card {
  grid-column: 2/3;
  grid-row: 2/3;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.create-inner {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  padding: 1rem 1.25rem;
}

.form-field {
  margin-bottom: 0.6rem;
}

.form-field label {
  font-size: 11px;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 3px;
}

.form-field input {
  width: 100%;
  padding: 6px 10px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  font-size: 12px;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.ingr-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.add-ingr {
  font-size: 12px;
  color: #1d9e75;
  cursor: pointer;
  margin-top: 4px;
}

.add-meal-btn {
  width: 100%;
  padding: 7px;
  font-size: 12px;
  background: #1d9e75;
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  margin-top: 0.5rem;
}

.reco-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  margin-bottom: 6px;
}

.reco-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.reco-info {
  flex: 1;
}

.reco-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.reco-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.reco-add {
  font-size: 11px;
  padding: 4px 10px;
  border: 0.5px solid #1d9e75;
  border-radius: var(--border-radius-md);
  color: #1d9e75;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
