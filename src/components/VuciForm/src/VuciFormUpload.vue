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
      isFileFound: Boolean
    }
  },
  methods: {
    isFile () {
      if (Object.prototype.hasOwnProperty.call(this.uciSection, [this.name]) === false || this.uciSection[this.name] === '') {
        this.isFileFound = false
      } else {
        this.foundFileDirectory = this.uciSection[this.name]
        this.isFileFound = true
      }
    },
    comboHandleAndSave (info) {
      this.handleChange(info)
      this.__saveTest()
    },
    handleChange (info) {
      let fileList = info.fileList
      //    Limit the number of uploaded files
      //    Only to show 1 recent uploaded file, and old ones will be replaced by the new
      fileList = fileList.slice(-1)
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
    getFileName (file) {
      const fileName = file.name
      const pathUrl = '/etc/vuci-uploads/'
      this.uploadedFileName = pathUrl + this.sectionNaming + fileName
      console.log(this.uploadedFileName)
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
