import Vue from 'vue'
import Router from 'vue-router'
import { session } from '@/plugins/session'
// import { rpc } from '@/plugins/rpc'
import axios from 'axios'
// importing mapstate so we could reach the state values
import store from '@/store/index'

Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/wizard',
    component: resolve => {
      axios.get(`/views/vuci-app-wizard.js?_t=${new Date().getTime()}`).then(r => {
        // eslint-disable-next-line no-eval
        return resolve(eval(r.data))
      }).catch(() => {
        return resolve(require('@/views/Wizard.vue'))
      })
    }
  },
  {
    path: '/login',
    beforeEnter: (to, from, next) => {
      if (to.path === '/login') {
        store.state.taskShowModal = false
        next()
      }
    },
    component: resolve => {
      axios.get(`/views/vuci-app-login.js?_t=${new Date().getTime()}`).then(r => {
        // eslint-disable-next-line no-eval
        return resolve(eval(r.data))
      }).catch(() => {
        return resolve(require('@/views/Login.vue'))
      })
    }
  },
  {
    path: '/',
    redirect: '/home',
    component: () =>
      import('@/components/VuciLayout'),
    children: [{
      path: 'home',
      component: resolve => {
        axios.get(`/views/vuci-app-home.js?_t=${new Date().getTime()}`).then(r => {
          // eslint-disable-next-line no-eval
          return resolve(eval(r.data))
        }).catch(() => {
          return resolve(require('@/views/Home.vue'))
        })
      },
      meta: {
        title: 'Home'
      }
    }]
  },
  {
    path: '*',
    component: () =>
      import('@/components/404.vue')
  }
  ]
})

// enabled navigation guard using the current session
function beforeEach (to, next, alive) {
  if (to.path !== '/login') {
    if (alive) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
}

router.beforeEach((to, from, next) => {
  session.isAlive().then((alive) => {
    if (alive) session.startHeartbeat()
    else session.logout()

    beforeEach(to, next, alive)
  })
})

export default router
