describe('fader handle is dragged to min and to max values', () => {

  it('should have moved to min or max', () => {

    cy.visit('http://localhost:1234/tests/examples/Fader.html');
    
    function getTransY(el){
      var matrix = Cypress.$(el).css('transform').replace(/[^0-9\-.,]/g, '').split(',');
      var x = matrix[12] || matrix[4];
      var y = matrix[13] || matrix[5];
      return y;
    };

    function getTransX(el){
      var matrix = Cypress.$(el).css('transform').replace(/[^0-9\-.,]/g, '').split(',');
      var x = matrix[12] || matrix[4];
      var y = matrix[13] || matrix[5];
      return x;
    };

    cy.get('.aux-track').eq(0).within(($el) => {
      
      // jquery rounds heights up to px ceiling

      const win = $el[0].ownerDocument.defaultView;
      const before = win.getComputedStyle($el[0], 'before');
      const val = before.getPropertyValue('height')
      var v = parseInt(val)*-1; //full reduction
      console.log(v);

      cy.get('.aux-handle')
        .move({ x: 0, y: v, force: true })
        .then(($btn) => {
        var y = getTransY($btn);
        y = parseInt(y);
        console.log(y);
        expect(y).to.equal(v);
      });

      const v2 = parseInt(val);
      cy.get('.aux-handle')
        .move({ x: 0, y: v2, force: true })
        .then(($btn) => {
        var y2 = getTransY($btn);
        y2 = parseInt(y2);
        console.log(y2);
        expect(y2).to.equal(0);
      });

    });

    cy.get('.aux-track').eq(2).within(($el) => {
      
      // jquery rounds heights up to px ceiling

      const win = $el[0].ownerDocument.defaultView;
      const before = win.getComputedStyle($el[0], 'before');
      const val = before.getPropertyValue('width')

      var v = parseInt(val)*-1; //full reduction
      console.log(v);

      cy.get('.aux-handle')
        .move({ x: v, y: 0, force: true })
        .then(($btn) => {
        var x = getTransX($btn);
        x = parseInt(x);
        console.log(x);
        expect(x).to.equal(0);
      });

      const v2 = parseInt(val);
      cy.get('.aux-handle')
        .move({ x: v2, y: 0, force: true })
        .then(($btn) => {
        var x2 = getTransX($btn);
        x2 = parseInt(x2);
        console.log(x2);
        expect(x2).to.equal(v2);
      });
      
    });

  });
});
