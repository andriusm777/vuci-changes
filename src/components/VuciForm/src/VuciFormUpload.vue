<template>
  <div>
    {{propas}}
  </div>
</template>

<script>
// All files must be stored in
// /etc/vuci-uploads/

// .cert.pem
// .certclient.cert.pem
// .keyclient.key.pem
export default {
  props: {
    propas: String
  }
}
</script>

<style>

</style>
