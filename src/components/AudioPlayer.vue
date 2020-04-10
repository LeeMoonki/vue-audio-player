<template>
  <div class="audio-container">
    <div v-if="audio" class="audio-inner-container">
      <div class="audio-player" :style="{ height }">
        <!-- 왼쪽 버튼 영역 -->
        <div>
          <div class="action-buttons-wrapper">
            <v-btn icon width="30" height="30" @click="onPlayingAction">
              <img style="width: 30px;" :src="playing ? require('@/assets/imgs/pause_normal.svg') : require('@/assets/imgs/play_normal.svg')" />
            </v-btn>
            <v-btn icon width="30" height="30" @click="stop">
              <img style="width: 30px;" :src="require('@/assets/imgs/stop_normal.svg')" />
            </v-btn>
          </div>
          <div>{{ playingTime }}</div>
        </div>
        <!-- // 왼쪽 버튼 영역 -->
        <div class="player-area" :style="{ width: '100%', paddingLeft: `${dragArrowWidth / 2}px` }">
          <div class="audio-player-arrows" :style="{ width: `${durationToWidth}px` }">
            <div class="audio-player-arrows__begin" :style="leftDragArrowStyle" @mousedown="onDragLeft">
              <DragArrow :key="'leftArrow'" :color="leftDragArrowColor" />
            </div>
            <div class="audio-player-arrows__end" :style="rightDragArrowStyle" @mousedown="onDragRight">
              <DragArrow :key="'rightArrow'" :color="rightDragArrowColor" />
            </div>
          </div>
          <div class="audio-player-indication" :style="{ width: `${durationToWidth}px` }">
            <div class="audio-player__left-area" :style="leftAreaStyle"></div>
            <div class="audio-player__indicator" :style="{ left: `${indipos}px` }"></div>
            <div class="audio-player__right-area" :style="rightAreaStyle"></div>
          </div>
        </div>
        <!-- 오른쪽 버튼 영역 -->
        <div>
          <v-btn icon @click="onClickLock">
            <img style="width: 30px;" :src="locked ? require('@/assets/imgs/lock.svg') : require('@/assets/imgs/unlock.svg')" />
          </v-btn>
        </div>
        <!-- // 오른쪽 버튼 영역 -->
      </div>
    </div>
    <div v-else class="load-wrapper">
      <v-progress-circular
        :size="30"
        :width="2"
        color="#000"
        indeterminate
      ></v-progress-circular>
    </div>
  </div>
</template>

<script>
import audioTool from '@/assets/js/slicer';
import DragArrow from '@/components/DragArrow';
import { timeformat } from '@/assets/js/utils';

