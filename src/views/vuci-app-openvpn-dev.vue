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
            <span>
              <a-tag v-if="setStatusName(record.enable) === 'Enabled'" color="blue">
                {{setStatusName(record.enable)}}
              </a-tag>
              <a-tag v-if="setStatusName(record.enable) === 'Disabled'" color="red">
                {{setStatusName(record.enable)}}
              </a-tag>
            </span>
          </template>
          <template v-slot:action="record">
            <a-button v-if="record.enable === '0'" type="primary" @click="actionEnable(record['.name'])">
              Enable
            </a-button>
            <!-- <a-divider type="vertical" /> -->
            <a-button v-if="record.enable === '1'" type="danger" @click="actionDisable(record['.name'])">
              Disable
            </a-button>
            <a-divider type="vertical" />
            <a-button @click="edit(record['.name'], record.type)">
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

    <a-modal :footer="null" :title="modalTitle" v-model="editModal" :width="800">
      <vuci-form uci-config="openvpn" v-if="editModal">
        <vuci-named-section :name="editorSection" v-slot="{ s }">
          <!-- <component :is="protoComponentName(s.proto)" :uci-section="s"/> -->
          <vuci-form-item-switch :uci-section="s" :label="'Enable'" name="enable" :initial="false" true-value="1" false-value="0" :help="'To enable the instance'"/>
          <vuci-form-item-select :uci-section="s" :label="'Authentication'" name="_auth" :options="auth" required/>
          <vuci-form-item-input :uci-section="s" :label="'Port'" name="port" rules="port" placeholder="1192"/>
          <vuci-form-item-input :uci-section="s" :label="'Remote host/IP address'" name="remote" rules="host" placeholder="192.168.1.1." depend="_auth == 'tls' || 'skey'"/>
          <!-- CLIENT -->
          <div v-if="editorType === 'client'">
            <!-- TLS -->
            <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="remote_ip" @change="getValue" :rules="validateLanIp" placeholder="192.168.1.1" depend="_auth == 'tls'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network Netmask'" name="remote_netmask" rules="netmask4" placeholder="255.255.255.0" depend="_auth == 'tls'"/>
            <vuci-form-upload :uci-section="s" :label="'Certificate authority'" name="ca" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Client certificate'" name="cert" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Client key'" name="key" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <!-- STATIC KEY -->
            <vuci-form-item-input :uci-section="s" :label="'Local tunnel endpoint IP'" name="local_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote tunnel endpoint IP'" name="remote_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network netmask'" name="network_mask" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-upload :uci-section="s" :label="'Static key'" name="secret" depend="_auth == 'skey'" :sectionNaming="uploadedFileWithSectionName"/>
          </div>
          <div v-if="editorType === 'server'">
            <!-- SERVER -->
              <!-- TLS -->
            <vuci-form-item-input :uci-section="s" :label="'Virtual network IP address'" name="server_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'tls'" />
            <vuci-form-item-input :uci-section="s" :label="'Virtual network netmask'" name="server_netmask" rules="netmask4" placeholder="255.255.255.0" depend="_auth == 'tls'"/>
            <vuci-form-upload :uci-section="s" :label="'Certificate authority'" name="ca" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Server certificate'" name="cert" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Server key'" name="key" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Diffie Hellman parameters'" name="dh" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
              <!-- STATIC KEY -->
            <vuci-form-item-input :uci-section="s" :label="'Local tunnel endpoint IP'" name="local_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote tunnel endpoint IP'" name="remote_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="network_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network netmask'" name="network_mask" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-upload :uci-section="s" :label="'Static key'" name="secret" depend="_auth == 'skey'" :sectionNaming="uploadedFileWithSectionName"/>
          </div>

        </vuci-named-section>

      </vuci-form>
    </a-modal>
  </div>
</template>

