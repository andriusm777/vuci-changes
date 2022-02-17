<template>
  <div>
    <a-row :gutter="[0,0]">
      <a-col :span="24">
        <a-divider orientation="left">
          Available Instances
        </a-divider>
        <a-table :columns="columns" :data-source="data" bordered>
          <a slot="name" slot-scope="text">{{ text }}</a>
          <span slot="customTitle">Instance Name</span>
          <span slot="tags" slot-scope="tags">
            <a-tag
              v-for="tag in tags"
              :key="tag"
            >
              {{ tag.toUpperCase() }}
            </a-tag>
          </span>
          <span slot="action">
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
          </span>
        </a-table>
      </a-col>
    </a-row>
    <a-row :gutter="[0,10]">
      <a-col :span="24">
        <a-divider orientation="left">
          Create instance
        </a-divider>
        <!-- <vuci-form uci-config="openvpn"> -->
        <a-form-model layout="inline" :model="formInline" @submit="add(formInline.name, role)" @submit.native.prevent>
          <a-form-model-item label="Name">
            <a-input v-model="formInline.name" required placeholder="Name of instance">
            </a-input>
          </a-form-model-item>
          <a-form-model-item label="Role">
            <a-select style="width: 115px;" name="type" required :uci-section="s" v-model="formInline.role" placeholder="insert role">
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
              Create
            </a-button>
          </a-form-model-item>
        </a-form-model>
          <!-- <vuci-named-section name="test" v-slot="{ s }">
          </vuci-named-section> -->
        <!-- </vuci-form> -->
      </a-col>
    </a-row>
  </div>
</template>

<script>

const columns = [
  {
    dataIndex: 'name',
    key: 'name',
    slots: { title: 'customTitle' },
    scopedSlots: { customRender: 'name' }
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: 'Action',
    key: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

const data = [
  {
    key: '1',
    name: 'VPN instance name',
    role: 'client',
    status: 'instance is down',
  }
]

export default {
  data () {
    return {
      config: [],
      sections: [],
      data,
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
  watch: {
    loaded () {
      this.load()
    }
  },
  methods: {
    handleSubmit (e) {
      console.log(this.formInline)
    },
    // instanceCreate () {
    //   this.$uci.sections('openvpn', this.formInline.name)
    // },
    add (name, role) {
      this.$spin()
      this.$uci.add('openvpn', 'openvpn', name + '_client')
      this.$uci.save().then(() => {
        this.$uci.apply().then(() => {
          // this.load()
          this.$spin(false)
        })
      })
      this.$uci
    },
    load () {
      this.sections = this.$uci.sections(this.config).filter(s => s['.name'] === this.name)
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
  computed: {
    section () {
      return this.sections.length > 0 ? this.sections[0] : null
    }
  }
  // created () {
  //   this.load()
  // }

}

</script>

<style>

</style>
