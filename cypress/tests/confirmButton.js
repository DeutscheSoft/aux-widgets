describe('ConfirmButton', () => {
  it('test event, class and text', () => {
    cy.visit('http://localhost:1234/tests/ConfirmButton.html');

    cy.get('aux-confirmbutton').then(($el) => {
      const cb = cy.spy();

      cy.get('.aux-icon').should('have.class', 'warning');

      cy.wrap($el)
        .onAuxEvent('click', cb)
        .click()
        .then(() => {
          expect(cb).to.be.called;
          cy.get('.aux-icon').should('have.class', 'questionmark');
          cy.get('.aux-label').should('have.text', 'Are you sure?');
        })
        .wait(2000)
        .then(() => {
          cy.get('.aux-icon').should('have.class', 'warning');
        });
    });
  });
});
