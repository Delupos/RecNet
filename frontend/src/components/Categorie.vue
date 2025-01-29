<template>

    <div class="text-center" style="width: 65px;">
        <div style="height: 65px; width: 65px; border-radius: 100%; background-color: #D9D9D9; margin-bottom: 8px; cursor: pointer;">
        <q-icon :name="iconName" style="width: 100%; height: 100%; font-size: 48px;"></q-icon>
        </div>
    <p>{{ title }}</p>
    </div>

</template>

<script>
export default {
    props: ["title", "iconName"]
}
</script>