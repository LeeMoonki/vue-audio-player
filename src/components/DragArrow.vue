<template>
  <div class="arrow-container">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="20" viewBox="0 0 20 20">
      <g fill="none" fill-rule="evenodd">
        <path
          fill="#fff"
          fill-opacity="0"
          d="
            M 0 0
            h 20
            v 20
            H 0
            z"
        />
        <path
          :stroke="color"
          :fill="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="
            M 3 3
            L 17 3
            L 10 17
            Z"
        />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'DragArrow',
  props: {
    color: {
      type: String,
      default: '#dedede'
    }
  }
}
</script>

<style scroped>
.arrow-container {
  width: 100%;
  height: 100%;
}
</style>