export default {
  name: 'AudioPlayer',
  components: {
    DragArrow
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    height: {
      type: [String, Number],
      default: '100%',
    },
    id: [String, Number],
  },
  data: () => ({
    originSource: null,
    audio: null,
    playing: false,
    locked: false,
    leftArrowOnDraging: false,
    rightArrowOnDraging: false,
    playingTimeInterval: 10, // 시간 계산의 단위
    currentTime: 0,
    mapperMultiplier: 20,
    durationToWidth: 0, // player 길이(width)
    dragArrowWidth: 15, // 드래그 화살표 너비
    // indicator position
    indicatorPosition: 0, // indicator 위치
    indicatorBeginPosition: 0, // 조절용 시작 indicator 위치
    indicatorEndPosition: 0, // 조절용 끝 indicator 위치
  }),
  computed: {
    playingTime() {
      return timeformat(this.currentTime, 'm');
    },
    leftDragArrowColor() {
      // 시작 조절 화살표 색상
      return this.locked ? '#eee' : this.leftArrowOnDraging ? '#dfa512' : '#ababab';
    },
    rightDragArrowColor() {
      // 끝 조절 화살표 색상
      return this.locked ? '#eee' : this.rightArrowOnDraging ? '#dfa512' : '#ababab';
    },
    leftDragArrowStyle() {
      // 시작 조절 화살표 스타일
      return {
        width: `${this.dragArrowWidth}px`,
        left: `${this.indicatorBeginPosition - (this.dragArrowWidth / 2)}px`,
      };
    },
    rightDragArrowStyle() {
      // 끝 조절 화살표 스타일
      return {
        width: `${this.dragArrowWidth}px`,
        left: `${this.indicatorEndPosition - (this.dragArrowWidth / 2)}px`,
      };
    },
    leftAreaStyle() {
      return {
        width: `${this.indicatorBeginPosition}px`
      };
    },
    rightAreaStyle() {
      return {
        left: `${this.indicatorEndPosition}px`,
        width: `${this.durationToWidth - this.indicatorEndPosition}px`,
      };
    },
    indipos() {
      if (this.indicatorBeginPosition === this.indicatorEndPosition) {
        return this.indicatorBeginPosition;
      }
      return this.indicatorPosition <= this.indicatorBeginPosition
        ? this.indicatorBeginPosition
        : (this.indicatorPosition >= this.indicatorEndPosition ? this.indicatorEndPosition : this.indicatorPosition);
    },
  },
  mounted() {
    console.log('url : ', this.url);
    fetch(this.url).then(res => {
      res.arrayBuffer().then(arrayBuffer => {
        
        this.originSource = arrayBuffer;

        audioTool.audioBufferSlice({
          arrayBuffer: this.originSource.slice(),
          callback: audioSourceResult => {
            this.durationToWidth = audioSourceResult.end / this.mapperMultiplier;
            this.indicatorEndPosition = this.durationToWidth;

            audioSourceResult.setPlayingTimerInterval(this.playingTimeInterval);
            audioSourceResult.on('end', this.onEnd.bind(this));
            audioSourceResult.on('playing', this.onPlaying.bind(this));

            this.audio = audioSourceResult;

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
    onDragLeft(e) {
      e.preventDefault();

      if (!this.locked) {
        const startPointX = e.clientX;
        const beforeIndicatorPosition = this.indicatorBeginPosition
        let currentPosition = beforeIndicatorPosition;

        this.leftArrowOnDraging = true;

        document.onmousemove = (me) => {
          currentPosition = beforeIndicatorPosition + (me.clientX - startPointX);

          if (currentPosition >= 0 && currentPosition <= this.indicatorEndPosition) {
            this.indicatorBeginPosition = currentPosition;
          }
        };
        document.onmouseup = () => {
          this.leftArrowOnDraging = false;
          document.onmousemove = null;
          document.onmouseup = null;

          this.stop();

          this.$emit(
            'setTime',
            {
              id: this.id,
              unit: 'ms',
              begin: this.widthToTimeMapper(this.indicatorBeginPosition),
              end: this.widthToTimeMapper(this.indicatorEndPosition),
            }
          );
        };
      }
    },
    onDragRight(e) {
      e.preventDefault();

      if (!this.locked) {
        const startPointX = e.clientX;
        const beforeIndicatorPosition = this.indicatorEndPosition;
        let currentPosition = beforeIndicatorPosition;

        this.rightArrowOnDraging = true;

        document.onmousemove = (me) => {
          currentPosition = beforeIndicatorPosition + (me.clientX - startPointX);

          if (currentPosition >= this.indicatorBeginPosition && currentPosition <= this.durationToWidth) {
            this.indicatorEndPosition = currentPosition;
          }
          
        };
        document.onmouseup = () => {
          this.rightArrowOnDraging = false;
          document.onmousemove = null;
          document.onmouseup = null;

          this.stop();

          this.$emit(
            'setTime',
            {
              id: this.id,
              unit: 'ms',
              begin: this.widthToTimeMapper(this.indicatorBeginPosition),
              end: this.widthToTimeMapper(this.indicatorEndPosition),
            }
          );
        };
      }
    },
    onPlayingAction() {
      if (this.playing) {
        this.pause();
      } else {
        this.start();
      }
    },
    onClickLock() {
      this.locked = !this.locked;
    },
    start() {
      this.playing = true;

      this.audio.start(
        this.widthToTimeMapper(this.indipos) / 1000,
        this.widthToTimeMapper(this.indicatorEndPosition) / 1000
      );
    },
    pause() {
      this.playing = false;
      this.audio.pause();
    },
    stop() {
      this.playing = false;
      this.indicatorPosition = this.indicatorBeginPosition;

      this.audio.stop();
    },
    onPlaying(e) {
      this.currentTime = e.playingTime;
      this.indicatorPosition = this.timeToWidthMapper(e.playingTime * 1000) + this.indicatorBeginPosition;
    },
    onEnd() {
      console.log('end event listener');
      this.playing = false;
      this.indicatorPosition = this.indicatorBeginPosition;
    },
    timeToWidthMapper(time) {
      return time / this.mapperMultiplier;
    },
    widthToTimeMapper(width) {
      return width * this.mapperMultiplier;
    }
  },
}
</script>

<style lang="scss" scoped>
$left-action-area-width: 150px;
$right-action-area-width: 100px;

.audio-inner-container {
  padding: 5px 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
}
.load-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.audio-container {
  position: relative;
  height: 100%;
}
.audio-player {
  position: relative;
  display: flex;
}
.audio-player > div {
  height: 100%;
}
.audio-player > div:nth-child(1) {
  /* 첫 번째 영역 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: $left-action-area-width;
  min-width: $left-action-area-width;
  max-width: $left-action-area-width;
}
.audio-player > div:nth-child(2) {
  /* 두 번째 영역 */
  overflow-x: auto;
  flex: 1 1 auto;
  width: 100%;
}
.audio-player > div:nth-child(3) {
  /* 세 번째 영역 */
  display: flex;
  justify-content: center;
  align-items: center;
  width: $right-action-area-width;
  min-width: 60px;
  max-width: 60px;
}
.action-buttons-wrapper {
  display: flex;
  margin-bottom: 10px;
}
.action-buttons-wrapper > button:nth-child(2) {
  margin-left: 10px;
}

.player-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.audio-player-arrows {
  position: relative;
  height: 20px;
}
.audio-player-arrows img {
  width: 10px;
  height: 10px;
}
.audio-player-arrows__begin {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 100%;
}
.audio-player-arrows__end {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 100%;
}


.audio-player-indication {
  /* 플레이어 색칠된 영역 */
  position: relative;
  // height: calc(100% - 20px);
  height: 20px; /* 플레이어 색칠된 영역 높이 */
  background-color: #acacac;
}
.audio-player__left-area {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #dfa512;
  z-index: 50;
}
.audio-player__indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: #f00;
  z-index: 100;
}
.audio-player__right-area {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #45db12;
  z-index: 50;
}
</style>