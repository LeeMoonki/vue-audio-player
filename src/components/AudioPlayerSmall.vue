<template>
  <div>
    <v-btn icon width="30" height="30" @click="onPlayingAction">
      <img style="width: 30px;" :src="playing ? require('@/assets/imgs/pause_normal.svg') : require('@/assets/imgs/play_normal.svg')" />
    </v-btn>
  </div>
</template>

<script>
import audioTool from '@/assets/js/slicer';

export default {
  name: 'AudioPlayerSmall',
  props: {
    id: [String, Number],
    url: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    originSource: null,
    audio: null,
    playing: false,
    begin: 0,
    end: 0,
  }),
  mounted() {
    fetch(this.url).then(res => {
      res.arrayBuffer().then(arrayBuffer => {
        
        this.originSource = arrayBuffer;

        audioTool.audioBufferSlice({
          arrayBuffer: this.originSource.slice(),
          callback: audioSourceResult => {
            audioSourceResult.on('end', this.onEnd.bind(this));
            audioSourceResult.on('playing', e => {
              this.$emit('playing', e.playingTime);
            });

            this.audio = audioSourceResult;
            this.begin = 0;
            this.end = audioSourceResult.end;

            this.$emit('load', {
              id: this.id,
              unit: 'ms',
              begin: 0,
              end: audioSourceResult.end,
            });
          },
        });
      });
    });
  },
  methods: {
    onEnd() {
      this.$emit('end', {
        id: this.id,
        unit: 'ms',
        begin: 0,
        end: this.end,
      });
    },
    onPlayingAction() {
      if (this.playing) {
        this.pause();
      } else {
        this.start();
      }
    },
    start() {
      this.playing = true;

      this.audio.start(
        this.begin / 1000,
        this.end / 1000
      );
    },
    pause() {
      this.playing = false;
      this.audio.pause();
    },
  },
}
</script>

<style scoped>

</style>
