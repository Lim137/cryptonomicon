<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="!dataCoinsList"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <add-ticker
        @add-ticker="add"
        :tickers="tickers"
        :allVariants="dataCoinsList"
      />
      <template v-if="!isEmptyTickersList">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <p>
            Страница {{ page }} из {{ Math.ceil(filteredTickers.length / 6.0) }}
          </p>
          <button
            class="my-4 inline-flex mr-2 items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="page > 1"
            @click="page = page - 1"
          >
            Назад
          </button>
          <button
            class="my-4 inline-flex ml-2 items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="haveNextPage"
            @click="page = page + 1"
          >
            Вперед
          </button>
          <button @click="delAll">Очистить все</button>
          <div>
            Фильтр: <input type="text" v-model="filter" />
            <span id="clearButton" @click="clearInput()">✕</span>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-white': !incorrectTickers.includes(t.name),
              'bg-red-100': incorrectTickers.includes(t.name),
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="del(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <display-graph
        :normalizedGraph="normalizedGraph"
        :chosenTicker="selectedTicker"
        @calculated-maxGraphValues="updateMaxGraphValues"
        @close-graph="closeGraph"
      />
    </div>
  </div>
</template>

<script>
import * as api from "./api";
import AddTicker from "./components/AddTicker.vue";
import DisplayGraph from "./components/DisplayGraph.vue";

export default {
  name: "App",
  components: {
    AddTicker,
    DisplayGraph,
  },
  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      dataCoinsList: null,
      page: 1,
      filter: "",
      incorrectTickers: [],
      maxGraphValues: 1,
    };
  },
  created: async function () {
    const f = await fetch(
      `https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c`
    );
    const objCoinsList = await f.json();

    this.dataCoinsList = Object.values(objCoinsList.Data).map(function (item) {
      return item.FullName;
    });
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }
    const tickersData = localStorage.getItem("cryptonomicon-list");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        api.subscribeToTickers(ticker.name, (newPrice) =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }
    const broadcastChannel = new BroadcastChannel("reactivityBetweenTabs");
    broadcastChannel.addEventListener("message", (event) => {
      const { action } = event.data;
      if (action === "changeTickers") {
        const tickersData = localStorage.getItem("cryptonomicon-list");
        if (tickersData) {
          const originalTickers = this.tickers.map((ticker) => ticker.name);
          this.tickers = JSON.parse(tickersData);
          const addedTickers = this.tickers.filter(function (ticker) {
            return !originalTickers.includes(ticker.name);
          });
          addedTickers.forEach((ticker) => {
            api.subscribeToTickers(ticker.name, (newPrice) =>
              this.updateTicker(ticker.name, newPrice)
            );
          });
        } else {
          this.tickers = [];
        }
      }
    });
    window.addEventListener("socket error", this.WebSocketErrorProcessing);
  },
  unmounted: function () {
    window.removeEventListener("socket error", this.WebSocketErrorProcessing);
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    haveNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter,
      };
    },
    isEmptyTickersList() {
      return this.tickers.length === 0;
    },
  },
  methods: {
    closeGraph() {
      this.selectedTicker = null;
    },
    updateMaxGraphValues(value) {
      this.maxGraphValues = value;
      this.removeExcessValuesFromStart();
    },
    removeExcessValuesFromStart() {
      if (this.graph.length > this.maxGraphValues) {
        this.graph.splice(0, this.graph.length - this.maxGraphValues);
      }
    },
    WebSocketErrorProcessing(event) {
      this.incorrectTickers.push(event.detail);
    },
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          t.price = price;
          if (t === this.selectedTicker) {
            this.graph.push(price);
            this.removeExcessValuesFromStart();
          }
        });
    },
    formatPrice(price) {
      if (typeof price === "number" && !isNaN(price)) {
        return price > 1 ? price.toFixed(2) : price.toPrecision(5);
      } else {
        return price; // Возвращаем исходное значение price, если оно не является числом
      }
    },
    clearInput() {
      this.filter = "";
      this.page = 1;
    },

    add(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase(),
        price: "-",
      };
      this.filter = "";
      this.page = 1;

      this.selectedTicker = null;
      const newTickers = [...this.tickers, currentTicker];
      localStorage.setItem("cryptonomicon-list", JSON.stringify(newTickers));
      const broadcastChannel = new BroadcastChannel("reactivityBetweenTabs");
      broadcastChannel.postMessage({
        action: "changeTickers",
      });
    },

    del(tickerToDel) {
      const tickersListWithoutTickerToDel = this.tickers.filter(
        (t) => t !== tickerToDel
      );
      localStorage.setItem(
        "cryptonomicon-list",
        JSON.stringify(tickersListWithoutTickerToDel)
      );
      this.selectedTicker = null;

      api.unsubscribeFromTickers(tickerToDel.name);
      const broadcastChannel = new BroadcastChannel("reactivityBetweenTabs");
      broadcastChannel.postMessage({
        action: "changeTickers",
      });
    },

    select(selectedElem) {
      this.selectedTicker = selectedElem;
      this.graph.push(selectedElem.price);
    },

    delAll() {
      localStorage.setItem("cryptonomicon-list", []);
      this.selectedTicker = null;
      const broadcastChannel = new BroadcastChannel("reactivityBetweenTabs");
      broadcastChannel.postMessage({
        action: "changeTickers",
      });
    },
  },
  watch: {
    selectedTicker() {
      this.graph = [];
      // this.$nextTick(() => {
      //   this.calculateMaxGraphValue();
      // });
    },
    graph() {
      if (this.graph.length > this.maxGraphValues) {
        this.graph.splice(0, this.graph.length - this.maxGraphValues);
      }
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
