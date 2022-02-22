<template>
  <vuci-form-item-template v-bind="VuciFormItemTemplateProps">
    <a-upload
      action="/upload"
      :data="{path: this.uploadedFileName}"
      :multiple="true"
      :beforeUpload="getName"
      @change="__saveTest"
      v-model="model"
    >
      <a-button> <a-icon type="upload" /> Upload </a-button>
    </a-upload>
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
    sectionNaming: String,
    uploadedFileName: String,
    testValue: {
      type: String,
      default: 'nzn'
    }
  },
  methods: {
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
      } else {
        this.$uci.set(this.config, this.sid, this.name, 'empty')
      }
    },
    __save () {
      if (this.changed()) {
        if (this.save) { return this.save(this) }

        if (this.model) {
          this.$uci.set(this.config, this.sid, this.name, this.uploadedFileName)
        } else {
          this.$uci.set(this.config, this.sid, this.name, 'empty')
        }
      }
    }
  }
}
</script>

<style>

</style>
