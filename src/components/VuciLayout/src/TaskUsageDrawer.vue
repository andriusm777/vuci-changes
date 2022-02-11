<template>
  <div>
    <a-button v-if="this.$store.state.task2BtnVisibility" id="task2Usage-btn" type="primary" @click="showDrawer">
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
        <a-descriptions-item v-for="item in task2RouterInfo" :key="item[0]" :label="item[0]">{{ item[1] }}</a-descriptions-item>
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
    task2toMb (memory) {
      var sizeInMb = (memory * Math.pow(10, -6)).toFixed(0)
      memory = sizeInMb
      return memory + 'MB'
    },
    update () {
      this.$system.getInfo().then(({ uptime, memory }) => {
        this.$store.commit('setTask2RouterInfo', [
          [this.$t('Uptime'), '%t'.format(uptime)],
          ['Memory total', this.task2toMb(memory.total)],
          ['Memory free', this.task2toMb(memory.free)]
        ])
      })
      console.log(this.task2sysinfo)
      console.log(this.$store.state.task2BtnVisibility)
    }
  },
  computed: {
    ...mapState(['task2BtnVisibility', 'task2RouterInfo'], ['task2RouterInfo'])
  }
}
</script>
<style scoped>
  #task2Usage-btn {
    height: 7%;
    width: 40px;
    position: fixed;
    bottom: 50%;
    right: 0;
    z-index: 2;

  }

  #task2Usage-btn:hover {
    width: 200px;
  }
</style>
