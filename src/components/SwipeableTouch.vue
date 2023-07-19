<template>
  <div
    ref="swipeContainer"
    @touchstart.passive="handleSwipeStart"
    @touchmove.passive="handleSwipeMove"
    @touchend="handleSwipeEnd"
  >
    <slot />
  </div>
</template>

<script>
export default {
  data() {
    return {
      startX: 0,
      diff: 0,
      threshold: 100, // Минимальное расстояние для определения свайпа (в пикселях)
    };
  },
  methods: {
    handleSwipeStart(event) {
      this.startX = event.touches[0].clientX;
      this.diff = 0;
    },
    handleSwipeMove(event) {
      if (this.startX) {
        const currentX = event.touches[0].clientX;
        this.diff = currentX - this.startX;
      }
    },
    handleSwipeEnd() {
      if (Math.abs(this.diff) > this.threshold) {
        if (this.diff > 0) {
          // Свайп вправо
          this.$emit("swipeRight");
        } else {
          // Свайп влево
          this.$emit("swipeLeft");
        }
      }
      this.diff = 0;
      this.startX = 0;
    },
  },
};
</script>
