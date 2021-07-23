type SizeListener = (rect: DOMRect) => void;

export default function size(node: HTMLElement, listener: SizeListener) {
  const observer = new ResizeObserver((_entries, _observer) => listener(node.getBoundingClientRect()));

  observer.observe(node);

  return {
    update(newListener: SizeListener) {
      listener = newListener;
    },
    destroy() {
      observer.disconnect();
    }
  };
}
