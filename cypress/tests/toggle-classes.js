describe('Toggle buttons - class and inner class test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Toggle.html');

    cy.get('aux-toggle').eq(0).within(($el) => {

      cy.get('.aux-icon').should('have.class', 'warning');
      
    }).click().then(() => {

      cy.get('.aux-icon').should('have.class', 'success');

    })

    //mousedown hold

    cy.get('aux-toggle').eq(1).within(($el) => {

      cy.get('.aux-icon').should('not.have.class', 'aux-delayed');
      
    });

    cy.get('aux-toggle').eq(1).trigger('mousedown')
      .within(($el) => {

      cy.get($el).should('have.class', 'aux-delayed');

      cy.get('.aux-icon').should('have.class', 'warning');

    }).trigger('mouseup').then(($el) => {
      
      cy.get($el).should('not.have.class', 'aux-delayed');

      cy.get('.aux-icon').should('have.class', 'warning');

    });

    cy.get('aux-toggle').eq(1).trigger('mousedown')
      .wait(5000)
      .within(($el) => {

      cy.get($el).should('have.class', 'aux-active');

      cy.get('.aux-icon').should('have.class', 'success');

    }).trigger('mouseup').then(($el) => {
      
      cy.get($el).should('have.class', 'aux-active');

      cy.get('.aux-icon').should('have.class', 'success');

    });

    //mouse hold release toggle

    cy.get('aux-toggle').eq(2).within(($el) => {

      cy.get($el).should('not.have.class', 'aux-active');

      cy.get('.aux-icon').should('have.class', 'warning');

    });

    cy.get('aux-toggle').eq(2).trigger('mousedown')
      .wait(5000)
      .within(($el) => {

      cy.get($el).should('have.class', 'aux-active');

      cy.get('.aux-icon').should('have.class', 'success');

    }).trigger('mouseup').then(($el) => {
      
      cy.get($el).should('not.have.class', 'aux-active');

      cy.get('.aux-icon').should('have.class', 'warning');

    });
  });
});
