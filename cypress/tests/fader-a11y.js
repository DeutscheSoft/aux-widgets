describe('fader A11y test', () => {

  it('should be accessible', () => {

    cy.visit('http://localhost:8080/examples.html#Fader');

    cy.get('aux-fader').eq(0).then(($el, index, $list) => {

      cy.injectAxe();

      cy.checkA11y('.aux-handle');
      cy.checkA11y('.aux-input');

    });
  });
});
