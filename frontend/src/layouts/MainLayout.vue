<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>

        <q-btn-dropdown v-if="verOrBtn" color="blue" :label="fullLoginName">
          
          <q-list>
            
            <q-item clickable v-close-popup @click="logout()">
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        
        </q-btn-dropdown>
        
        <div v-else>Version {{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const title = ref("RecNet")
    const version = ref("1.0")
    const $q = useQuasar()
    const verOrBtn = ref(false)
    const router = useRouter()
    const token = ref("")
    const fullLoginName = ref("")

    onMounted(() => {
      $q.dark.set(true)
      versionOrButton(router.currentRoute.value.fullPath)
      setFullLoginName()
    })

    watch(() => router.currentRoute.value.fullPath, (newPath) => {  
      versionOrButton(newPath)
      setFullLoginName()
    });

    const versionOrButton = (path) => {
      if (path != "/login"){
        verOrBtn.value = true
      } else {
        verOrBtn.value = false
      }
    }

    function setFullLoginName() {

      try{
        token.value = JSON.parse(atob(localStorage.getItem("token").split(".")[1]))
      } catch {
        return 
      }
      // console.log(token.value)
      if(token){
        fullLoginName.value = token.value["vorname"] + " " + token.value["nachname"]
      }
    }

    function logout() {
      localStorage.clear()
      router.push('../login')
    }

    return {
      title,
      version,
      verOrBtn,
      fullLoginName,
      logout
    }
  }
})
</script>
