describe('Dialog modal open close behaviour', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Dialog.html');

    cy.get('#dialog1').should('not.have.class', 'aux-show');
    cy.get('#dialog2').should('not.have.class', 'aux-show');

    cy.get('aux-button').eq(0).click().then(($el) => {

      cy.get('#dialog1').should('have.class', 'aux-show');
      
      cy.get('body').click(0,0).within(() => {

        cy.get('#dialog1').should('have.class', 'aux-hide');

      });
        
    });

    cy.get('aux-button').eq(1).click().then(($el) => {

      cy.get('#dialog2').should('have.class', 'aux-show').within(() => {

        cy.get('aux-button').click().parent().should('have.class', 'aux-hide');

      });
        
    });

  });
});
