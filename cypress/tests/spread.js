function beDragging(spread) {
  expect(spread).to.have.class('aux-dragging');
}

describe('Spread', () => {
  it('is draggable witih class', () => {
    cy.visit('http://localhost:1234/tests/Spread.html').wait(500);

    cy.get('aux-spread')
      .eq(0)
      .within(($el) => {
        cy.get('.aux-lower').then(($btn) => {
          var $off = Cypress.$($btn).offset().left;
          var $newoff = $off;

          cy.get($btn)
            .move({ x: 10, y: 0, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().left;
              expect($newoff).to.be.greaterThan($off);
            })
            .move({ x: -20, y: 0, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().left;
              expect($newoff).to.be.lessThan($off);
            })
            .trigger('mousedown')
            .parents('aux-spread')
            .should(beDragging);
        });

        cy.get('.aux-upper').then(($btn) => {
          var $off = Cypress.$($btn).offset().left;
          var $newoff = $off;

          cy.get($btn)
            .move({ x: 10, y: 0, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().left;
              expect($newoff).to.be.greaterThan($off);
            })
            .move({ x: -20, y: 0, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().left;
              expect($newoff).to.be.lessThan($off);
            })
            .trigger('mousedown')
            .parents('aux-spread')
            .should(beDragging);
        });
      });

    cy.get('aux-spread')
      .eq(1)
      .within(($el) => {
        cy.get('.aux-lower').then(($btn) => {
          var $off = Cypress.$($btn).offset().top;
          var $newoff = $off;

          cy.get($btn)
            .move({ x: 0, y: -10, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().top;
              expect($newoff).to.be.lessThan($off);
            })
            .move({ x: 0, y: 20, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().top;
              expect($newoff).to.be.greaterThan($off);
            })
            .trigger('mousedown')
            .parents('aux-spread')
            .should(beDragging);
        });

        cy.get('.aux-upper').then(($btn) => {
          var $off = Cypress.$($btn).offset().top;
          var $newoff = $off;

          cy.get($btn)
            .move({ x: 0, y: -10, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().top;
              expect($newoff).to.be.lessThan($off);
            })
            .move({ x: 0, y: 20, force: true })
            .then(function () {
              $newoff = Cypress.$($btn).offset().top;
              expect($newoff).to.be.greaterThan($off);
            })
            .trigger('mousedown')
            .parents('aux-spread')
            .should(beDragging);
        });
      });
  });
});
