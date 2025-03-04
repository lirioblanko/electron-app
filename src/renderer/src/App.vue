<script setup>
import { ref } from 'vue'

let message = ref('')
const files = ref([])
const isButtonClicked = ref(false)

const scan = () => {
  window.electron.ipcRenderer.send('scan', '.')
  isButtonClicked.value = true
}

window.electron.ipcRenderer.on('files', (_, list) => {
  files.value = list
})

window.electron.ipcRenderer.on('get-status', (_, status) => {
  message.value = status
})
</script>

<template>
  <button v-if="!isButtonClicked" style="margin-bottom: 1rem" @click="scan">Получить файлы</button>
  <p style="margin-bottom: 2rem">{{ `Приложение работает ${message}` }}</p>
  <ul>
    <li v-for="file in files" :key="file">{{ file }}</li>
  </ul>
</template>
