export class PluginSystem {
  #hooks = new Map();

  on(eventName, handler) {
    if (!this.#hooks.has(eventName)) this.#hooks.set(eventName, new Set());
    this.#hooks.get(eventName).add(handler);

    return () => {
      this.#hooks.get(eventName)?.delete(handler);
    };
  }

  emit(eventName, payload) {
    const handlers = this.#hooks.get(eventName);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }
}
