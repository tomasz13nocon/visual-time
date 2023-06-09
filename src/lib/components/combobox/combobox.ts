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

  let popoverNode: HTMLElement;
  let isFocused = false;

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

  function showListbox() {
    listboxVisible.set(true);
    filterValues();
  }

  function hideListbox() {
    listboxVisible.set(false);
    focusedValue.set(null);
    // filteredValues.set(localValues);
  }

  function onBlur(e: FocusEvent) {
    if (popoverNode.contains(e.relatedTarget)) {
      return;
    }
    hideListbox();
  }

  function containerKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
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
        break;
      case "ArrowUp":
        if (localFocusedValue) {
          const index = localFilteredValues.indexOf(localFocusedValue);
          focusedValue.set(localFilteredValues[Math.max(index - 1, 0)] ?? null);
        } else {
          focusedValue.set(localFilteredValues[localFilteredValues.length - 1] ?? null);
          listboxVisible.set(true);
        }
        localFocusedValue?._node?.scrollIntoView({ block: "nearest" });
        break;
      case "Enter":
        if (localFocusedValue) {
          acceptItem(localFocusedValue);
        }
        break;
      case "Escape":
        hideListbox();
        break;
      case "Tab":
        hideListbox();
        break;
    }
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

  function comboboxInput(node: HTMLInputElement) {
    node.addEventListener("focus", showListbox);
    node.addEventListener("blur", onBlur);
    node.addEventListener("input", onInputInput);
    node.addEventListener("keydown", containerKeydown);

    return {
      destroy() {
        node.removeEventListener("focus", showListbox);
        node.removeEventListener("blur", onBlur);
        node.removeEventListener("input", onInputInput);
        node.removeEventListener("keydown", containerKeydown);
      },
    };
  }

  function comboboxPopover(node: HTMLElement) {
    popoverNode = node;
  }

  return {
    listboxVisible,
    focusedValue,
    filteredValues,
    inputValue,
    comboboxInput,
    comboboxItem,
    comboboxPopover,
  };
}
