import { derived, get, writable, type Writable } from "svelte/store";

type Value = { value: string; _node?: HTMLElement | null };

interface Options<T> {
  onSelection?: (value: T) => void;
}

export function createCombobox<T extends Value>(
  values: T[] | Writable<T[]>,
  { onSelection }: Options<T> = {}
) {
  const listboxVisible = writable(false);
  const filteredValues = writable<T[]>([]);
  const focusedValue = writable<T | null>(null);
  const inputValue = writable<string>("");
  let localValues: T[] = [];
  let localListboxVisible = false;
  let localFilteredValues: T[] = [];
  let localFocusedValue: T | null = null;
  let localInputValue = "";

  let focused = false;

  inputValue.subscribe((value) => {
    localInputValue = value;
  });
  ("subscribe" in values
    ? derived(values as Writable<T[]>, ($values) => $values)
    : writable(values as T[])
  ).subscribe((values) => {
    localValues = values.map((v) => ({ ...v, _node: null }));
    filterValues();
  });
  listboxVisible.subscribe((value) => (localListboxVisible = value));
  filteredValues.subscribe((values) => (localFilteredValues = values));
  focusedValue.subscribe((value) => (localFocusedValue = value));

  function filterValues() {
    filteredValues.set(
      localValues.filter((value) => {
        return value.value.toLowerCase().includes(localInputValue.toLowerCase());
      })
    );
  }

  function onInputInput() {
    filterValues();
  }

  function acceptItem(value: T) {
    inputValue.set(value.value);
    filterValues();
    hideListbox();
    onSelection && onSelection(value);
  }

  function comboboxItem(node: HTMLElement, value: T) {
    const acceptThisItem = acceptItem.bind(null, value);
    node.addEventListener("click", acceptThisItem);
    value._node = node;

    return {
      destroy() {
        node.removeEventListener("click", acceptThisItem);
      },
    };
  }

  function showListbox() {
    listboxVisible.set(true);
    filterValues();
  }

  function hideListbox() {
    listboxVisible.set(false);
    focusedValue.set(null);
    // filteredValues.set(localValues);
  }

  function hideListboxDelay() {
    setTimeout(() => hideListbox(), 200);
  }

  function comboboxInput(node: HTMLInputElement) {
    node.addEventListener("focus", showListbox);
    node.addEventListener("blur", hideListboxDelay);
    node.addEventListener("input", onInputInput);

    return {
      destroy() {
        node.removeEventListener("focus", showListbox);
        node.removeEventListener("blur", hideListboxDelay);
        node.removeEventListener("input", onInputInput);
      },
    };
  }

  function comboboxContainer(node: HTMLElement) {
    function containerKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        hideListbox();
      } else if (event.key === "ArrowDown") {
        if (localFocusedValue) {
          const index = localFilteredValues.indexOf(localFocusedValue);
          focusedValue.set(
            localFilteredValues[Math.min(index + 1, localFilteredValues.length - 1)] ?? null
          );
        } else {
          focusedValue.set(localFilteredValues[0] ?? null);
          listboxVisible.set(true);
        }
        localFocusedValue?._node?.scrollIntoView({ block: "nearest" });
      } else if (event.key === "ArrowUp") {
        if (localFocusedValue) {
          const index = localFilteredValues.indexOf(localFocusedValue);
          focusedValue.set(localFilteredValues[Math.max(index - 1, 0)] ?? null);
        } else {
          focusedValue.set(localFilteredValues[localFilteredValues.length - 1] ?? null);
          listboxVisible.set(true);
        }
        localFocusedValue?._node?.scrollIntoView({ block: "nearest" });
      } else if (event.key === "Enter") {
        if (localFocusedValue) {
          acceptItem(localFocusedValue);
        }
      }
    }

    node.addEventListener("keydown", containerKeydown);

    return {
      destroy() {
        node.removeEventListener("keydown", containerKeydown);
      },
    };
  }

  return {
    listboxVisible,
    focusedValue,
    filteredValues,
    inputValue,
    comboboxInput,
    comboboxContainer,
    comboboxItem,
  };
}
