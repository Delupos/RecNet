<template>
    <q-page>
        <div style="display: flex; justify-content: center;">
            <h1>{{ title }}</h1>
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

        onMounted(() => {
            getData()
           
        });

        async function getData(){
            data.value = (await api.get(`/getRecipeById/${router.currentRoute.value.fullPath.split('/')[2]}`, {headers: {Authorization: localStorage.getItem("token")}})).data.data
            title.value = data.value["titel"]
        }

        return {
            title
        }
    }
})
</script>