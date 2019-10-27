const backstop = require('backstopjs');
const start_http = require('./http_server.js').start;
const path = require('path');
const fs = require('fs');

function find_chrome()
{
    const locations = [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/chrome-browser"
    ];

    const chrome = locations.filter((path) => fs.existsSync(path))[0];

    if (!chrome)
        throw new Error('Could not find chrom(e|ium) executable to use.');

    return chrome;
}

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
  "report": [],
  "engine": "puppeteer",
  "engineOptions": {
    "args": ["--no-sandbox"],
    executablePath: find_chrome(),
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
    "delay": 500,
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

function readdir_recursive(p)
{
  const entries = fs.readdirSync(p);
  let ret = [];

  for (let i = 0; i < entries.length; i++)
  {
    const fname = path.join(p, entries[i]);
    ret.push(fname);

    try
    {
      ret = ret.concat(readdir_recursive(fname));
    }
    catch (err)
    {
    }
  }

  return ret;
}

const test_files = readdir_recursive(path.join(__dirname, "tests"))
  .filter((fname) => fname.endsWith(".html"))
  .filter((fname) => !fname.includes("Clock")); // ignore clock for now

test_files.map((fname) => {
  config.scenarios.push(make_scenario(fname));
});

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
