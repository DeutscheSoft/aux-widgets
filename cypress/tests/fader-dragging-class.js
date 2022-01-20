describe('fader dragging class set', () => {
  it('should have draggable class when mousedown', () => {
    cy.visit('http://localhost:1234/tests/examples/Fader.html');

    cy.get('div.aux-handle').each(($el) => {
      cy.get($el).trigger('mousedown');
      cy.get($el).parents('aux-fader').should('have.class', 'aux-dragging');
    });
  });
});
