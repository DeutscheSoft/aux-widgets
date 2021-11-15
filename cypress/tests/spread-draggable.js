describe('spread handles are dragged', () => {

  it('should have moved', () => {

    cy.visit('http://localhost:1234/tests/examples/Spread.html');

    cy.get('aux-spread').eq(0).within(($el) => {

      cy.get('.aux-lower').then(($btn) => {

        var $off = Cypress.$($btn).offset().left;
        var $newoff = $off;

        cy.get($btn)
          .wait(1500)
          .move({ x: -100, y: 0, force: true })
          .then(function(){
          $newoff = Cypress.$($btn).offset().left;
          expect($newoff).to.be.lessThan($off);
        });

        cy.get($btn)
          .move({ x: 100, y: 0, force: true });

      });    

      cy.get('.aux-upper').then(($btn) => {

        var $off = Cypress.$($btn).offset().left;
        var $newoff = $off;

        cy.get($btn)
          .wait(1500)
          .move({ x: 100, y: 0, force: true })
          .then(function(){
          $newoff = Cypress.$($btn).offset().left;
          expect($newoff).to.be.greaterThan($off);
        });

      });    

    });

    cy.get('aux-spread').eq(1).within(($el) => {

      cy.get('.aux-lower').then(($btn) => {

        var $off = Cypress.$($btn).offset().top;
        var $newoff = $off;

        cy.get($btn)
          .wait(1500)
          .move({ x: 0, y: -100, force: true })
          .then(function(){
          $newoff = Cypress.$($btn).offset().top;
          expect($newoff).to.be.lessThan($off);
        });

        cy.get($btn)
          .move({ x: 0, y: 100, force: true });

      });    

      cy.get('.aux-upper').then(($btn) => {

        var $off = Cypress.$($btn).offset().top;
        var $newoff = $off;

        cy.get($btn)
          .wait(1500)
          .move({ x: 0, y: 100, force: true })
          .then(function(){
          $newoff = Cypress.$($btn).offset().top;
          expect($newoff).to.be.greaterThan($off);
        });

      });    

    });
  });
});
