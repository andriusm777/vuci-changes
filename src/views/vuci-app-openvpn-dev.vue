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
              <a-tag v-if="setStatusName(record['.name'], record.enable) === 'Enabled'" color="blue">
                {{setStatusName(record['.name'], record.enable)}}
              </a-tag>
              <a-tag v-if="setStatusName(record['.name'], record.enable) === 'Active'" color="green">
                {{setStatusName(record['.name'], record.enable)}}
              </a-tag>
              <a-tag v-if="setStatusName(record['.name'], record.enable) === 'Inactive'" color="orange">
                {{setStatusName(record['.name'], record.enable)}}
              </a-tag>
              <a-tag v-if="setStatusName(record['.name'], record.enable) === 'Disabled'" color="red">
                {{setStatusName(record['.name'], record.enable)}}
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

    <a-modal :footer="null" :title="modalTitle" v-model="editModal" :width="800" :afterClose="modalClose">
      <vuci-form uci-config="openvpn" v-if="editModal" @applied="adjustOptions">
        <vuci-named-section :name="editorSection" v-slot="{ s }">
          <!-- <component :is="protoComponentName(s.proto)" :uci-section="s"/> -->
          <vuci-form-item-switch :uci-section="s" :label="'Enable'" name="enable" :initial="false" true-value="1" false-value="0" :help="'To enable the instance'"/>
          <vuci-form-item-select :uci-section="s" :label="'Authentication'" name="_auth" :options="auth" required/>
          <vuci-form-item-input :uci-section="s" :label="'Port'" name="port" rules="port" placeholder="1192"/>
          <vuci-form-item-input :uci-section="s" :label="'Remote host/IP address'" name="remote" rules="host" placeholder="192.168.1.1." depend="_auth == 'tls' || 'skey'"/>
          <!-- CLIENT -->
          <div v-if="editorType === 'client'">
            <!-- TLS -->
            <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="remote_ip" @change="getValue" @mousedown="blurTest" :rules="validateRemoteNetworkIp" placeholder="192.168.1.0" depend="_auth == 'tls'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network Netmask'" name="remote_netmask" @change="getValue" :rules="validateRemoteMask" placeholder="255.255.255.0" depend="_auth == 'tls'"/>
            <vuci-form-upload :uci-section="s" :label="'Certificate authority'" name="ca" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Client certificate'" name="cert" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <vuci-form-upload :uci-section="s" :label="'Client key'" name="key" depend="_auth == 'tls'" :sectionNaming="uploadedFileWithSectionName"/>
            <!-- STATIC KEY -->
            <vuci-form-item-input :uci-section="s" :label="'Local tunnel endpoint IP'" name="local_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote tunnel endpoint IP'" name="remote_ip" rules="ipaddr" placeholder="192.168.1.1" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="network_ip" @change="getValue" :rules="validateRemoteNetworkIp" placeholder="192.168.1.0" depend="_auth == 'skey'" />
            <vuci-form-item-input :uci-section="s" :label="'Remote network netmask'" name="network_mask" :rules="validateRemoteMask" placeholder="192.168.1.1" depend="_auth == 'skey'" />
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
            <vuci-form-item-input :uci-section="s" :label="'Remote network IP address'" name="network_ip" rules="ipaddr" placeholder="192.168.1.0" depend="_auth == 'skey'" />
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
      ubusData: {},
      compRemoteFirstIp: '',
      compRemoteLastIp: '',
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
    isIPv4Addr (ip) {
      const iPv4RegEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (iPv4RegEx.test(ip)) {
        return true
      } else {
        return false
      }
    },
    // isNotCharNorSpecial (ip) {
    //   const charAndSpecialRegEx = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
    //   if (charAndSpecialRegEx.test(ip)) {
    //     return true
    //   } else {
    //     return false
    //   }
    // },
    modalClose () {
      this.editorSection = ''
    },
    isMask (mask) {
      const netMaskRegEx = /^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$/
      if (netMaskRegEx.test(mask)) {
        return true
      } else {
        return false
      }
    },
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
    validateRemoteNetworkIp (value) {
      // this.testas = value
      // alert(`value is ${value}`)
      // setTimeout(() => {
      //   console.log('timeout works')
      //   const lanIpInt = this.ip2num(this.networkLanIp) - 1
      //   const lanMaskConverted = this.maskGetRemaining(this.networkLanMask) - 1
      //   const remoteIpInt = this.ip2num(value)
      //   // debugger
      //   if (remoteIpInt >= lanIpInt && remoteIpInt <= (lanIpInt + lanMaskConverted)) {
      //     return `IP address ${value} must not fall within the lan's range`
      //   } else if (this.isIPv4Addr(value) === false) {
      //     return 'Entered value must be a valid IPv4 address'
      //   }
      // }, 1000)
      const lanIpInt = this.ip2num(this.networkLanIp) - 1
      const lanMaskConverted = this.maskGetRemaining(this.networkLanMask) - 1
      const remoteIpInt = this.ip2num(value)
      // debugger
      if (remoteIpInt >= lanIpInt && remoteIpInt <= (lanIpInt + lanMaskConverted)) {
        return `IP address ${value} must not fall within the lan's range`
      } else if (this.isIPv4Addr(value) === false) {
        return 'Entered value must be a valid IPv4 address'
      }
    },
    blurTest (value) {
      console.log('form is out of focus now and value was/is ' + value)
    },
    testNetmaskIsIP () {
      const value = '255.255.255.255'
      if (this.isIPv4Addr(value) === false) {
        alert(`${value} is not an Ip`)
      } else {
        alert(`${value} is an Ip OK`)
      }
    },
    validateRemoteMask (value) {
      // const remoteIp = '192.168.1.254'
      const remoteIp = this.remoteNetworkIp
      const remoteIpInt = this.ip2num(remoteIp)
      const remoteMask = value
      // const remoteMask = mask
      this.getIpRangeFromAddressAndNetmask(remoteIp, remoteMask)
      const remoteNetworkFirstIp = this.ip2num(this.compRemoteFirstIp)
      // const remoteNetworkLastIp = this.ip2num(this.compRemoteLastIp)
      // debugger
      // if (this.isIPv4Addr(value) === false || this.isNotCharNorSpecial(value) === false) {
      //   return 'Entered value is not a valid netmask'
      // } else if (remoteIpInt <= remoteNetworkFirstIp || remoteIpInt >= remoteNetworkLastIp) {
      //   return `Incompatible subnet for remote IP ${remoteIp}`
      // }
      if (remoteIpInt !== remoteNetworkFirstIp) {
        return `Incompatible subnet for remote IP ${remoteIp}`
      } else if (this.isIPv4Addr(value) === false) {
        return 'Entered value is not a valid netmask'
      }
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
        // eslint-disable-next-line
        const name = value['_props'].uciSection['.name']
        this.remoteNetworkIp = value.form[name + '_' + 'remote_ip']
        this.remoteNetworkMask = value.form[name + '_' + 'remote_netmask']
        console.log(value.form[name + '_' + 'remote_ip'])
        console.log(value.form[name + '_' + 'remote_netmask'])
        console.log(value)
        this.blurTest(value)
        const array = Array.from(this.remoteNetworkIp.split('.'), Number)
        console.log(array)
        // if (this.remoteNetworkMask === '') {
        // }
      }, 1000)
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
      // let clientTlsValues = [ '_tls_cipher', 'tls_client','client', 'resolv_retry' ]
      // let clientSkeyValues = [ '_tls_cipher', 'tls_client','client', 'resolv_retry' ]
    },
    addDefaultServerValues (name, role, sid) {
      // DEFAULT AUTH TLS OPTION
      this.$uci.set('openvpn', sid, '_tls_cipher', 'all')
      this.$uci.set('openvpn', sid, '_tls_auth', 'none')
      this.$uci.set('openvpn', sid, 'auth', 'sha1')
      this.$uci.set('openvpn', sid, 'persist_tun', '1')
      this.$uci.set('openvpn', sid, 'dev', 'tun_s_' + name)
      this.$uci.set('openvpn', sid, 'tls_server', '1')
      this.$uci.set('openvpn', sid, 'upload_files', '0')
      // let arrayServerValues = [ '_tls_server', 'upload_files' ]
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
        this.addDefaultServerValues(name, role, sid)
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
    setStatusName (fullInstanceName, instanceEnableValue) {
      let status = ''
      if (Object.prototype.hasOwnProperty.call(this.ubusData, fullInstanceName)) {
        if (instanceEnableValue === '1' && this.ubusData[fullInstanceName].running === true) {
          status = 'Active'
        } else if (instanceEnableValue === '1' && this.ubusData[fullInstanceName].running === false) {
          status = 'Inactive'
        }
      } else {
        if (instanceEnableValue === '0') {
          status = 'Disabled'
        }
      }
      // if (instanceEnableValue === '1' && this.ubusData[fullInstanceName].running === true ) {
      //   status = 'Active'
      // } else if (instanceEnableValue === '0') {
      //   status = 'Disabled'
      // } else if (instanceEnableValue === '1' && Object.prototype.hasOwnProperty.call(this.ubusData, fullInstanceName) === false) {
      //   status = 'Enabled'
      // } else if (instanceEnableValue === '1' && this.ubusData[fullInstanceName].running === false) {
      //   status = 'Inactive'
      // }
      return status
    },
    testObjectField () {
      // var name = 'testing_client'
      // for (name in this.ubusData) {
      //   alert('for loop running')
      //   if (this.ubusData.hasOwnProperty(name)) {
      //     alert('field found')
      //   } else {
      //     alert('no field')
      //   }
      // }
      setTimeout(() => {
        // if (this.ubusData.hasOwnProperty('testing3_client')) {
        // alert('field found')
        // } else {
        //   alert('there is no such field')
        // }
        if (Object.prototype.hasOwnProperty.call(this.ubusData, 'testing_client')) {
          alert('field found')
        } else {
          alert('there is no such field')
        }
      }, 1000)
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
    // async removeTlsValues() {
    //   if ( '_auth' === 'skey') {
    //     await this.$uci.load('openvpn')
    //     this.$uci.sections('openvpn', 'openvpn').forEach(object => {
    //       this.$uci.del('testing2_client', object['.name'])
    //     })
    //   }
    // },
    ip2num (ip) {
      var d = ip.split('.')
      var num = 0
      num += Number(d[0]) * Math.pow(256, 3)
      num += Number(d[1]) * Math.pow(256, 2)
      num += Number(d[2]) * Math.pow(256, 1)
      num += Number(d[3])
      return num
    },
    isRemoteIpValid (remoteIp) {
      const lanIpInt = this.ip2num(this.networkLanIp)
      const lanMaskConverted = this.maskGetRemaining(this.networkLanMask) - 1
      const remoteIpInt = this.ip2num(remoteIp)

      if (remoteIpInt >= lanIpInt && remoteIpInt <= (lanIpInt + lanMaskConverted)) {
        return `IP address ${remoteIp} must not fall within the local network's range`
      }
    },
    // }
    // lanMaskNumberConverted () {
    //   const ip = this.networkLanMask.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    //   if (ip) {
    //     this.testas = Math.abs((+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + (+ip[4]))
    //   }
    // }
    getServiceList () {
      this.$rpc.call('ubus', 'call', { object: 'service', method: 'list' }).then(r => {
        this.ubusData = r.openvpn.instances
        console.log(this.ubusData)
      })
    },
    ip2longInt (ip) {
      var components
      // eslint-disable-next-line
      if (components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
        var iplong = 0
        var power = 1
        for (var i = 4; i >= 1; i -= 1) {
          iplong += power * parseInt(components[i])
          power *= 256
        }
        return iplong
      } else {
        return -1
      }
    },
    maskGetRemaining (ip) {
      // eslint-disable-next-line
      var ip = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
      if (ip) {
        return Math.abs((+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + (+ip[4]))
      }
    },
    testLongIp () {
      const ip1 = '192.168.1.1'
      const ip1toInt = this.ip2longInt(ip1)
      alert('converted ip is ' + ip1toInt)
    },
    testGetMask () {
      const mask1 = '255.255.255.0'
      const mask1Converted = this.maskGetRemaining(mask1)
      alert('converted mask is ' + mask1Converted)
    },
    getIpRangeFromAddressAndNetmask (ip, netmask) {
      var ipaddress = ip.split('.')
      var netmaskblocks = ['0', '0', '0', '0']
      if (!/\d+\.\d+\.\d+\.\d+/.test(netmask)) {
        netmaskblocks = ('1'.repeat(parseInt(netmask, 10)) + '0'.repeat(32 - parseInt(netmask, 10))).match(/.{1,8}/g)
        netmaskblocks = netmaskblocks.map(function (el) {
          return parseInt(el, 2)
        })
      } else {
        netmaskblocks = netmask.split('.').map(function (el) {
          return parseInt(el, 10)
        })
      }
      var invertedNetmaskBlocks = netmaskblocks.map(function (el) {
        return el ^ 255
      })
      var baseAddress = ipaddress.map(function (block, idx) {
        return block & netmaskblocks[idx]
      })
      var broadcastAddress = ipaddress.map(function (block, idx) {
        return block | invertedNetmaskBlocks[idx]
      })

      this.compRemoteFirstIp = baseAddress.join('.')
      this.compRemoteLastIp = broadcastAddress.join('.')
      // return [baseAddress.join('.'), broadcastAddress.join('.')]
    },
    // getIpRangeFromAddressAndNetmaskAlert () {
    //   alert(this.getIpRangeFromAddressAndNetmask('192.168.1.50', '255.255.255.0'))
    // },
    testRemoteMask () {
      const remoteIp = '192.168.1.254'
      // const remoteIp = this.remoteNetworkIp
      const remoteIpInt = this.ip2num(remoteIp)
      const remoteMask = '255.255.255.0'
      // const remoteMask = mask
      this.getIpRangeFromAddressAndNetmask(remoteIp, remoteMask)
      const remoteNetworkFirstIp = this.ip2num(this.compRemoteFirstIp)
      const remoteNetworkLastIp = this.ip2num(this.compRemoteLastIp)
      // debugger
      if (remoteIpInt <= remoteNetworkFirstIp || remoteIpInt >= remoteNetworkLastIp) {
        return alert(`Incompatible subnet for remote IP ${remoteIp}`)
      } else {
        return alert('yay')
      }
    },
    removeOptions () {
      const sectionAllOptions = {}
      this.$rpc.call('test', 'get_section_values', { section: 'testingDel_client' }).then((res) => {
        // console.log('get section values new function output:')
        // console.log(res['.name'])
        res = sectionAllOptions
      })
      if (!this.areDefaultClientValuesFound(sectionAllOptions)) {
        // alert('running removeOptions')
        this.$rpc.call('test', 'add_client_default_tls_values', { section: 'testingDel_client' })
      }
    },
    adjustOptions () {
      setTimeout(() => {
        console.log('running function after applied')
        const currentSection = this.sections.filter(s => {
          return s['.name'] === this.editorSection
        })
        console.log(currentSection[0])
        this.$rpc.call('test', 'get_section_values', { section: this.editorSection }).then((currentSectionLatestOptions) => {
          console.log('get section values new function output:')
          // console.log(res['.name'])
          if (currentSection[0].type === 'client') {
            // function goes here
            // if (currentSection[0]['_auth'] === 'skey' && this.areTlsUploadsFound(currentSectionLatestOptions)) {
            //   this.$rpc.call('test', 'del_client_tls_values', { section: this.editorSection })
            // } else if (currentSection[0]['_auth'] === 'tls') {
            //   if (!this.areTlsUploadsFound(currentSectionLatestOptions) && this.areSkeyUploadsFound(currentSectionLatestOptions)) {
            //     this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.secret })
            //   }
            //   if (!this.areDefaultClientTlsValuesFound(currentSectionLatestOptions)) {
            //     this.$rpc.call('test', 'add_client_default_tls_values', { section: this.editorSection })
            //   }
            // }
            this.adjustClientOptions(currentSection, currentSectionLatestOptions)
          } else if (currentSection[0].type === 'server') {
            this.adjustServerOptions(currentSection, currentSectionLatestOptions)
            // console.log('current section is server')
            // if (currentSection[0]['_auth'] === 'skey') {
            //   this.$rpc.call('test', 'del_server_tls_values', { section: this.editorSection })
            // } else if (currentSection[0]['_auth'] === 'tls') {
            //   if (!this.areDefaultServerTlsValuesFound(currentSectionLatestOptions)) {
            //     this.$rpc.call('test', 'add_server_default_tls_values', { section: this.editorSection })
            //   }
            // }
          }
        })
      }, 1000)
    },
    adjustClientOptions (currentSectionShownOnUI, currentSectionLatestOptions) {
      if (currentSectionShownOnUI[0]['_auth'] === 'skey' && this.areTlsUploadsFoundClient(currentSectionLatestOptions) && this.areDefaultClientTlsValuesFound(currentSectionLatestOptions)) {
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.ca })
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.key })
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.cert })
        this.$rpc.call('test', 'del_client_tls_values', { section: this.editorSection })
      } else if (currentSectionShownOnUI[0]['_auth'] === 'tls' && this.areSkeyUploadsFound(currentSectionLatestOptions) && !this.areDefaultClientTlsValuesFound(currentSectionLatestOptions)) {
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.secret })
        this.$rpc.call('test', 'del_client_skey_values', { section: this.editorSection })
        this.$rpc.call('test', 'add_client_default_tls_values', { section: this.editorSection })
      }
    },
    adjustServerOptions (currentSectionShownOnUI, currentSectionLatestOptions) {
      if (currentSectionShownOnUI[0]['_auth'] === 'skey' && this.areTlsUploadsFoundServer(currentSectionLatestOptions) && this.areDefaultServerTlsValuesFound(currentSectionLatestOptions)) {
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.ca })
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.key })
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.cert })
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.dh })
        this.$rpc.call('test', 'del_server_tls_values', { section: this.editorSection })
      } else if (currentSectionShownOnUI[0]['_auth'] === 'tls' && this.areSkeyUploadsFound(currentSectionLatestOptions) && !this.areDefaultServerTlsValuesFound(currentSectionLatestOptions)) {
        this.$rpc.call('file', 'remove', { path: currentSectionLatestOptions.secret })
        this.$rpc.call('test', 'del_server_skey_values', { section: this.editorSection })
        this.$rpc.call('test', 'add_server_default_tls_values', { section: this.editorSection })
      }
    },
    areTlsUploadsFoundClient (sectionAllOptions) {
      if (!Object.prototype.hasOwnProperty.call(sectionAllOptions, 'ca') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'key') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'cert')) {
        return false
      } else {
        return true
      }
    },
    areTlsUploadsFoundServer (sectionAllOptions) {
      if (!Object.prototype.hasOwnProperty.call(sectionAllOptions, 'ca') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'key') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'cert') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'dh')) {
        return false
      } else {
        return true
      }
    },
    areSkeyUploadsFound (sectionAllOptions) {
      if (!Object.prototype.hasOwnProperty.call(sectionAllOptions, 'secret')) {
        return false
      } else {
        return true
      }
    },
    areDefaultServerTlsValuesFound (sectionAllOptions) {
      if (!Object.prototype.hasOwnProperty.call(sectionAllOptions, '_tls_cipher') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, '_tls_auth') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'tls_server') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'auth')) {
        return false
      } else {
        return true
      }
    },
    areDefaultClientTlsValuesFound (sectionAllOptions) {
      if (!Object.prototype.hasOwnProperty.call(sectionAllOptions, '_tls_cipher') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'client') && !Object.prototype.hasOwnProperty.call(sectionAllOptions, 'auth')) {
        return false
      } else {
        return true
      }
    },
    renameTest () {
      alert('deleting file')
      this.$rpc.call('file', 'remove', { path: '/etc/vuci-uploads/' + 'ddd' })
    }
  },
  computed: {
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
    this.getServiceList()
    // this.renameTest()
    // this.removeOptions()
    // this.getSectionsOptionTest()
    // this.testRemoteMask()
    // this.testNetmaskIsIP()
    // this.testObjectField()
    // this.getIpRangeFromAddressAndNetmaskAlert()
  }

}

</script>

<style>

</style>
