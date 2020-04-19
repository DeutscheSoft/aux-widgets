export function assert(x, msg)
{
  if (!x) throw new Error(msg || 'Assertion failed.');
}

export function test(name, cb)
{
  let err;

  try
  {
    cb();
  }
  catch (e)
  {
    err = e;
  }

  console.log(' - %s .. %s', name, err ? 'FAIL' : 'OK');

  if (err)
    console.error(err);
}

