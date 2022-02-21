<template>
  <div>
  <a-upload
    action="/upload"
    :data="{path: this.uploadedFileName}"
    :multiple="true"
    :beforeUpload="getName"
  >
    <a-button> <a-icon type="upload" /> Upload </a-button>
  </a-upload>
  </div>
</template>

<script>
// /etc/vuci-uploads/

// cbid.openvpn.<named-section-name>.caca.cert.pem
// cbid.openvpn.<named-section-name>.certclient.cert.pem
// cbid.openvpn.<named-section-name>.keyclient.key.pem
export default {
  props: {
    propas: String
  },
  data () {
    return {
      // fileList: [
      //   {
      //     uid: '-1',
      //     name: 'xxx.png',
      //     status: 'done',
      //     url: 'http://www.baidu.com/xxx.png'
      //   }
      // ]
      uploadedFileName: '',
      sectionNaming: 'cbid.openvpn.'
    }
  },
  methods: {
    // handleChange (info) {
    //   const fileList = [...info.fileList]
    //   const status = fileList.status

    //   if (status === 'uploading' || status === 'removed') return

    //   info.fileList.length = 0

    //   if (status !== 'done') {
    //     this.$message.error(`upload '${this.fileList.name}' failed.`)
    //     return
    //   }
    //   // 1. Limit the number of uploaded files
    //   //    Only to show two recent uploaded files, and old ones will be replaced by the new
    //   fileList = fileList.slice(-2)

    //   // 2. read from response and show file link
    //   fileList = fileList.map(file => {
    //     if (file.response) {
    //       // Component will show file.url as link
    //       file.url = file.response.url
    //     }
    //     return file
    //   })

    //   this.fileList = fileList
    // }
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
    }
  }
}
</script>

<style>

</style>
