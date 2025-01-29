<template>

  <div @click="goToRecipePage()"
    style="height: fit-content; width: 372px; border-radius: 20px; background-color: #D9D9D9; cursor: pointer; padding-bottom: 8px;">
    <q-img src="../../public/gordon_ramsay.jpeg" spinner-color="white"
      style="object-fit: cover; border-radius: 20px; height: 180px;"></q-img>

    <div style="height: 100px; padding: 6px 12px;">
      <p style="font-weight: 700; font-size: 16px;">{{ titel }}</p>
      <p style="margin-top: 12px;">Dauer: {{ dauer }} min</p>

      <div style="display: flex; justify-content: space-between;">
        <p>Preis: {{ preis }}€</p>
        <p style="font-size: 12px;">{{ profilvor }} {{
          profilnach.charAt(0) }}.</p>
      </div>
    </div>
  </div>

</template>


<script>
import { useRouter } from 'vue-router';

export default {
  props: ["titel", "dauer", "preis", "profilvor", "profilnach", "id"],

  setup(props) {
    const router = useRouter()

    function goToRecipePage() {
      router.push(`/recipe/${props.id}`)
    }

    return {
      goToRecipePage
    }
  }
}

</script>