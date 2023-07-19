import { useDrag } from "@vueuse/gesture";

export default {
  mounted(el, binding) {
    const { onDrag } = binding.value;

    const options = {
      drag: {
        filterTaps: true,
        swipeDistance: 50, // Минимальное расстояние (в пикселях) для срабатывания свайпа
      },
    };

    useDrag(
      (event) => {
        const { swipe, tap } = event;
        onDrag(swipe, tap);
      },
      {
        domTarget: el,
        ...options,
      }
    );
  },
};
