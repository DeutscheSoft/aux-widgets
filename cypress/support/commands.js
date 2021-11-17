import '@4tw/cypress-drag-drop';

function getAuxWidget(subject) {
  const element = subject[0];

  if (!element.isAuxWidget)
    throw new TypeError('Argument is not an aux widget.');

  return element.auxWidget;
}

Cypress.Commands.add('onAuxEvent', { prevSubject: 'element' }, (subject, event, callback) => {
  const widget = getAuxWidget(subject);

  widget.on(event, callback);

  return subject;
});

Cypress.Commands.add('auxOption', { prevSubject: 'element' }, (subject, name) => {
  const widget = getAuxWidget(subject);

  return widget.get(name);
});
