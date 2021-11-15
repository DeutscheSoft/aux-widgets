describe('button test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Buttons.html');

    cy.get('aux-buttons .aux-button').eq(0).then(($el, index, $list) => {

      cy.get($el).click().should('have.class', 'aux-active');

      cy.get($el).siblings().should('not.have.class', 'aux-active');
    
    });

    cy.get('aux-buttons .aux-button').eq(1).then(($el, index, $list) => {

      cy.get($el).click().should('have.class', 'aux-active');

      cy.get($el).siblings().should('not.have.class', 'aux-active');
    
    });

    cy.get('aux-buttons .aux-button').eq(2).then(($el, index, $list) => {

      cy.get($el).click().should('have.class', 'aux-active');

      cy.get($el).siblings().should('not.have.class', 'aux-active');
    
    });

    cy.get('aux-buttons').eq(3).then(($el, index, $list) => {

      cy.get($el).within(() => {

        cy.get('aux-button').each(($btn) => {

          cy.get($btn).click().should('have.class', 'aux-active');

          cy.get($btn).siblings().should('not.have.class', 'aux-active');

        });
        
      })

    });

  });
});
