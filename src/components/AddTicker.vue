<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="
              repeat = false;
              findMatchingVariants();
            "
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <button
            v-for="(variant, idx) in similarVariants"
            :key="idx"
            @click="autocompleteTicker(variant)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ variant }}
          </button>
        </div>
        <div v-if="repeat" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add()" />
  </section>
</template>
<script>
import AddButton from "./AddButton.vue";
export default {
  data() {
    return {
      ticker: "",
      repeat: false,
      similarVariants: [],
    };
  },
  components: {
    AddButton,
  },
  props: {
    tickers: {
      type: Object,
      required: true,
    },
    allVariants: {
      type: Object,
      required: true,
    },
  },
  emits: {
    "add-ticker": (value) => typeof value === "string",
  },
  methods: {
    add() {
      if (!this.ticker) {
        return;
      }
      const currentTicker = {
        name: this.ticker.toUpperCase(),
        price: "-",
      };
      this.similarVariants = [];
      this.isRepeat(currentTicker.name);
      if (this.repeat) {
        this.similarVariants = [this.ticker.toUpperCase()];
      } else {
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
      }
    },
    isRepeat(tickerName) {
      if (!this.tickers) {
        return false;
      }
      const allTickersNames = this.tickers.map((t) => t.name);
      this.repeat = allTickersNames.includes(tickerName);
    },
    findMatchingVariants() {
      const inputText = this.ticker;
      if (this.ticker === "") {
        this.similarVariants = [];
        return;
      }
      const regex = /\((.*?)\)/; // Регулярное выражение для извлечения текста в скобках
      const shortVariants = this.allVariants.map(
        (variant) => variant.match(regex)[1]
      ); // Получаем массив коротких записей

      const matchingVariants = shortVariants.filter((variant) =>
        variant.toLowerCase().includes(inputText.toLowerCase())
      );

      matchingVariants.sort(
        (a, b) =>
          this.countMatches(b.toLowerCase(), inputText.toLowerCase()) -
          this.countMatches(a.toLowerCase(), inputText.toLowerCase())
      );

      let result = matchingVariants.slice(0, 4);

      if (result.length < 4) {
        const fullVariants = this.allVariants.filter((variant) =>
          variant.toLowerCase().includes(inputText.toLowerCase())
        );

        const additionalVariants = fullVariants
          .map((variant) => variant.match(regex)[1])
          .filter((variant) => !result.includes(variant));

        result = result.concat(additionalVariants.slice(0, 4 - result.length));
      }

      this.similarVariants = result;
    },

    countMatches(str, sub) {
      const regex = new RegExp(sub, "g");
      return (str.match(regex) || []).length;
    },
    autocompleteTicker(tickerName) {
      this.ticker = tickerName;
      this.add();
    },
  },
};
</script>
