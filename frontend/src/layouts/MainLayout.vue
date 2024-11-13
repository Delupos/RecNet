<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title @click="goToIndexPage()" id="toolbartitle">
          {{ title }}
        </q-toolbar-title>

        <q-btn-dropdown v-if="verOrBtn" :label="fullLoginName">
          
          <q-list>
            
            <q-item clickable v-close-popup @click="showImpressum = true">
              <q-item-section>
                <q-item-label>Impressum</q-item-label>
              </q-item-section>
            </q-item>

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


    <!-- Dialog for Impressum -->
    <q-dialog v-model="showImpressum" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px; max-height: 1000px;">
        <q-card-section style="min-height: 100px; max-height: 100px; margin-top: -30px; margin-bottom: 20px;">
          <h6>Impressum</h6>
        </q-card-section>

        <q-card-section>
          <p>Timm Kalesse</p>
          <p>Muster Straße</p>
          <p>12345 Musterhausen</p>
          <h6 style="margin-top: 25px; margin-bottom: 20px;">Kontakt:</h6>
          <p>Telefon: 0152 318.....</p>
          <p>E-Mail: timm-kalesse@mustermail.de</p>
        </q-card-section>

        <q-card-actions style="display: flex; justify-content: right;">
          <q-btn flat label='Schließen' v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

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
    const showImpressum = ref(false)

    onMounted(() => {
      $q.dark.set(false)
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
        fullLoginName.value = token.value["vorname"] + " " + token.value["nachname"].slice(0,1) + "."
      }
    }

    function logout() {
      localStorage.clear()
      router.push('../login')
    }

    function goToIndexPage(){
      router.push('../')
    }

    return {
      title,
      version,
      verOrBtn,
      fullLoginName,
      showImpressum,
      logout,
      goToIndexPage
    }
  }
})
</script>

<style>

#toolbartitle {
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

}

</style>