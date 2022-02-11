<template>
  <div>
    <a-button v-if="gblResourceBtnVisible" id="gblResource-btn" type="primary" @click="showDrawer">
      <a-icon
        type="area-chart"
        style="font-size: 25px"
      />
      Show resource usage
    </a-button>
    <a-drawer
      title="Resource usage metrics"
      placement="right"
      :closable="false"
      :visible="visible"
      @close="onClose"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item v-for="item in gblRouterResources" :key="item[0]" :label="item[0]">{{ item[1] }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>

</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'TaskUsageDrawer',
  data () {
    return {
      visible: false
    }
  },
  timers: {
    update: { time: 1500, autostart: true, immediate: true, repeat: true }
  },
  methods: {
    showDrawer () {
      this.visible = true
    },
    onClose () {
      this.visible = false
    },
    update () {
      this.$session.isAlive().then(alive => {
        if (alive) {
          this.$system.getInfo().then(({ uptime, memory }) => {
            this.$store.commit('routerResources/setGblRouterResources', [
              [this.$t('Uptime'), '%t'.format(uptime)],
              ['Total memory', '%mB'.format(memory.total)],
              ['Free memory', '%mB'.format(memory.free)]
            ])
          })
        }
      })
    }
  },
  computed: {
    ...mapState('routerResources', ['gblResourceBtnVisible', 'gblRouterResources'])
  }
}
</script>
<style scoped>
  #gblResource-btn {
    height: 7%;
    width: 40px;
    position: fixed;
    bottom: 50%;
    right: 0;
    z-index: 2;
  }

  #gblResource-btn:hover {
    width: 200px;
  }
</style>
