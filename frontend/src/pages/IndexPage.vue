<template>
  <q-page style="display: flex; justify-content: space-evenly; margin: 0; padding: 0;">
    
    <!-- Festes div mit h3 Überschrift -->
    <div style="position: fixed; top: 50px; left: 80px; min-width: 150px; max-width: 250px; padding: 0; margin: 0; z-index: 100;">
      <h3>Hallo {{ name }}</h3>
    </div>

    <div style="margin: 0; padding: 0; min-width: 1000px; max-width: 1000px; margin-top: 20px;">
      <div v-for="recipe in recipes" class="RecContent">
        <div style="margin-left: 15px;">
          <h2>{{ recipe["titel"] }}</h2>
          <p>Zutaten: {{ recipe["zutaten"] }}</p>
          <p>Dauer: {{ recipe["dauer"] }} min</p>
          <p>Preis: ca. {{ recipe["preis"] }} €</p>
        </div>
        
        <q-img
          src="https://cdn.quasar.dev/img/parallax2.jpg"
          spinner-color="white"
          style="height: 200px; max-width: 210px; margin-top: 45px; margin-right: 70px;"
        ></q-img>
      </div>
    </div>

    <!-- Festes div für den Rezept erstellen Button -->
    <div style="position: fixed; top: 50px; right: 80px; min-width: 150px; max-width: 250px; padding: 0; margin: 0; z-index: 100;">
      <q-btn class="" color="primary" label="Rezept erstellen" style="margin-top: 50px;" @click="window_CreateRecipe = true"/>
      <q-input class="" label="Suchen..." @keydown.enter.prevent="getFiltered()" @update:model-value="getFiltered()" v-model="searchInput.info" style="margin-top: 30px;"> <template v-slot:append>
                    <q-icon @click="getFiltered()" name="search"></q-icon>
                </template></q-input>
    </div>

    <!-- Dialog für das Erstellen von Rezepten -->
    <q-dialog v-model="window_CreateRecipe" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px; max-height: 500px;">
        <q-card-section style="min-height: 100px; max-height: 100px; margin-top: -30px; margin-bottom: 20px;">
          <h6>Erstelle ein Rezept</h6>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.titel" autofocus label='Titel'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.zutaten" autofocus label="Zutaten"></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.zubereitung" autofocus label='Zubereitung'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.preis" autofocus mask="##" hint="Nur die Euros (##)" label='Preis'></q-input>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="create_recipe.dauer" autofocus mask="##" hint="Nur die Zeit (##)" label='Dauer'></q-input>
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
      id: "1"
    })
    const window_CreateRecipe = ref(false)
    const searchInput = ref({info: ""})
    
    onMounted(() => {
      name.value = token["vorname"]
      cur_id.value = token["id"]
      getRecipes()
    })

    watch(() => router.currentRoute.value.fullPath, () => {
      location.reload();
    })

    async function getRecipes() {
      const result = (await api.get('/getAllRecipes', {headers: {Authorization: localStorage.getItem("token")}})).data.data
      recipes.value = result
    }

    async function createRecipe() {
      try {
        await api.post('/createRecipe', create_recipe.value, {headers: {Authorization: localStorage.getItem("token")}})
        getRecipes()
        create_recipe = {
          titel: "",
          zutaten: "",
          zubereitung: "",
          preis: "",
          dauer: "",
          id: ""
        }

        $q.notify({
          type: 'positive',
          message: 'Ihr Rezept wurde erfolgreich erstellt!',
          timeout: 2000
        })

      } catch (err) {
        $q.notify({
          type: 'negativ',
          message: 'Ihr Rezept konnte nicht erstellt werden!',
          timeout: 2000
        })
      }
    }

    async function getFiltered() {
      const temp = (await api.post('getFilteredRecipes', searchInput.value, {headers: {Authorization: localStorage.getItem("token")}})).data
      console.log(temp)
      recipes.value = temp.data
    }

    return {
      name,
      recipes,
      cur_id,
      create_recipe,
      window_CreateRecipe,
      searchInput,
      createRecipe,
      getFiltered
    }
  }
});
</script>

<style>

.RecContent {
  display: flex; 
  justify-content: space-between; 
  margin: 30px; 
  min-height: 300px;
  max-height: 300px;
  border: 3px solid white;
  border-radius: 8px;
  background-color: rgb(36, 35, 35);
}

.RecContent:hover{
  cursor: pointer;
}

.loginPageBtn {
    display: block;
    width: 100%;
    margin-bottom: 15px;
    font-size: 16px;
    padding: 12px;
    border-radius: 10px;
    transition: background-color 0.3s, transform 0.2s;
}

.loginPageBtn[color="primary"] {
    background-color: var(--q-primary);
    color: white;
    border: none;
}

.loginPageBtn[color="primary"]:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.loginPageBtn[color="primary"]:active {
    transform: translateY(0);
}

</style>