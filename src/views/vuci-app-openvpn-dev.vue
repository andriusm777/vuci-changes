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
            <span>{{getStatus(record.enable)}}</span>
          </template>
          <template v-slot:action="record">
            <a-button type="primary">
              Enable
            </a-button>
            <a-divider type="vertical" />
            <a-button type="danger">
              Disable
            </a-button>
            <a-divider type="vertical" />
            <a-button @click="edit(record['.name'])">
              Edit
            </a-button>
            <a-divider type="vertical" />
            <a-popconfirm @confirm="del(record['.name'])" :title="'Do you really want to delete ' + record['_name'] + '?'">
              <a>Delete</a>
            </a-popconfirm>
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
              :html-type="(formInline.name !== '' && formInline.role !== '') ? 'submit' : 'button'"
              type="primary"
              :disabled="formInline.name === '' || formInline.role === ''"
            >
              Add
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </a-col>
    </a-row>

    <!-- apsirasyti globalu upload component -->
    <a-modal :footer="null" :title="modalTitle" v-model="editModal" :width="800">
      <vuci-form uci-config="openvpn" v-if="editModal">
        <vuci-named-section :name="editorSection" v-slot="{ s }">
          <!-- <component :is="protoComponentName(s.proto)" :uci-section="s"/> -->
          <vuci-form-item-switch :uci-section="s" :label="'Enable'" name="enable" :initial="false" true-value="1" false-value="0" :help="'To enable the instance'"/>
          <vuci-form-item-select :uci-section="s" :label="'Authentication'" name="_auth" :options="auth" required/>
          <vuci-form-item-input :uci-section="s" :label="'Remote host/IP address'" name="remote" rules="host" placeholder="192.168.1.1." depend="_auth == 'tls' || 'skey'"/>
          <!-- TLS -->
          <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="remote_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'tls'" />
          <vuci-form-item-input :uci-section="s" :label="'Remote network Netmask'" name="remote_netmask" rules="netmask4" placeholder="255.255.255.0" depend="_auth == 'tls'"/>
          <vuci-form-upload :uci-section="s" :label="'Upload Certificate authority certificate'" name="ca" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
          <vuci-form-upload :uci-section="s" :label="'Upload Client certificate'" name="cert" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
          <vuci-form-upload :uci-section="s" :label="'Upload Client key'" name="key" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
          <!-- STATIC KEY -->
          <vuci-form-item-input :uci-section="s" :label="'Local tunnel endpoint IP'" name="local_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
          <vuci-form-item-input :uci-section="s" :label="'Remote tunnel endpoint IP'" name="remote_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
          <vuci-form-item-input :uci-section="s" :label="'Remote network netmask'" name="network_mask" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
          <vuci-form-upload :uci-section="s" :label="'Upload Static key'" name="secret" depend="_auth == 'skey'" :sectionNaming="uploadedFileWithSectionName"/>
        </vuci-named-section>
      </vuci-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  data () {
    return {
      config: 'openvpn',
      auth: ['tls', 'skey'],
      editModal: false,
      uploadedFileName: '',
      // uploadedFileWithSectionName: '',
      status: '',
      // modalTitle: '',
      editorSection: '',
      sections: [],
      columns: [
        { key: 'instance', title: 'Instance name', width: 155, scopedSlots: { customRender: 'instance' } },
        { key: 'role', title: 'Role', width: 100, scopedSlots: { customRender: 'role' } },
        { key: 'status', title: 'Status', width: 150, scopedSlots: { customRender: 'status' } },
        { key: 'action', title: 'Actions', width: 200, scopedSlots: { customRender: 'action' } }
      ],
      formInline: {
        name: '',
        role: '',
        options: [
          'client'
        ]
      }
    }
  },
  timers: {
    load: { time: 1500, autostart: true, immediate: true, repeat: true }
  },
  methods: {
    // handleSubmit (e) {
    //   console.log(this.formInline)
    // },
    // instanceCreate () {
    //   this.$uci.sections('openvpn', this.formInline.name)
    // },
    del (name) {
      this.$spin()
      this.$uci.del('openvpn', name)
      this.$uci.save().then(() => {
        this.$uci.apply().then(() => {
          this.load()
          this.$spin(false)
        })
      })
    },
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
    edit (sectionName) {
      // this.proto = this.$uci.get('openvpn', sectionName, 'proto')
      this.editorSection = sectionName
      this.editModal = true
    },
    getStatus (statusValue) {
      let status = ''
      if (statusValue === '1') {
        status = 'Enabled'
      } else {
        status = 'Disabled'
      }
      return status
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
  computed: {
    modalTitle () {
      return `Configure ${this.editorSection}`
    },
    uploadedFileWithSectionName () {
      return 'cbid.openvpn.' + this.editorSection + '.' + this.uploadedFileName
    }
  },
  created () {
    this.load()
  }

}

</script>

<style>

</style>
