<template>
  <section v-if="chosenTicker" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ chosenTicker ? chosenTicker.name + " - USD" : "" }}
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, i) in normalizedGraph"
        ref="graphColumns"
        :key="i"
        :style="{ height: `${bar}%`, width: graphColumnWidth + 'px' }"
        class="bg-purple-800 border h-5"
      ></div>
    </div>
    <button @click="closeGraph" type="button" class="absolute top-0 right-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:svgjs="http://svgjs.com/svgjs"
        version="1.1"
        width="30"
        height="30"
        x="0"
        y="0"
        viewBox="0 0 511.76 511.76"
        style="enable-background: new 0 0 512 512"
        xml:space="preserve"
      >
        <g>
          <path
            d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
            fill="#718096"
            data-original="#000000"
          ></path>
        </g>
      </svg>
    </button>
  </section>
</template>
<script>
export default {
  data() {
    return {
      graphColumnWidth: 38,
      maxGraphValues: 1,
    };
  },
  props: {
    chosenTicker: {
      type: Object,
    },
    normalizedGraph: {
      type: Object,
    },
  },
  emits: {
    "calculated-maxGraphValues": (value) => typeof value === "number",
    "close-graph": (value) => value === undefined,
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphValue);
  },
  unmounted: function () {
    window.removeEventListener("resize", this.calculateMaxGraphValue);
  },
  methods: {
    closeGraph() {
      this.$emit("close-graph");
    },
    calculateMaxGraphValue() {
      if (!this.$refs.graph) {
        return;
      }

      this.maxGraphValues =
        this.$refs.graph.clientWidth / this.graphColumnWidth;

      this.$emit("calculated-maxGraphValues", this.maxGraphValues);
    },
  },
  watch: {
    chosenTicker() {
      this.$nextTick(() => {
        this.calculateMaxGraphValue();
      });
    },
  },
};
</script>
// сделать отдельный компонент с графиком и реализовать там подсчет кол-ва
столбцов графика через два ref (можно выделить в отдельный компонент строки
10-16)