<script>
/* eslint dot-notation: ["error", { "allowKeywords": false }] */
/* eslint dot-notation: ["error", { "allowPattern": "^[a-z]+(_[a-z]+)+$" }] */
export default {
  data () {
    return {
      config: 'openvpn',
      auth: ['tls', 'skey'],
      editModal: false,
      uploadedFileName: '',
      editorSection: '',
      editorType: '',
      latestSection: '',
      statusValueSingleItem: '',
      networkLanIp: '',
      networkLanMask: '',
      remoteNetworkIp: '',
      remoteNetworkMask: '',
      maskNumberConverted: '',
      testas: '',
      // networkInterfaces: '',
      // sectionsNetwork: [],
      sections: [],
      columns: [
        { key: 'instance', title: 'Instance name', width: 175, scopedSlots: { customRender: 'instance' } },
        { key: 'role', title: 'Role', width: 100, scopedSlots: { customRender: 'role' } },
        { key: 'status', title: 'Status', width: 150, scopedSlots: { customRender: 'status' } },
        { key: 'action', title: 'Actions', width: 150, scopedSlots: { customRender: 'action' } }
      ],
      formInline: {
        name: '',
        role: '',
        options: [
          'client', 'server'
        ]
      }
      // localRules: {
      //   scope: [
      //     { required: true, message: () => this.$t('validator.required') }
      //   ],
      //   entry: [
      //     { required: true, message: () => this.$t('validator.required') }
      //   ],
      //   perm: [
      //     { required: true, message: () => this.$t('validator.required') }
      //   ]
      // }
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
    async getLanNetwork () {
      // vuci get value of lan ip
      // lan ip equals to some const
      // if v equals to lan ip return
      // const networkInterfaces = []
      // this.editorIface = iface
      // this.$network.load().then(() => {
      //   this.networkInterfaces = this.$network.getInterfaces()
      // })
      // return networkInterfaces
      await this.$uci.load('network')
      // this.sectionsNetwork = this.$uci.sections('network', 'interface')
      this.networkLanIp = this.$uci.get('network', 'lan', 'ipaddr')
      this.networkLanMask = this.$uci.get('network', 'lan', 'netmask')
      // const v = '192.168.1.1'
      // if (v === this.networkLanIp) {
      //   alert('if v equals to lan ip statement working')
      // }
    },
    validateLanIp (value) {
      // this.testas = value
      // alert(`value is ${value}`)
      if (value === this.networkLanIp) {
        // alert(`running statement ${value} is equals to ${this.networkLanIp}`)
        return `Value must not match the lan Ip ${this.networkLanIp}`
      } else if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value) === false) {
        return 'Entered value must be a valid IPv4 address'
      }

      // if (this.remoteNetworkMask !== '') {
      // }
    },
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
    getValue (value) {
      setTimeout(() => {
        const name = value['_props'].uciSection['.name']
        this.remoteNetworkIp = value.form[name + '_' + 'remote_ip']
        this.remoteNetworkMask = value.form[name + '_' + 'remote_netmask']
        console.log(value.form[name + '_' + 'remote_ip'])
        console.log(value.form[name + '_' + 'remote_netmask'])
        console.log(value)
        const array = Array.from(this.remoteNetworkIp.split('.'), Number)
        console.log(array)
        // if (this.remoteNetworkMask === '') {
        // }
      }, 2500)
    },
    // ipChecker () {
    //   var ip2long = function(ip){
    //   var components

    //   if(components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))
    //   {
    //       var iplong = 0;
    //       var power  = 1;
    //       for(var i=4; i>=1; i-=1)
    //       {
    //           iplong += power * parseInt(components[i])
    //           power  *= 256
    //       }
    //       return iplong
    //   }
    //   else return -1
    //   }

    //   var inSubNet = function(ip, subnet)
    //   {
    //   var mask, base_ip, long_ip = ip2long(ip);
    //   if( (mask = subnet.match(/^(.*?)\/(\d{1,2})$/)) && ((base_ip=ip2long(mask[1])) >= 0) )
    //   {
    //       var freedom = Math.pow(2, 32 - parseInt(mask[2]))
    //       return (long_ip > base_ip) && (long_ip < base_ip + freedom - 1)
    //   }
    //   else return false
    //   }
    // }
    // delUploads (name) {
    //   if (this.auth === 'tls') {
    //     this.$spin()
    //     this.$uci.del('openvpn', name, 'secret')
    //   } else if (this.auth === 'skey') {
    //     this.$spin()
    //     this.$uci.del('openvpn', name, 'ca')
    //     this.$uci.del('openvpn', name, 'cert')
    //     this.$uci.del('openvpn', name, 'key')
    //   }
    //   this.$uci.save().then(() => {
    //     this.$uci.apply().then(() => {
    //       this.load()
    //       this.$spin(false)
    //     })
    //   })
    // },
    addDefaultGlobalValues (name, role, sid) {
      this.$uci.set('openvpn', sid, 'type', role)
      this.$uci.set('openvpn', sid, '_name', name)
      this.$uci.set('openvpn', sid, '_auth', 'tls')
      this.$uci.set('openvpn', sid, 'enable', '0')
      this.$uci.set('openvpn', sid, 'keepalive', '10 120')
      this.$uci.set('openvpn', sid, 'port', '1194')
      this.$uci.set('openvpn', sid, 'persist_key', '1')
      this.$uci.set('openvpn', sid, 'verb', '5')
      this.$uci.set('openvpn', sid, 'proto', 'udp')
      this.$uci.set('openvpn', sid, 'cipher', 'BF-CBC')
    },
    addDefaultClientValues (name, role, sid) {
      // DEFAULT AUTH TLS OPTION
      this.$uci.set('openvpn', sid, '_tls_cipher', 'all')
      this.$uci.set('openvpn', sid, '_tls_auth', 'none')
      this.$uci.set('openvpn', sid, 'nobind', '1')
      this.$uci.set('openvpn', sid, 'auth', 'sha1')
      this.$uci.set('openvpn', sid, 'persist_tun', '1')
      this.$uci.set('openvpn', sid, 'dev', 'tun_c_' + name)
      this.$uci.set('openvpn', sid, 'client', '1')
      this.$uci.set('openvpn', sid, 'resolv_retry', 'infinite')
    },
    addClient (name, role) {
      const sid = name + '_client'
      const currentSectionNames = this.sections.map(s => s['.name'])
      if (currentSectionNames.includes(sid) === true) {
        this.$message.info(`Instance ${name} already exists`)
        return
      } else {
        this.$spin()
        this.$uci.add('openvpn', 'openvpn', sid)
        this.$uci.save().then(() => {
          this.$uci.apply().then(() => {
            this.$spin(false)
          })
        })
        this.addDefaultGlobalValues(name, role, sid)
        this.addDefaultClientValues(name, role, sid)
        this.$uci.save()
        this.$uci.apply()
        
        this.latestSection = sid
        this.beforeAddEdit(name, this.latestSection, role)
      }
      this.clearCreateInstanceForm()
      // console.log('add method was ran')
    },
    addServer (name, role) {
      const sid = name + '_server'
      const currentSectionNames = this.sections.map(s => s.type)
      if (currentSectionNames.includes('server') === true) {
        this.$message.info('There can only be a single server instance')
        return
      } else {
        this.$spin()
        this.$uci.add('openvpn', 'openvpn', sid)
        this.$uci.save().then(() => {
          this.$uci.apply().then(() => {
            this.$spin(false)
          })
        })
        this.addDefaultGlobalValues(name, role, sid)
        this.$uci.save()
        this.$uci.apply()
        this.latestSection = sid
        this.beforeAddEdit(name, this.latestSection, role)
      }

      this.clearCreateInstanceForm()
      // console.log('add method was ran')
    },
    add (name, role) {
      if (role === 'client') {
        this.addClient(name, role)
      } else if (role === 'server') {
        this.addServer(name, role)
      }
    },
    edit (sectionName, type) {
      // this.proto = this.$uci.get('openvpn', sectionName, 'proto')
      // alert(`edit method ran on section ${sectionName} and with type ${type}`)
      this.editorSection = sectionName
      this.editorType = type
      if (this.editorSection !== '') {
        this.editModal = true
      }
    },
    clearCreateInstanceForm () {
      this.formInline.name = ''
      this.formInline.role = ''
    },
    beforeAddEdit (name, latestSection, role) {
      const currentSectionNames = this.sections.map(s => s['.name'])
      if (currentSectionNames.includes(name + '_client') === false || currentSectionNames.includes(name + '_server') === false) {
        // alert(`beforeAddEdit method using section ${latestSection}`)
        this.editorType = role
        // debugger
        this.edit(latestSection, role)
      }
    },
    setStatusName (statusValue) {
      let status = ''
      if (statusValue === '1') {
        status = 'Enabled'
      } else {
        status = 'Disabled'
      }
      return status
    },
    actionEnable (name) {
      // eslint-disable-next-line
      const specificSection = this.sections.filter(s => s['.name'] === name)
      if (Object.prototype.hasOwnProperty.call(specificSection[0], 'enable') === false || specificSection[0].enable === '0') {
        this.$spin()
        this.$uci.set('openvpn', name, 'enable', '1')
        this.$uci.save().then(() => {
          this.$uci.apply().then(() => {
            this.$spin(false)
          })
        })
      }
    },
    actionDisable (name) {
      // eslint-disable-next-line
      const specificSection = this.sections.filter(s => s['.name'] === name )
      if (Object.prototype.hasOwnProperty.call(specificSection[0], 'enable') === true && specificSection[0].enable === '1') {
        this.$spin()
        this.$uci.set('openvpn', name, 'enable', '0')
        this.$uci.save().then(() => {
          this.$uci.apply().then(() => {
            this.$spin(false)
          })
        })
      }
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
    },
    // doesIpBelongToMask () {
    //   networkLanMask
    //   networkLanIp
    //   remoteNetworkIp
    // },
    // maskNumber () {
    //   const ip = this.networkLanMask.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    //   if (ip) {
    //     this.maskNumberConverted = (+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + (+ip[4])
    //   }
    //   alert(this.maskNumberConverted)
    //   // return null
    // },
    // maskNumberTest () {
    //   this.maskNumber(('192.168.1.13') & this.maskNumber('255.255.255.0') === this.maskNumber('192.168.1.200'))
    // },
    // getNetworkLan (v) {
    ip2num (ip) {
      var d = ip.split(".")
      var num = 0
      num += Number(d[0]) * Math.pow(256, 3)
      num += Number(d[1]) * Math.pow(256, 2)
      num += Number(d[2]) * Math.pow(256, 1)
      num += Number(d[3])
      return num
    },
    // }
    checkingIpNetworkTest () {
      const lanIpNum = this.ip2num(this.networkLanIp)
      const remoteIpNum = this.ip2num('192.168.1.13')
      // const remoteIpNum = ip2num(this.remoteNetworkIp)

      // const lanMaskConverted = ip2num(this.remoteNetworkMask)
      // if ( lanIpNum <= remoteIpNum && remoteIpNum < lanIpNum + this.lanMaskNumberConverted - 1)
      if ( remoteIpNum >= lanIpNum && remoteIpNum < lanIpNum + this.lanMaskNumberConverted - 1) {
        // return true
        alert('error - remote ip is within local network ' + this.lanMaskNumberConverted)
      } else alert('success - remote ip is valid ' + this.lanMaskNumberConverted)
      // alert(lanMaskNumberConverted)
    },
    // lanMaskNumberConverted () {
    //   const ip = this.networkLanMask.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    //   if (ip) {
    //     this.testas = Math.abs((+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + (+ip[4]))
    //   }
    // }
  },
  computed: {
    lanMaskNumberConverted () {
      const ip = this.networkLanMask.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
      if (ip) {
        return Math.abs((+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + (+ip[4]))
      }
    },
    modalTitle () {
      return `Configure ${this.editorSection}`
    },
    uploadedFileWithSectionName () {
      return 'cbid.openvpn.' + this.editorSection + '.' + this.uploadedFileName
    }
  },
  // updated () {
  //   this.latestObject ()
  // },
  created () {
    this.load()
    this.getLanNetwork()
    // this.maskNumberTest()
    // this.maskNumber()
    this.checkingIpNetworkTest()
  }

}

</script>

<style>

</style>
