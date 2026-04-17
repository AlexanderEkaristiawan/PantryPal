import { createRouter, createWebHistory } from 'vue-router'
import PantryPalDashboard from '../views/PantryPalDashboard.vue'
import ManageInventory from '../views/ManageInventory.vue'
import PantryPalDonationListing from '../views/PantryPalDonationListing.vue'
import PantryPalWeeklyMealPlan from '../views/PantryPalWeeklyMealPlan.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: PantryPalDashboard,
    },
    {
      path: '/donations',
      name: 'donations',
      component: PantryPalDonationListing,
    },
    {
      path: '/meal-plan',
      name: 'meal-plan',
      component: PantryPalWeeklyMealPlan,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: ManageInventory,
    },
    // analytics
    // settings
  ],
})

export default router
