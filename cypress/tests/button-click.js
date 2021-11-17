describe('button click test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Button.html');

    cy.get('aux-button').each(($el, index, $list) => {
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
