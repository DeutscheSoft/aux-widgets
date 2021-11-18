describe('Button', () => {
  it('click event', () => {
    cy.visit('http://localhost:1234/tests/examples/Button.html');

    cy.get('aux-button').each(($el) => {
      const cb = cy.spy();

      cy.wrap($el)
        .onAuxEvent('click', cb)
        .click()
        .then(() => {
          expect(cb).to.be.called;
        });
    });
  });
});
