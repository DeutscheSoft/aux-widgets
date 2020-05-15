const docdash = require('docdash').publish;

function publish(data, opts, tutorials) {
  const classes = new Map();

  const extends_base = (cl) => {
    while (cl) {
      if (cl.name === 'Base') return true;
      if (!cl.augments) break;
      cl = classes.get(cl.augments[0]);
    }

    return false;
  };

  const parents = (cl) => {
    let ret = [];

    if (cl.augments) {
      cl.augments
        .map((name) => classes.get(name))
        .forEach((parent) => {
          if (!parent) return;
          ret.push(parent);
          ret = ret.concat(parents(parent));
        });
    }

    if (cl.mixes) {
      cl.mixes
        .map((name) => classes.get(name))
        .forEach((parent) => {
          if (!parent) return;
          ret.push(parent);
          ret = ret.concat(parents(parent));
        });
    }

    return ret;
  };

  data().each(function (doclet) {
    if (doclet.kind !== 'class' && doclet.kind !== 'mixin') return;
    classes.set(doclet.name, doclet);
  });

  classes.forEach((cl) => {
    if (!extends_base(cl)) return;

    if (!cl.properties) cl.properties = [];

    const properties = cl.properties.slice(0);

    parents(cl).forEach((parent) => {
      if (!parent.properties) return;
      parent.properties.forEach((property) => {
        if (!property.name.startsWith('options.')) return;
        if (properties.some((p) => p.name === property.name)) return;
        const p = Object.assign({}, property);
        p.description = p.description.substr(0, p.description.length - 4);
        p.description += ' (<i>Defined in {@link ' + parent.name + '}</i>)</p>';
        properties.push(p);
      });
    });

    data({ name: cl.name }).update({ properties: properties });
  });

  opts.template = 'node_modules/docdash';
  return docdash(data, opts, tutorials);
}

exports.publish = publish;
