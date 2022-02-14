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
        <a-form-model layout="inline" :model="formInline" @submit="handleSubmit" @submit.native.prevent>
          <a-form-model-item label="Name">
            <a-input v-model="formInline.user" placeholder="Name of instance">
            </a-input>
          </a-form-model-item>
          <a-form-model-item label="Role">
            <a-select style="width: 100px;" v-model="formInline.region">
              <a-select-option value="server">
                server
              </a-select-option>
              <a-select-option value="client">
                client
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="primary" @click="onSubmit">
              Create
            </a-button>
          </a-form-model-item>
        </a-form-model>
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
      data,
      columns,
      formInline: {
        user: '',
        password: '',
        region: undefined
      }
    }
  },
  methods: {
    handleSubmit (e) {
      console.log(this.formInline)
    }
  }
}

</script>

<style>

</style>
