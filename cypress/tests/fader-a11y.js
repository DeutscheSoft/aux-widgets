describe('fader A11y test', () => {

  it('should be accessible', () => {

    cy.visit('http://localhost:1234/tests/examples/Fader.html');

    cy.get('aux-fader').eq(0).then(($el, index, $list) => {

      cy.injectAxe();

      cy.checkA11y('.aux-handle');
      cy.checkA11y('.aux-input');

    });
  });
});
