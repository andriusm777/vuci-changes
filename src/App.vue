<template>
  <a-config-provider id="app" :locale="locale">
    <fullscreen ref="fullscreen">
      <div>
        <a-modal
          title="Update password to proceed"
          :visible="this.$store.state.taskShowModal"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
          :closable="false"
          :maskClosable="false"
          :keyboard="false"
          :footer="null"
        >
          <a-form-model :model="form" :rules="rules" ref="form" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-form-model-item :label="$t('admin.Password')" prop="password">
              <a-input-password v-model="form.password"/>
            </a-form-model-item>
            <a-form-model-item :label="$t('admin.Confirmation')" prop="confirm">
              <a-input-password v-model="form.confirm"/>
            </a-form-model-item>
            <a-form-model-item>
              <a-button type="primary" @click="setPassword" style="float: right;margin-right: 50px;">{{ $t('Save') }}</a-button>
            </a-form-model-item>
          </a-form-model>
        </a-modal>
      </div>
      <a-spin v-if="loaded" :spinning="spinning > 0" :tip="spintip || $t('Loading...')" size="large">
        <router-view></router-view>
      </a-spin>
      <task-usage-drawer></task-usage-drawer>
    </fullscreen>
    <left-side-bar></left-side-bar>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale-provider/zh_CN'
import zhTW from 'ant-design-vue/es/locale-provider/zh_TW'
import jaJP from 'ant-design-vue/es/locale-provider/ja_JP'
import TaskUsageDrawer from '@/components/VuciLayout/src/TaskUsageDrawer'
import { mapState } from 'vuex'

export default {
  components: {
    TaskUsageDrawer
  },
  data () {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('admin.Please enter your password')))
      } else {
        if (this.form.confirm !== '') { this.$refs.form.validateField('confirm') }
        callback()
      }
    }

    const validatorConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('admin.Please enter your password again')))
      } else if (value !== this.form.password) {
        callback(new Error(this.$t('admin.Inconsistent input password twice!')))
      } else {
        callback()
      }
    }

    return {
      loaded: false,
      locales: {
        'zh-cn': zhCN,
        'zh-tw': zhTW,
        ja: jaJP
      },
      ModalText: 'Content of the modal',
      confirmLoading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 10 },
      form: {
        password: '',
        confirm: ''
      },
      rules: {
        password: [{ validator: validatePass }],
        confirm: [{ validator: validatorConfirm }]
      }
    }
  },

  methods: {
    showModal () {
      this.$store.state.taskShowModal = true
    },

    handleOk (e) {
      this.ModalText = 'The modal will be closed after 1 second'
      this.confirmLoading = true
      setTimeout(() => {
        this.$store.state.taskShowModal = false
        this.confirmLoading = false
      }, 1000)
    },

    handleCancel (e) {
      console.log('Clicked cancel button')
      this.$store.state.taskShowModal = false
    },

    // after first login popup modal
    setPassword () {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.$rpc.call('ui', 'first_set', {
          lang: this.$store.state.lang,
          username: this.$session.username(),
          password: this.form.password
        }).then(() => {
          this.$store.state.taskShowModal = false
        })
      })
    },

    firstLogin () {
      return new Promise(resolve => {
        this.$rpc.call('ui', 'first_login')
          .then(r => {
            resolve(r.first)
          })
      })
    }

  },

  computed: {
    locale () {
      return this.locales[this.$i18n.locale]
    },
    ...mapState(['fullscreen', 'spinning', 'spintip'])
  },
  watch: {
    fullscreen () {
      this.$refs.fullscreen.toggle()
    },

    $route (to, from) {
      this.firstLogin().then(first => {
        if (first && to.path !== '/login' && this.$route.path !== '/login') {
          this.$session.isAlive().then(alive => {
            this.$store.state.afterFirstLogin = true
            if (alive && this.$store.state.afterFirstLogin) {
              this.$store.state.taskShowModal = true
            }
          })
        }
      })
    }
  },
  created () {
    this.$rpc.call('ui', 'get_lang').then(({ lang }) => {
      this.$store.commit('setLang', lang)
      if (lang === 'auto') lang = navigator.language.toLowerCase()

      if (lang === 'zh') lang = 'zh-cn'

      this.$rpc.call('ui', 'load_locales', { locale: lang }).then(locales => {
        /* Fix: empty Lua table to json */
        if (!Array.isArray(locales)) locales = []

        locales.forEach(locale => this.$i18n.mergeLocaleMessage(lang, locale))
        this.$i18n.locale = lang
        this.loaded = true
      })
    })
  }

}
</script>
