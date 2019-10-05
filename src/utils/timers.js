/**
 * @module aux
 */

/**
 * This class represents a single timer. It is faster than manual setTimeout
 * in situations in which the timer is regularly delayed while it is running.
 */
export class Timer
{
  /**
   *
   * @param callback - The callback to be called when the timer expires.
   */
  constructor(callback)
  {
    this.callback = callback;
    this.id = void(0);
    this.time = 0;
    this._cb = () => {
      const delta = performance.now() - this.time;

      this.id = void(0);

      if (delta < 1)
      {
        this.callback();
      }
      else
      {
        this.id = setTimeout(this._cb, delta);
      }
    };
  }

  /**
   * Start the timer with a given offset. Same as restart().
   */
  start(delta)
  {
    this.restart(delta);
  }

  /**
   * Set a new expiry time for the timer at the given number
   * of milliseconds from now.
   *
   * @param delta - Offset in milliseconds.
   */
  restart(delta)
  {
    const time = performance.now() + delta;
    const id = this.id;

    if (id !== void(0))
    {
      if (time > this.time)
      {
        this.time = time;
        return;
      }

      clearTimeout(id);
    }

    this.time = time;
    this.id = setTimeout(this._cb, delta);
  }

  /**
   * Stop the timer.
   */
  stop()
  {
    const id = this.id;

    if (id === void(0)) return;
    this.id = void(0);

    clearTimeout(id);
  }
}