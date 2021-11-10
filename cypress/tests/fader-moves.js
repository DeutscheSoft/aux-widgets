describe('fader widget test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Fader.html');

    cy.get('.aux-handle').move({ x: 100, y: 100, force: true });

    // check fader moves, x pixel/ Knob, tricky, svg testing? try: Did the internal value update?
    //

    /*
    cy.get('#tips aux-button').click();

    cy.get('aux-button.add').click();

    cy.get('.url input').type('10.0.0.124').get('.port input').type('65000{enter}');

    cy.get('.list aes70-device').each(() => {
      cy.get('.ocadevice').click();
    });

    cy.get('aes70-block aux-icon.ocablock').each(($el) => {
      cy.get($el).click();
    });

    cy.get('.add').each(($el) => {
      cy.get($el).click();
    });

    cy.get('#sidebar aux-confirmbutton').click();
    cy.get('#sidebar aux-confirmbutton').click();

    cy.get('aes70-object aux-confirmbutton').each(($el) => {
      cy.get($el).should('have.class', 'remove');
      cy.get($el).should('have.class', 'add');
    });
*/
  });
});
