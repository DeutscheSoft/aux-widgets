const backstop = require('backstopjs');
const start_http = require('./http_server.js').start;
const readdirp = require('readdirp');
const path = require('path');

const config = {
  "id": "backstop_default",
  "viewports": [
    {
      "label": "phone",
      "width": 320,
      "height": 480
    },
    {
      "label": "tablet",
      "width": 1024,
      "height": 768
    }
  ],
  "onBeforeScript": "puppet/onBefore.js",
  "onReadyScript": "puppet/onReady.js",
  "scenarios": [ ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "report": ["browser"],
  "engine": "puppeteer",
  "engineOptions": {
    "args": ["--no-sandbox"]
  },
  "asyncCaptureLimit": 5,
  "asyncCompareLimit": 50,
  "debug": false,
  "debugWindow": false
};

const http_port = 1234;

function make_scenario(path)
{
  return {
    "label": path,
    "url": "http://localhost:" + http_port + "/tests/" + path,
    "referenceUrl": "",
    "readyEvent": "",
    "readySelector": "",
    "delay": 100,
    "hideSelectors": [],
    "removeSelectors": [],
    "hoverSelector": "",
    "clickSelector": "",
    "postInteractionWait": 0,
    "selectors": [],
    "selectorExpansion": true,
    "expect": 0,
    "misMatchThreshold" : 0.5,
    "requireSameDimensions": true
  };
}

start_http(http_port);

readdirp(path.join(__dirname, 'tests'), { fileFilter: '*.html' })
  .on('data', (entry) => {
    config.scenarios.push(make_scenario(entry.path));
   })
  .on('end', () => {
    backstop(process.argv[2] || 'test', {
        config: config
      }).then(
        function() {
          console.log('All good.');
          process.exit(0);
        },
        function(e) {
          console.error(e);
          process.exit(1);
        }
      );
   });

