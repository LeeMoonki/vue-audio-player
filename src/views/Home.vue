<template>
  <div class="home">
    <AudioPlayer :url="'http://localhost:8080/1to20.wav'" :height="100" />
  </div>
</template>

<script>
import AudioPlayer from '@/components/AudioPlayer';

export default {
  name: 'Home',
  components: {
    AudioPlayer
  }
}
</script>
