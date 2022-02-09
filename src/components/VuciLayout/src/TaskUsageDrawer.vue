<template>
  <div>
    <a-button id="task2Usage-btn" type="primary" @click="showDrawer">
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
        <a-descriptions-item label="Memory Total">d</a-descriptions-item>
        <a-descriptions-item label="Memory Free">.3mb</a-descriptions-item>
        <a-descriptions-item label="Uptime">{{this.task2sysinfo[2]}}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>

</template>
<script>
export default {
  name: 'TaskUsageDrawer',
  data () {
    return {
      visible: false,
      task2sysinfo: []
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
      this.$system.getInfo().then(({ uptime, memory }) => {
        this.task2sysinfo = [
          [this.$t('Uptime'), '%t'.format(uptime)],
          // [this.$t(''), '%t'.format(uptime)],
          memory.total,
          memory.free
        ]
      })
      // console.log(this.task2sysinfo[2])
    }
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
