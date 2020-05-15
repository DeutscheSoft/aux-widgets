const connect = require('connect');
const sstatic = require('serve-static');
const serveIndex = require('serve-index');
const path = require('path');
const fs = require('fs');

const HTDOCS = path.join(__dirname, 'htdocs');
const TESTS = path.join(__dirname, 'tests');

const frame = fs.readFileSync(path.join(HTDOCS, 'frame.html'), {
  encoding: 'utf8',
});

function maybe_add_style(fname) {
  let ret = '';
  if (fs.existsSync(fname)) {
    const pathname = '/' + fname.substr(HTDOCS.length);
    ret += '<link rel=stylesheet href="' + pathname + '" />';
  }
  return ret;
}

function start(port) {
  connect()
    .use('/tests', function (req, res, next) {
      const url = req.originalUrl;

      const test_name = url.substr('/tests'.length + 1);

      if (!test_name.endsWith('.html')) {
        next();
        return;
      }

      let test;
      const fname = path.join(TESTS, test_name);

      try {
        test = fs.readFileSync(fname, { encoding: 'utf8' });
      } catch (e) {}

      if (test) {
        let head = '';

        head += maybe_add_style(fname.replace('html', 'css'));
        head += maybe_add_style(path.join(path.dirname(fname), 'styles.css'));

        let data = frame
          .replace('NAME', test_name)
          .replace('CONTENT', test)
          .replace('HEAD', head);

        res.end(data, 'text/html');
      } else {
        next();
      }
    })
    .use(sstatic(HTDOCS))
    .use(sstatic(TESTS))
    .use(
      '/tests',
      serveIndex(TESTS, {
        view: 'details',
      })
    )
    .listen(port);
}

module.exports = {
  start: start,
};
