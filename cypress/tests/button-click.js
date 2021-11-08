describe('button test', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:8080/examples.html#Button');

    cy.get('aux-button').eq(0).then(($el, index, $list) => {

      cy.get($el).click();

    });

    cy.get('aux-button').eq(1).then(($el, index, $list) => {

      cy.get($el).click();

    });

  });
});
