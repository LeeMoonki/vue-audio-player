<template>
  <div class="home">
    <div class="audio-player-wrapper">
      <AudioPlayer :url="'http://localhost:8080/1to20.wav'" />
    </div>
    <div class="audio-player-wrapper">
      <AudioPlayerSmall :url="'http://localhost:8080/1to20.wav'" />
    </div>
  </div>
</template>

<script>
import AudioPlayer from '@/components/AudioPlayer';
import AudioPlayerSmall from '@/components/AudioPlayerSmall';

export default {
  name: 'Home',
  components: {
    AudioPlayer, AudioPlayerSmall
  }
}
</script>

<style scoped>
.audio-player-wrapper {
  /* */
}
</style>
