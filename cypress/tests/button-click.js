describe('button test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:1234/tests/examples/Button.html');

    cy.get('aux-button').eq(0).then(($el, index, $list) => {

      cy.get($el).click();

    });

    cy.get('aux-button').eq(1).then(($el, index, $list) => {

      cy.get($el).click();

    });

  });
});
