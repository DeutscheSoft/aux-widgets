import { warn } from './log.js';

function expected_subscribers()
{
  throw new TypeError('Expected list of subscribers.');
}

export function init_subscribers()
{
  return null;
}

export function subscribers_is_empty(subscribers)
{
  return subscribers === null;
}

export function add_subscriber(subscribers, cb)
{
  if (typeof cb !== 'function')
    throw new TypeError('Expected function.');

  if (subscribers === null)
  {
    return cb;
  }
  else if (typeof subscribers === 'function')
  {
    return [ subscribers, cb ];
  }
  else if (Array.isArray(subscribers))
  {
    return subscribers.concat([ cb ]);
  }
  else expected_subscribers();
}

function subscriber_not_found()
{
  throw new Error('Subscriber not found.');
}

export function remove_subscriber(subscribers, cb)
{
  if (typeof cb !== 'function')
    throw new TypeError('Expected function.');

  if (subscribers === null)
  {
    subscriber_not_found();
  }
  else if (typeof subscribers === 'function')
  {
    if (subscribers !== cb)
      subscriber_not_found();

    return null;
  }
  else if (Array.isArray(subscribers))
  {
    const tmp = subscribers.filter((_cb) => _cb !== cb);

    if (tmp.length === subscribers.length)
      subscriber_not_found();

    return (tmp.length === 1) ? tmp[0] : tmp;
  }
  else expected_subscribers();
}

function subscriber_error(err)
{
  warn('Subscriber generated an exception:', err); 
}

export function call_subscribers(subscribers, ...args)
{
  if (subscribers === null) return;

  if (typeof subscribers === 'function')
  {
    try
    {
      subscribers(...args);
    }
    catch (err)
    {
      subscriber_error(err);
    }
  }
  else if (Array.isArray(subscribers))
  {
    for (let i = 0; i < subscribers.length; i++)
    {
      try
      {
        subscribers[i](...args);
      }
      catch (err)
      {
        subscriber_error(err);
      }
    }
  }
  else expected_subscribers();
}
