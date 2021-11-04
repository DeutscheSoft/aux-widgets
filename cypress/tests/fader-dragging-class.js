describe('fader dragging class set', () => {

  it('should have draggable class when mousedown', () => {

    cy.visit('http://localhost:8080/examples.html#Fader');

    cy.get('div.aux-handle').each(($el, index, $list) => {

      cy.get($el).trigger('mousedown');
      cy.get($el).parents('aux-fader').should('have.class', 'aux-dragging');

    });
  });
});
