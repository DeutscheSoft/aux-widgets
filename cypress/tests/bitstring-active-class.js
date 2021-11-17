function beActive(button) {
  expect(button).to.have.class('aux-active');
  expect(button[0].auxWidget.get('state')).to.eq(true);
}

function beInactive(button) {
  expect(button).to.not.have.class('aux-active');
  expect(button[0].auxWidget.get('state')).to.eq(false);
}

function deactivateButton(button) {
  return button.setAuxOption('state', false);
}

describe('Bitstring', () => {
  it('click interaction', () => {
    cy.visit('http://localhost:1234/tests/examples/Bitstring.html');

    const buttons = cy.get('aux-bitstring .aux-button');

    buttons.each(($el) => {
      let button = deactivateButton(cy.wrap($el));

      button.click()
            .should(beActive);

      button.click()
            .should(beInactive);
    });
  });
});
