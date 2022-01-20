function beVisible(modal) {
  expect(modal).to.have.class('aux-show');
}

function beHidden(modal) {
  expect(modal).to.have.class('aux-hide');
}

describe('Dialog', () => {
  it('click event open close modals', () => {
    cy.visit('http://localhost:1234/tests/Dialog.html');

    const dialogs = cy.get('aux-dialog');
    dialogs.each(($el) => {
      let dialog = cy.wrap($el);
      dialog.should(beHidden);
    });

    const buttons = cy.get('aux-button');

    buttons.each(($el, i) => {
      const cb = cy.spy();

      cy.wrap($el)
        .onAuxEvent('click', cb)
        .click()
        .then(() => {
          expect(cb).to.be.called;
        });
    });
    buttons.each(($el, i) => {
      cy.get($el)
        .click()
        .then(() => {
          if (i === 0) {
            cy.get('#dialog1').should(beVisible);
            cy.get('#dialog2').should(beHidden);
          } else {
            cy.get('#dialog1').should(beHidden);
          }
          if (i === 1) {
            cy.get('#dialog2').should(beVisible);
          }
          if (i === 2) {
            cy.get('#dialog2').should(beHidden);
          }
        });
    });
  });
});
