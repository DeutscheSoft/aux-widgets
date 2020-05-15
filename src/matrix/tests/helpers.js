let ok;

export function assert(x, msg) {
  if (!x) throw new Error(msg || 'Assertion failed.');
  ok++;
}

export function assert_error(cb) {
  try {
    cb();
    assert(false, 'Expected an error.');
  } catch (err) {
    ok++;
    // we expect this
  }
}

export function test(name, cb) {
  let err;

  try {
    ok = 0;
    cb();
  } catch (e) {
    err = e;
  }

  console.log(' - %s .. %s (%d checks)', name, err ? 'FAIL' : 'OK', ok);

  if (err) console.error(err);
}
