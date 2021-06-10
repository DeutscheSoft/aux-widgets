/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

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

function maybeAddStyle(fname) {
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

        head += maybeAddStyle(fname.replace('html', 'css'));
        head += maybeAddStyle(path.join(path.dirname(fname), 'styles.css'));

        let data = frame
          .replace('NAME', test_name)
          .replace('CONTENT', test)
          .replace('HEAD', head);
        res.setHeader('Content-Type', 'text/html');
        res.end(data, 'utf-8');
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
    .use('/', function (req, res, next) {
      res.writeHead(301, { Location: '/tests/' });
      res.end();
    })
    .listen(port);
}

module.exports = {
  start: start,
};
