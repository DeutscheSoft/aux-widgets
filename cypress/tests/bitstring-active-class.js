describe('button test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Bitstring.html');

    cy.get('aux-bitstring .aux-button').eq(0).then(($el, index, $list) => {

      cy.get($el).click().should('have.class', 'aux-active');
    });

    cy.get('aux-bitstring .aux-button').eq(1).then(($el, index, $list) => {

      cy.get($el).click().should('not.have.class', 'aux-active');


    });

  });
});
