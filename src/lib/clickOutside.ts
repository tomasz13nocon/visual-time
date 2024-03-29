/** Dispatch event on click outside of node */
export function clickOutside(node: HTMLElement, preventElement?: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented &&
      !(preventElement && preventElement.contains(event.target as Node))
    ) {
      node.dispatchEvent(new CustomEvent("clickOutside", { detail: event.target }));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
