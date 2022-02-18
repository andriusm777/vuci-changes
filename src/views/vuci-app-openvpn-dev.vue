<template>
  <div>
    <a-row :gutter="[0,0]">
      <a-col :span="24">
        <a-divider orientation="left">
          Available Instances
        </a-divider>
        <a-table :columns="columns" :data-source="sections" bordered>
          <template v-slot:instance="record">
            <a v-text="record['_name']"></a>
          </template>
          <template v-slot:role="record">
            <span v-text="record.type"></span>
          </template>
          <template v-slot:status="record">
          </template>
          <template v-slot:action="record">
            <a-button type="primary">
              Start
            </a-button>
            <a-divider type="vertical" />
            <a-button type="danger">
              Stop
            </a-button>
            <a-divider type="vertical" />
            <a-button>
              Edit
            </a-button>
            <a-divider type="vertical" />
            <a>Delete</a>
          </template>
        </a-table>
      </a-col>
    </a-row>
    <a-row :gutter="[0,10]">
      <a-col :span="24">
        <a-divider orientation="left">
          Create instance
        </a-divider>
        <a-form-model layout="inline" :model="formInline" @submit="add(formInline.name, formInline.role)" @submit.native.prevent>
          <a-form-model-item label="Name">
            <a-input v-model="formInline.name" required placeholder="Name of instance">
            </a-input>
          </a-form-model-item>
          <a-form-model-item label="Role">
            <a-select style="width: 115px;" name="type" required v-model="formInline.role" placeholder="insert role">
              <a-select-option v-for="option in formInline.options" :key="option">
                {{ option }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item>
            <a-button
              html-type="submit"
              type="primary"
              :disabled="formInline.name === '' || formInline.role === ''"
            >
              Add
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </a-col>
    </a-row>
  </div>
</template>

<script>

const columns = [
  { key: 'instance', title: 'Instance name', width: 155, scopedSlots: { customRender: 'instance' } },
  { key: 'role', title: 'Role',  width: 100, scopedSlots: { customRender: 'role' } },
  { key: 'status', title: 'Status', width: 150, scopedSlots: { customRender: 'status' } },
  { key: 'action', title: 'Actions', width: 200, scopedSlots: { customRender: 'action' } }
]

export default {
  data () {
    return {
      config: 'openvpn',
      sections: [],
      columns,
      formInline: {
        name: '',
        role: '',
        options: [
          'client'
        ]
      }
    }
  },
  // watch: {
  //   loaded () {
  //     this.load()
  //   }
  // },
  methods: {
    // handleSubmit (e) {
    //   console.log(this.formInline)
    // },
    // instanceCreate () {
    //   this.$uci.sections('openvpn', this.formInline.name)
    // },
    add (name, role) {
      this.$spin()
      this.$uci.add('openvpn', 'openvpn', name + '_client')
      this.$uci.save().then(() => {
        this.$uci.apply().then(() => {
          this.$spin(false)
        })
      })
      this.$uci.set('openvpn', name + '_client', 'type', role)
      this.$uci.set('openvpn', name + '_client', '_name', name)
      this.$uci.save()
      this.$uci.apply()
    },
    async load () {
      // this.sections = this.$uci.sections(this.config).filter(s => s['.name'] === this.name)
      // this.sections = this.$uci.load(this.config)
      // this.$uci.load(this.config).then((res) => {
      //   this.sections = this.$uci.get('openvpn', 'openvpn', 'bandymas6_client')
      //   // this.sections = this.$uci.get('ntpserver', 'general', 'enabled') === '1'
      // })
      await this.$uci.load('openvpn')
      this.sections = this.$uci.sections('openvpn', 'openvpn')
    }
    
    // handleAdd () {
    //   this.$prompt({
    //     title: this.$t('interfaces.Add interface'),
    //     placeholder: this.$t('Please input a name')
    //   }).then(name => {
    //     if (!name) return

    //     if (name.match(/^[a-zA-Z0-9_]+$/) === null) {
    //       this.$message.error(this.$t('validator.uci'))
    //       return
    //     }

    //     for (let i = 0; i < this.interfaces.length; i++) {
    //       if (this.interfaces[i].name === name) {
    //         this.$message.error(this.$t('Name already used'))
    //         return
    //       }
    //     }

    //     this.add(name)
    //   }).catch(() => {})
    // },
    // this should load the content inside our sections. Would have to create a new method to have this work
    // load () {
    //   this.$network.load().then(() => {
    //     this.interfaces = this.$network.getInterfaces()
    //   })
    // }
  },
  // computed: {
  //   section () {
  //     return this.sections.length > 0 ? this.sections[0] : null
  //   }
  // }
  created () {
    this.load()
  }

}

</script>

<style>

</style>
