<template>
  <div class="todo-wrapper">
    <h1>TODO</h1>
    <hr />
    <div>
      Фильтр:
      <input type="text" v-model="filter" :disabled="isEmptyTaskList" />
      <button @click="filter = ''">X</button>
    </div>
    <hr />
    <div v-if="filter">
      <div v-for="task in filteredTasks" :key="task.id">
        <div v-if="!task.editing">
          <div>
            <label>
              <input
                type="checkbox"
                name="task"
                :id="task.id"
                v-model="task.checked"
                @change="updateTask(task)"
              />
              <span @click="editTask(task)">{{ task.title }}</span>
            </label>

            <button @click="editTask(task)">Редактировать</button>
            <button class="task__delete-button" @click="deleteTask(task)">
              Удалить
            </button>
          </div>
        </div>
        <div v-if="task.editing">
          <input
            type="text"
            v-model="task.editingText"
            v-focus
            @keydown.esc="cancelEdit(task)"
            @keydown.enter="saveTask(task)"
          />
          <button @click="saveTask(task)">Сохранить</button>
          <button @click="cancelEdit(task)">Отмена</button>
        </div>
      </div>
    </div>
    <div v-else>
      <draggable v-model="unsolvedTasks" :options="dragOptions" item-key="id">
        <template #item="{ element }">
          <div>
            <div v-if="!element.editing">
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="task"
                    :id="element.id"
                    v-model="element.checked"
                    @change="updateTask(element)"
                  />
                  <span @click="editTask(element)">{{ element.title }}</span>
                </label>

                <button @click="editTask(element)">Редактировать</button>
                <button
                  class="task__delete-button"
                  @click="deleteTask(element)"
                >
                  Удалить
                </button>
              </div>
            </div>
            <div v-if="element.editing">
              <input
                type="text"
                v-model="element.editingText"
                v-focus
                @keydown.esc="cancelEdit(element)"
                @keydown.enter="saveTask(element)"
              />
              <button @click="saveTask(element)">Сохранить</button>
              <button @click="cancelEdit(element)">Отмена</button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <hr />
    <div class="input-wrapper">
      <div class="input-wrapper__input-container">
        <input
          type="text"
          v-model="taskTitle"
          @keydown.enter="add"
          class="input-wrapper__input"
        />
        <button @click="taskTitle = ''" class="input-wrapper__clear-button">
          X
        </button>
      </div>
      <button class="input-wrapper__add-button" @click="add">Add</button>
    </div>
    <div>
      <div v-for="task in unsolvedTasks" :key="task.id">
        <div
          v-if="!task.editing"
          v-drag="dragHandler"
          :drag-options="{ swipeDistance: 50 }"
        >
          <div>
            <label>
              <input
                type="checkbox"
                name="task"
                :id="task.id"
                v-model="task.checked"
              />
              {{ task.title }}
            </label>

            <button @click="editTask(task)">Редактировать</button>
            <button class="task__delete-button" @click="deleteTask(task)">
              Удалить
            </button>
          </div>
        </div>
        <div v-if="task.editing">
          <input
            type="text"
            v-model="task.editingText"
            v-focus
            @keydown.esc="cancelEdit(task)"
            @keydown.enter="saveTask(task)"
          />
          <button @click="saveTask(task)">Сохранить</button>
          <button @click="cancelEdit(task)">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { v4 as uuidv4 } from "uuid";
import focusDirective from "./directives/focus.js";

export default {
  name: "App",
  directives: {
    focus: focusDirective,
  },
  components: {
    draggable,
  },
  data() {
    return {
      unsolvedTasks: [],
      taskTitle: "",
      solvedTasks: [],
      dragOptions: {
        animation: 150,
      },
      filter: "",
    };
  },
  created: function () {
    const tasksData = localStorage.getItem("unsolvedTasks");
    if (tasksData) {
      this.unsolvedTasks = JSON.parse(tasksData);
    }
  },
  computed: {
    filteredTasks() {
      return this.unsolvedTasks.filter((task) =>
        this.filterTasks(task.title, this.filter)
      );
    },
    isEmptyTaskList() {
      return this.filteredTasks.length === 0 && this.filter === "";
    },
  },
  methods: {
    dragHandler(state) {
      console.log(state);
      // if (x < 0) {
      //   console.log("swipe left");
      // }
      // if (x > 0) {
      //   console.log("swipe right");
      // }
    },

    add() {
      if (!this.taskTitle) {
        return;
      }
      const taskId = uuidv4();
      this.unsolvedTasks.push({
        id: taskId,
        title: this.taskTitle,
        checked: false,
        editing: false,
        editingText: this.taskTitle,
      });
      localStorage.setItem("unsolvedTasks", JSON.stringify(this.unsolvedTasks));
      this.taskTitle = "";
    },
    deleteTask(task) {
      this.unsolvedTasks = this.unsolvedTasks.filter(
        (t) => t.title !== task.title
      );

      localStorage.setItem("unsolvedTasks", JSON.stringify(this.unsolvedTasks));
    },
    filterTasks(task, filter) {
      task = task.toLowerCase();
      filter = filter.toLowerCase();
      const filterWords = filter.split(" ");
      for (const word of filterWords) {
        if (!task.includes(word)) {
          return;
        }
      }
      return true;
    },
    updateTask(task) {
      if (task.checked === true) {
        this.solvedTasks.push(task);
        console.log(this.solvedTasks);
        this.unsolvedTasks = this.unsolvedTasks.filter((t) => t !== task);
        localStorage.setItem(
          "unsolvedTasks",
          JSON.stringify(this.unsolvedTasks)
        );
      }
    },
    saveTask(task) {
      this.unsolvedTasks.forEach((t) => {
        if (task.title === t.title) {
          t.title = task.editingText;
        }
      });
      task.editing = false;
      if (this.filteredTasks.length === 0) {
        this.filter = "";
      }
    },
    editTask(task) {
      // this.filter = "";

      task.editing = true;
      this.unsolvedTasks.forEach((t) => {
        if (t.title !== task.title) {
          t.editing = false;
        }
      });
    },
    cancelEdit(task) {
      task.editingText = task.title;
      task.editing = false;
    },
  },
  watch: {
    unsolvedTasks: {
      handler() {
        localStorage.setItem(
          "unsolvedTasks",
          JSON.stringify(this.unsolvedTasks)
        );
      },
      deep: true,
    },
  },
};
</script>
<style scoped>
.todo-wrapper {
  max-width: 800px;
  margin: 0 auto;
}
.task {
  width: 400px;
}
.task__title {
  align-self: flex-start;
  margin-right: 5px;
}
.task__delete-button {
  align-self: flex-end;
}
.input-wrapper {
  display: flex;
  flex-direction: column;
}

.input-wrapper__input-container {
  display: flex;
  align-items: center;
}

.input-wrapper__input {
  flex: 1;
}

.input-wrapper__clear-button {
  margin-left: 5px;
}

.input-wrapper__add-button {
  margin-top: 5px;
}
</style>
