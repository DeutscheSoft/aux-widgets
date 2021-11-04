describe('fader dragging class set', () => {

  it('successfully loads', () => {

    cy.visit('http://localhost:8080/examples.html#Fader');

    cy.get('div.aux-handle').eq(0).then(($el, index, $list) => {

      var $off = Cypress.$($el).offset().top;
      var $newoff = $off;
      cy.get($el)
        .wait(1500)
        .move({ x: 0, y: -100, force: true })
        .then(function(){
          $newoff = Cypress.$($el).offset().top;
          expect($newoff).to.be.lessThan($off);
        });
      });
    });
  });
