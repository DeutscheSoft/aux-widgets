const connect = require('connect');
const static = require('serve-static');
const path = require('path');
const fs = require('fs');

const HTDOCS = path.join(__dirname, 'htdocs');
const TESTS = path.join(__dirname, 'tests');

const frame = fs.readFileSync(path.join(HTDOCS, 'frame.html'), { encoding: 'utf8' });

function start(port)
{
  connect()
      .use('/tests', function(req, res, next) {
        const url = req.originalUrl;

        const test_name = url.substr('/tests'.length + 1);
        let test

        try
        {
          test = fs.readFileSync(path.join(TESTS, test_name), { encoding: 'utf8' });
        } catch (e) {}

        if (test)
        {
          let data = frame.replace('NAME', test_name)
                          .replace('CONTENT', test);

          res.end(data, 'text/html');
        }
        else
        {
          next();
        }
       })
      .use(static(HTDOCS))
      .listen(port);
}

module.exports = {
  start: start,
};
