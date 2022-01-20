function beActive(toggle) {
  expect(toggle).to.have.class('aux-active');
  expect(toggle[0].auxWidget.get('state')).to.eq(true);
}

function beInactive(toggle) {
  expect(toggle).to.not.have.class('aux-active');
  expect(toggle[0].auxWidget.get('state')).to.eq(false);
}

function beSuccessful(toggle) {
  expect(toggle).to.have.class('success');
}

function beDelayed(toggle) {
  expect(toggle).to.not.have.class('aux-delayed');
}

function beWarning(toggle) {
  expect(toggle).to.have.class('warning');
}

function deactivateToggle(toggle) {
  return toggle.setAuxOption('state', false);
}

describe('Toggle', () => {
  it('class and event', () => {
    cy.visit('http://localhost:1234/tests/Toggle.html');

    cy.get('aux-toggle').each(($el, i) => {
      let toggle = cy.wrap($el);
      const cb = cy.spy();

      switch (i) {
        case 0:
          toggle
            .trigger('mousedown')
            .wait(2000)
            .trigger('mouseup')
            .should(beActive)
            .children('.aux-icon')
            .then(($icon) => {
              beSuccessful($icon);
            })
            .parent()
            .click();

          deactivateToggle(toggle);

          toggle
            .should(beInactive)
            .onAuxEvent('click', cb)
            .click()
            .should(beActive)
            .then(() => {
              expect(cb).to.be.called;
            });

          break;

        case 1:
          toggle
            .trigger('mousedown')
            .wait(2000)
            .trigger('mouseup')
            .should(beActive)
            .children('.aux-icon')
            .then(($icon) => {
              beSuccessful($icon);
            })
            .parent()
            .trigger('mousedown')
            .wait(2000)
            .trigger('mouseup')
            .should(beInactive)
            .children('.aux-icon')
            .then(($icon) => {
              beWarning($icon);
            })
            .parent()
            .then(() => {
              deactivateToggle(toggle);
            })
            .onAuxEvent('click', cb)
            .click()
            .then(() => {
              expect(cb).to.be.called;
            })
            .should(beInactive)
            .children('.aux-icon')
            .then(($icon) => {
              beWarning($icon);
            });

          break;

        case 2:
          toggle
            .trigger('mousedown')
            .wait(2000)
            .trigger('mouseup')
            .should(beInactive)
            .children('.aux-icon')
            .then(($icon) => {
              beWarning($icon);
            })
            .parent()
            .then(() => {
              deactivateToggle(toggle);
            })
            .onAuxEvent('click', cb)
            .click()
            .then(() => {
              expect(cb).to.be.called;
            })
            .should(beActive)
            .children('.aux-icon')
            .then(($icon) => {
              beSuccessful($icon);
            })
            .parent()
            .click();

          break;
        default:
      }
    });
  });
});
