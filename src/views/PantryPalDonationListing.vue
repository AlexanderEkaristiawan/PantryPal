<template>
  <div class="sp-wrap">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">🌿 SavePlate</div>
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
        <span class="topbar-logo">🌿 SavePlate</span>
        <div style="flex:1"></div>
        <button class="tb-btn position-relative">
          Notifications
          <span class="badge">2</span>
        </button>
        <button class="tb-btn">Settings</button>
        <button class="tb-btn">Log out</button>
      </header>

      <!-- Content Area -->
      <div class="content">
        <!-- Hero Banner -->
        <div class="hero-banner">
          <div class="hero-icon">🤝</div>
          <div class="hero-text">
            <h2>Share Food, Reduce Waste</h2>
            <p>Post your surplus items or find available donations near you. Every share counts.</p>
          </div>
          <div class="hero-nav">
            <button class="hero-nav-btn">‹</button>
            <button class="hero-nav-btn">›</button>
          </div>
        </div>

        <!-- Recent Listings Section -->
        <div class="recent-section">
          <div class="section-header">
            <span class="section-title">Recent Listings</span>
          </div>
          <div class="cards-grid">
            <div v-for="item in recentListings" :key="item.id" class="d-card">
              <div class="d-card-top">
                <span class="d-card-title">{{ item.title }}</span>
                <div class="d-card-check"></div>
              </div>
              <div class="d-card-tags">
                <span
                  v-for="tag in item.tags"
                  :key="tag.label"
                  class="tag"
                  :class="tag.variant"
                >
                  {{ tag.label }}
                </span>
              </div>
              <div class="d-card-desc">{{ item.description }}</div>
              <div class="d-card-actions">
                <div class="d-action">Details</div>
                <div class="d-action primary">Claim</div>
              </div>
            </div>
          </div>
          <button class="browse-all-btn">Browse All Donations →</button>
        </div>

        <!-- Browse All Section -->
        <div class="section-header">
          <span class="section-title">Browse Donations</span>
        </div>
        <div class="search-bar-row">
          <input
            v-model="searchQuery"
            placeholder="Search by item name, category, location..."
            class="form-control form-control-sm"
          />
          <button class="filter-btn">Sort</button>
          <button class="filter-btn">Filter</button>
        </div>

        <div class="cards-grid">
          <div v-for="item in filteredListings" :key="item.id" class="d-card">
            <div class="d-card-top">
              <span class="d-card-title">{{ item.title }}</span>
              <div class="d-card-check"></div>
            </div>
            <div class="d-card-tags">
              <span
                v-for="tag in item.tags"
                :key="tag.label"
                class="tag"
                :class="tag.variant"
              >
                {{ tag.label }}
              </span>
            </div>
            <div class="d-card-desc">{{ item.description }}</div>
            <div class="d-card-actions">
              <div class="d-action">Details</div>
              <div class="d-action primary">Claim</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface Tag {
  label: string;
  variant?: 'green' | 'warn' | '';
}

interface DonationItem {
  id: number;
  title: string;
  tags: Tag[];
  description: string;
}

const router = useRouter();

const navItems = ref([
  { label: 'Dashboard', active: false, route: '/' },
  { label: 'Inventory', active: false, route: '/inventory' },
  { label: 'Meal Plan', active: false, route: '/meal-plan' },
  { label: 'Donation', active: true, route: '/donations' },
  { label: 'Analytics', active: false, route: '/analytics' },
  { label: 'Settings', active: false, route: '/settings' },
]);

const searchQuery = ref('');

const recentListings = ref<DonationItem[]>([
  {
    id: 1,
    title: 'Susu UltraMilk · 500ml Original',
    tags: [
      { label: 'Exp: 6 Apr', variant: 'warn' },
      { label: 'Dairy' },
      { label: '500ml' },
    ],
    description: 'Full box, unopened. Pickup in Denpasar Selatan, available mornings.',
  },
  {
    id: 2,
    title: 'Susu UltraMilk · 500ml Original',
    tags: [
      { label: 'Fresh', variant: 'green' },
      { label: 'Dairy' },
      { label: '500ml' },
    ],
    description: '2 boxes available. Can deliver nearby or pickup at gate.',
  },
]);

const allListings = ref<DonationItem[]>([
  {
    id: 3,
    title: 'Susu UltraMilk · 500ml Original',
    tags: [
      { label: 'Exp: 6 Apr', variant: 'warn' },
      { label: 'Dairy' },
      { label: 'Active', variant: 'green' },
    ],
    description: 'Unopened, pickup Kerobokan. Available 8am–12pm.',
  },
  {
    id: 4,
    title: 'Susu UltraMilk · 500ml Original',
    tags: [
      { label: 'Dairy' },
      { label: '2d left', variant: 'warn' },
      { label: 'Active', variant: 'green' },
    ],
    description: '3 cartons. Contact via WhatsApp for pickup schedule.',
  },
  {
    id: 5,
    title: 'Telur Kampung · 1 Dozen',
    tags: [
      { label: 'Fresh', variant: 'green' },
      { label: 'Protein' },
      { label: 'Active', variant: 'green' },
    ],
    description: 'Farm fresh eggs, pickup Ubud area only.',
  },
  {
    id: 6,
    title: 'Roti Tawar · 1 Loaf',
    tags: [
      { label: 'Exp: Today', variant: 'warn' },
      { label: 'Bread' },
    ],
    description: 'Half loaf remaining. Free, please take today.',
  },
]);

const filteredListings = computed(() => {
  if (!searchQuery.value) return allListings.value;
  const q = searchQuery.value.toLowerCase();
  return allListings.value.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.label.toLowerCase().includes(q))
  );
});

const navigateTo = (route: string) => {
  router.push(route);
};
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

.topbar-logo {
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
}

.hero-banner {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.hero-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  background: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.hero-text h2 {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.hero-text p {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 3px;
}

.hero-nav {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.hero-nav-btn {
  background: none;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  color: var(--color-text-secondary);
}

.recent-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.browse-all-btn {
  padding: 6px 16px;
  font-size: 12px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: block;
  text-align: center;
  margin: 0.75rem auto 0;
}

.search-bar-row {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.search-bar-row input {
  flex: 1;
  padding: 7px 12px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  font-size: 13px;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.filter-btn {
  padding: 7px 14px;
  font-size: 12px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.d-card {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  padding: 0.9rem;
}

.d-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.d-card-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.d-card-check {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--color-border-secondary);
  border-radius: 3px;
  flex-shrink: 0;
}

.d-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0.5rem;
}

.tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 20px;
  border: 0.5px solid var(--color-border-tertiary);
  color: var(--color-text-secondary);
}

.tag.green {
  background: #e1f5ee;
  color: #0f6e56;
  border-color: #9fe1cb;
}

.tag.warn {
  background: #faeeda;
  color: #854f0b;
  border-color: #fac775;
}

.d-card-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.d-card-actions {
  display: flex;
  gap: 6px;
}

.d-action {
  flex: 1;
  padding: 5px;
  font-size: 11px;
  text-align: center;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.d-action.primary {
  background: #1d9e75;
  color: #fff;
  border-color: #1d9e75;
}
</style>