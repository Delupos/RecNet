<template>
    <q-page style="display: grid;">

        <q-btn class="recipeBtn" color="primary" label="Zurück" @click="goToIndexPage()"/>

        <div class="gridtitle">
            <h2 v-if="title.length > 19">{{ title }}</h2>
            <h1 v-else>{{ title }}</h1>
        </div>

        <div class="content"> 
            <div class="ingredients">
                <h3>Zutaten:</h3>
                <h5 v-for="ingredient in ingredients">-> {{ ingredient }}</h5>
            </div>
            
            <div class="image">
                <q-img
                src="https://cdn.quasar.dev/img/parallax2.jpg"
                spinner-color="white"
                style="width: 500px;"
                ></q-img>
            </div>
            
            <div class="preparation">
                <h3>Zubereitung:</h3>
                <h5>{{ preparation }}</h5>
            </div>

        </div>
    </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'RecipePage',

    setup() {
        const router = useRouter()
        const $q = useQuasar()
        const data = ref({})
        const title = ref("")
        const ingredients = ref([])
        const preparation = ref("")

        onMounted(() => {
            getData()
        });

        async function getData(){
            data.value = (await api.get(`/getRecipeById/${router.currentRoute.value.fullPath.split('/')[2]}`, {headers: {Authorization: localStorage.getItem("token")}})).data.data
            title.value = data.value["titel"]
            ingredients.value = data.value["zutaten"].split(',')
            preparation.value = data.value["zubereitung"]
        }

        function goToIndexPage(){
            router.push('../')
        }


        return {
            title,
            ingredients,
            preparation,
            goToIndexPage
        }
    }
})
</script>

<style>
.gridtitle {
    margin-top: -200px;
    display: flex;
    justify-content: center;
}

.content {
    margin-top: -100px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px; 
    padding-left: 50px; 
    padding-right: 50px; 
}

.ingredients {
    margin-top: -50px;
    flex: 1; 
    max-width: 25%;
}

.image {
    flex: 1; 
    display: flex;
    justify-content: center;
    align-items: center;
}

.image img {
    width: 450px;
    height: auto;
}

.preparation {
    margin-top: -50px;
    flex: 1;
    max-width: 25%;
    height: 300px; 
    box-sizing: border-box;
}


.ingredients h5,
.preparation h5 {
    margin: 5px 0; 
}

.recipeBtn {
    margin-top: 20px;
    margin-left: 50px;
    max-width: 150px;
    max-height: 50px;
}

</style>