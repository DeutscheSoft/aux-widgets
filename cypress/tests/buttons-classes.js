function beActive(button) {
  expect(button).to.have.class('aux-active');
  expect(button[0].auxWidget.get('state')).to.eq(true);
}

function beInactive(button) {
  expect(button).to.not.have.class('aux-active');
  expect(button[0].auxWidget.get('state')).to.eq(false);
}

function beWarning(button) {
  expect(button).to.not.have.class('aux-warn');
}

function deactivateButton(button) {
  return button.setAuxOption('state', false);
}

describe('Buttons', () => {
  it('events and classes', () => {

    cy.visit('http://localhost:1234/tests/Buttons.html');

    cy.get('aux-buttons').eq(0).within(($el) => {

      const buttons = cy.get('.aux-button');

      let oldb = {};
      
      buttons.each(($el) => {
        
        let button = cy.wrap($el);

        if(!Cypress.$.isEmptyObject(oldb)) {
          oldb.should(beInactive);
        }
        button.click()
              .should(beActive);

        oldb = button;
      
      });
    });


    cy.get('aux-buttons').eq(1).within(($el) => {

      const buttons = cy.get('.aux-button');

      buttons.each(($el, i) => {
        
        let button = cy.wrap($el);
        
        if(i < 2) {
          button.click()
                .should(beActive);
        }
        if(i > 1) {
          button.click()
                .should(beWarning)
                .wait(500)
                .should(beInactive);
        }
      });

      buttons.each(($el, i) => {
        
        let button = cy.wrap($el);
        
        if(i === 1) {
          deactivateButton(button);
        }
        if(i === 2) {
          button.click()
                .should(beActive);
        }
        if(i > 2) {
          button.click()
                .should(beWarning)
                .wait(500)
                .should(beInactive);
        }

      });
    });


    cy.get('aux-buttons').eq(2).within(($el) => {

      const buttons = cy.get('.aux-button');

      buttons.each(($el, i) => {
       
        let button = cy.wrap($el);
        
        button.click()
              .should(beActive)
              .wait(100)
              .click()
              .should(beInactive);
        });

      let oldb = {};
      
      buttons.each(($el, i) => {
        
        let button = cy.wrap($el);
        
        if(!Cypress.$.isEmptyObject(oldb)) {
          oldb.should(beInactive);
        }
        
        button.click()
              .should(beActive)
              .wait(100)
              .click()
              .should(beInactive);
        
        oldb = button;

      });

    });

    cy.get('aux-buttons').eq(3).within(($el) => {

      const buttons = cy.get('aux-button');

      let oldb = {};
      
      buttons.each(($el, i) => {
        
        let button = cy.wrap($el);
        
        if(!Cypress.$.isEmptyObject(oldb)) {
          oldb.should(beInactive);
        }
        
        button.click()
              .should(beActive);

        oldb = button;

      });

    });

  });
});
