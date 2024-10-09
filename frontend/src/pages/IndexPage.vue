<template>
  <q-page style="display: flex; justify-content: space-evenly; margin: 0; padding: 0;">
    
    <!-- Festes div mit h3 Überschrift -->
    <div style="position: fixed; top: 50px; left: 80px; min-width: 150px; max-width: 250px; padding: 0; margin: 0; z-index: 100;">
      <h3>Hallo {{ name }}</h3>
    </div>

    <!-- Content-Seite in der Mitte mit den Rezepten -->
    <div style="margin: 0; padding: 0; min-width: 110vh; max-width: 110vh; margin-top: 20px;" >
      <div class="flex flex-center">
        <q-pagination
          v-model="currentPage"
          :max="pageAmount"
          :max-pages="paginationMax"
          :boundary-numbers="false"
          @update:model-value="calculateOffset()"
          style="margin-top: 20px;"
        />
      </div>

      <div v-for="recipe in recipes" class="RecContent" @click="goToRecipePage(recipe['recId'])">
        <div style="margin-left: 50px; margin-top: -15px;">

          <h2 v-if="recipe['titel'].length < 20">{{ recipe["titel"] }}</h2>
          <h4 v-else>{{ recipe["titel"] }}</h4>

          <p v-if="recipe['zutaten'].length < 40">Zutaten: {{ recipe["zutaten"] }}</p>
          <p v-else>Zutaten: {{ recipe["zutaten"].slice(0,40) }}...</p>
          <p>Dauer: {{ recipe["dauer"] }} min</p>
          <p>Preis: ca. {{ recipe["preis"] }} €</p>
          <p v-if="recipe['profile']['vorname'] == name">Erstellt: Dein Rezept</p>
          <p v-else>Erstellt: {{ recipe["profile"]["vorname"] }} {{ recipe["profile"]["nachname"].charAt(0) }}.</p>
        </div>
        
        <q-img
          src="https://cdn.quasar.dev/img/parallax2.jpg"
          spinner-color="white"
          style="height: 200px; max-width: 210px; margin-top: 45px; margin-right: 70px;"
        ></q-img>
        
      </div>

      <div v-if="recipes.length == 0" class="RecContent">
        <div style="margin-left: 15px; text-align: center" class="flex flex-center">
          <h2>Es wurde leider kein Rezept gefunden :(</h2>
        </div>
      </div>
    </div>


    <!-- Festes div für den Rezept erstellen Button -->
    <div style="position: fixed; top: 50px; right: 80px; min-width: 150px; max-width: 250px; padding: 0; margin: 0; z-index: 100;">

      <q-btn class="rightContents" color="primary" label="Rezept erstellen" @click="window_CreateRecipe = true"/>

      <q-input class="rightContents" label="Suchen..." @keydown.enter.prevent="getFiltered()" @update:model-value="getFiltered()" v-model="searchInput.info" style="margin-top: 30px;"> <template v-slot:append>
                      <q-icon @click="getFiltered()" name="search" style="cursor: pointer"></q-icon>
        </template>
      </q-input>

      <q-select class="rightContents" v-model="amountPerPage" :options="pageAmountOptions" label="Anzahl Rezepte pro Seite" @update:model-value="calculateMaxAmountPage(), calculateOffset()"/>
    </div>

    <!-- Dialog für das Erstellen von Rezepten -->
    <q-dialog v-model="window_CreateRecipe" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px; max-height: 1000px;">
        <q-card-section style="min-height: 100px; max-height: 100px; margin-top: -30px; margin-bottom: 20px;">
          <h6>Erstelle ein Rezept</h6>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.titel" autofocus label='Titel'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.zutaten" autofocus hint="Geben Sie die Zutaten bitte getrennt mit Komma an und die Menge in Klammern hinter dieser Zutat" label="Zutaten"></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.zubereitung" autofocus hint="Sie können einen einfachen Fließtext schreiben" label='Zubereitung'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.preis" autofocus mask="##.##" hint="Bsp.: 09.99€" label='Preis'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.dauer" autofocus mask="##.##" hint="MM.SS" label='Dauer'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-file
            v-model="img"
            outlined
            accept=".jpg, image/*"
            @update:model-value="handleIMG(img)"
            style="max-width: 375px; min-width: 375px;"
            label="Laden Sie ein Bild hoch:"
          />
        <q-card-section class="q-pt-none" v-if="appImage">
          <q-img
            v-if="showImg"
            :src="showImg"
            style="margin-top: 10px;"
          />
        </q-card-section>
        </q-card-section>
        <q-card-actions style="display: flex; justify-content: space-between;">
          <q-btn flat label='Schließen' v-close-popup ></q-btn>
          <q-btn flat label='Erstellen' v-close-popup @click="createRecipe()" ></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>


<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const token = JSON.parse(atob(localStorage.getItem("token").split(".")[1]))
    const name = ref("")
    const cur_id = ref("")
    const recipes = ref([])
    const create_recipe = ref({
      titel: "",
      zutaten: "",
      zubereitung: "",
      preis: "",
      dauer: "",
      id: "",
      bild: ""
    })
    const appImage = ref(null)
    const img = ref(null)
    const showImg = ref(null)
    const window_CreateRecipe = ref(false)
    const searchInput = ref({info: ""})
    const amountPerPage = ref(10)
    const offset = ref(0)
    const currentPage = ref(1)
    const paginationMax = ref(5)
    const dbcounter = ref(0)
    const pageAmount = ref(1)
    const pageAmountOptions = [4, 6, 8, 10]
    
    onMounted(() => {
      name.value = token["vorname"]
      cur_id.value = token["id"]
      try{
        getFiltered()
        
      } catch(err) {
        $q.notify({
          type: 'negative',
          message: 'Es gibt Probleme mit dem Backend!',
          timeout: 2000,
          color: 'positive'
        })
      }
    })

    watch(() => router.currentRoute.value.fullPath, () => {
      location.reload();
    })

    // async function getRecipes() {
    //   const result = (await api.get('/getAllRecipes', {headers: {Authorization: localStorage.getItem("token")}})).data.data
    //   recipes.value = result
    // }

    async function createRecipe() {
      try {
        create_recipe.value.id = token["id"]
        console.log(create_recipe.value)
        if(Object.values(create_recipe.value).every(field => field !== '')){
          // await api.post('/createRecipe', create_recipe.value, {headers: {Authorization: localStorage.getItem("token")}})
          console.log(create_recipe.value.bild)
          await getFiltered()
          calculateOffset()
          create_recipe.value = {
            titel: "",
            zutaten: "",
            zubereitung: "",
            preis: "",
            dauer: "",
            id: "",
            bild: ""
          }
  
          $q.notify({
            type: 'positive',
            message: 'Ihr Rezept wurde erfolgreich erstellt!',
            timeout: 2000,
            color: 'primary'
          })

        } else {
          $q.notify({
            type: 'negativ',
            message: 'Alle Felder müssen ausgefüllt sein!',
            timeout: 2000,
          })
        }
      } catch (err) {
        console.log(err)
        $q.notify({
          type: 'negativ',
          message: 'Ihr Rezept konnte nicht erstellt werden!',
          timeout: 2000,
          color: 'red'
        })
      }
    }

    async function calculateOffset() {
      offset.value = (currentPage.value - 1) * amountPerPage.value
      await getFiltered()
    }

    function calculateMaxAmountPage(){
      pageAmount.value = Math.ceil(dbcounter.value / amountPerPage.value)
    }

    function checkForEmptyValue(){
      return recipes.value == 0
    }

    function sortById(arr) {
      return arr.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      });
    }

    function handleIMG(fileData) {
      const reader = new FileReader()
      reader.onload = () => {
        const byteArray = new Uint8Array(reader.result)
        arrayData(byteArray)
      }
      reader.readAsArrayBuffer(fileData)
    }

    function arrayData(arr) {
      let chars = ""
      for(const byte of arr){
        chars += String.fromCharCode(byte)
      }
      appImage.value = btoa(chars)
      showImg.value = "data:image/png;base64," + appImage.value
    }

    function goToRecipePage(id) {
      router.push(`/recipe/${id}`)
      // console.log(id)
    }

    async function getFiltered() {
      const temp = (await api.post(`getFilteredRecipes/?limit=${amountPerPage.value}&offset=${offset.value}`, searchInput.value, {headers: {Authorization: localStorage.getItem("token")}})).data
      recipes.value = sortById(temp.data)
      dbcounter.value = temp.count
      calculateMaxAmountPage()
      if(checkForEmptyValue()) {
        pageAmount.value = 1
      }
    }

    return {
      name,
      recipes,
      cur_id,
      create_recipe,
      window_CreateRecipe,
      searchInput,
      currentPage,
      dbcounter,
      pageAmount,
      offset,
      amountPerPage,
      paginationMax,
      pageAmountOptions,
      appImage,
      img,
      showImg,
      createRecipe,
      getFiltered,
      calculateOffset,
      calculateMaxAmountPage,
      goToRecipePage,
      handleIMG
    }
  }
});
</script>


<style>

.RecContent {
  display: flex; 
  justify-content: space-between; 
  margin: 30px; 
  min-height: 320px;
  max-height: 320px;
  border: 3px solid white;
  border-radius: 8px;
  background-color: rgb(27, 27, 27);
}

.RecContent:hover{
  cursor: pointer;
}

.rightContents {
  min-width: 200px;
  max-width: 200px;
  margin-top: 50px;;
  margin-right: 180px;
}

</style>