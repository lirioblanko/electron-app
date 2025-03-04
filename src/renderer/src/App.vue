<script setup>
import { ref } from 'vue'

let message = ref('')
const files = ref([])
const scan = () => window.electron.ipcRenderer.send('scan', '.')

window.electron.ipcRenderer.on('files', (_, list) => {
  files.value = list
})

window.electron.ipcRenderer.on('get-status', (_, status) => {
  message.value = status
})
</script>

<template>
  <button @click="scan">Получить файлы</button>
  <p>{{ `Приложение работает ${message}` }}</p>
  <ul>
    <li v-for="file in files" :key="file">{{ file }}</li>
  </ul>
</template>
