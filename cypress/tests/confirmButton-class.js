describe('ConfirmButton test class and text', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/ConfirmButton.html');

    cy.get('aux-confirmbutton').then(($el, index, $list) => {

      cy.get('.aux-icon').should('have.class', 'warning');
      
      cy.get($el).click().within(() => {

        cy.get('.aux-icon').should('have.class', 'questionmark');

        cy.get('.aux-label').should('have.text', "Are you sure?");

      });
        
    });

  });
});
