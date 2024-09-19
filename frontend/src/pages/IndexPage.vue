<template>
    <q-page class="flex flex-center">
      <h1>Hallo {{ name }}</h1>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const token = JSON.parse(atob(localStorage.getItem("token").split(".")[1]))
    const name = ref("")
    
    onMounted(() => {
      name.value = token["vorname"]
    })

    return {
      name
    }
  }
});
</script>
