export default class ActiveTask {
  constructor(func, frequency = 300) {
    this.frequency = frequency;
    this.func = func;
    this.interval = null;
  }

  start() {
    try {
      this.interval = setInterval(this.func, this.frequency);
    } catch (e) {
      this.interval = null;
      console.warn(e);
    }
  }

  stop() {
    clearInterval(this.interval);
  }
}
