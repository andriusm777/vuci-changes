<template>
  <vuci-form-item-template v-bind="VuciFormItemTemplateProps">
    <a-upload
      action="/upload"
      :data="{path: this.uploadedFileName}"
      :multiple="true"
      :beforeUpload="getName"
      @change="comboHandleAndSave"
      :file-list="fileList"
      v-model="model"
    >
      <a-button> <a-icon type="upload" />
        <span v-if="this.isFileFound === false">
          Upload
        </span>
        <span v-else>
          Upload new
        </span>
      </a-button>
    </a-upload>
    <span v-if="this.isFileFound">{{this.foundFileDirectory}}</span>
    <span v-else>No file found</span>
  </vuci-form-item-template>
</template>

<script>
import VuciFormItemMixin from './VuciFormItemMixin'
// this.$rpc.call('file', 'remove', { path: '/tmp/firmware.bin' })
// /etc/vuci-uploads/

// cbid.openvpn.<named-section-name>.caca.cert.pem
// cbid.openvpn.<named-section-name>.certclient.cert.pem
// cbid.openvpn.<named-section-name>.keyclient.key.pem
export default {
  name: 'VuciFormUpload',
  mixins: [VuciFormItemMixin],
  props: {
    name: String,
    uciSection: Object,
    sectionNaming: String
  },
  data () {
    return {
      uploadedFileName: '',
      foundFileDirectory: '',
      fileList: [],
      isFileFound: false
    }
  },
  timers: {
    isFile: { time: 1500, autostart: true, immediate: true, repeat: true }
  },
  methods: {
    // removeFile (info) {
    // const file = info.file
    // const fileName = file.name
    // if (Object.prototype.hasOwnProperty.call(this.uciSection, [this.name]) === false || this.uciSection[this.name] === '') {
    //   this.isFileFound = false
    // } else {
    //   this.foundFileDirectory = this.uciSection[this.name]
    //   this.isFileFound = true
    // }
    // this.$rpc.call('file', 'remove', { path: '/etc/vuci-uploads/' + this.sectionNaming + fileName })
    // return true
    // return new Promise(resolve => {
    //   this.getFileName(file)
    //   resolve()
    // })
    // },
    isFile () {
      if (Object.prototype.hasOwnProperty.call(this.uciSection, [this.name]) === false || this.uciSection[this.name] === '') {
        this.isFileFound = false
        this.foundFileDirectory = ''
      } else {
        this.isFileFound = true
        this.foundFileDirectory = this.uciSection[this.name]
      }
    },
    comboHandleAndSave (info) {
      this.handleChange(info)
      this.__saveTest()
    },
    handleChange (info) {
      // let fileList = info.fileList
      //    Limit the number of uploaded files
      //    Only to show 1 recent uploaded file, and old ones will be replaced by the new
      // let fileList = info.fileList.slice(-1)
      let fileList = [...info.fileList]
      fileList = fileList.slice(-1)
      console.log(info.fileList)
      if (info.fileList.length === 0) {
        // alert('fileList length is 0')
        // info.file.slice(-1)
        this.uploadedFileName = ''
        // console.log(info.file)
      }
      // fileList = fileList.slice(-1)
      this.fileList = fileList
    },
    onUploadArchive (info) {
      const file = info.file
      const status = file.status

      if (status === 'uploading' || status === 'removed') {
        info.fileList.length = 0
      }

      if (status !== 'done') {
        this.$message.error(`upload '${file.name}' failed.`)
      }
    },
    getFileName (file, fileList) {
      const fileName = file.name
      const pathUrl = '/etc/vuci-uploads/'
      this.uploadedFileName = pathUrl + this.sectionNaming + fileName
      console.log(this.uploadedFileName)
      console.log('file name without anything ' + fileName)
      console.log('list of files ' + fileList)
      // console.log(this.fileList)
    },
    getName (file) {
      return new Promise(resolve => {
        this.getFileName(file)
        resolve()
      })
    },
    __saveTest () {
      if (this.uploadedFileName !== '') {
        this.$uci.set(this.config, this.sid, this.name, this.uploadedFileName)
        console.log('set uploaded file name')
      } else {
        this.$uci.set(this.config, this.sid, this.name, '')
      }
    }
    // logConsoleTest () {
    //   console.log(this.uciSection)
    // }
    // __save () {
    //   if (this.changed()) {
    //     if (this.save) { return this.save(this) }

    //     if (this.model) {
    //       this.$uci.set(this.config, this.sid, this.name, this.uploadedFileName)
    //     } else {
    //       this.$uci.set(this.config, this.sid, this.name, 'empty')
    //     }
    //   }
    // }
  },
  created () {
    // this.logConsoleTest()
    this.isFile()
  }
}
</script>

<style>

</style>
