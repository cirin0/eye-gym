import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { AnimationBuilder, createAnimation } from '@ionic/vue'
import HomePage from '../views/HomePage.vue'

const createForwardAnimation: AnimationBuilder = (baseEl, opts) => {
  const rootTransition = createAnimation().duration(180).easing('ease-out')

  const enteringAnimation = createAnimation()
    .addElement(opts.enteringEl)
    .fromTo('transform', 'translateX(30%)', 'translateX(0)')
    .fromTo('opacity', 0, 1)

  const leavingAnimation = createAnimation().addElement(opts.leavingEl).fromTo('opacity', 1, 0)

  return rootTransition.addAnimation([enteringAnimation, leavingAnimation])
}

const createBackwardAnimation: AnimationBuilder = (baseEl, opts) => {
  const rootTransition = createAnimation().duration(180).easing('ease-out')

  const enteringAnimation = createAnimation().addElement(opts.enteringEl).fromTo('opacity', 0, 1)

  const leavingAnimation = createAnimation()
    .addElement(opts.leavingEl)
    .fromTo('transform', 'translateX(0)', 'translateX(30%)')
    .fromTo('opacity', 1, 0)

  return rootTransition.addAnimation([enteringAnimation, leavingAnimation])
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: HomePage,
  },
  {
    path: '/session',
    name: 'session',
    component: () => import('@/views/SessionPage.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingPage.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length

  if (!from.name) {
    to.meta.transition = undefined
  } else if (toDepth < fromDepth) {
    to.meta.transition = createBackwardAnimation
  } else {
    to.meta.transition = createForwardAnimation
  }

  next()
})

export default router
