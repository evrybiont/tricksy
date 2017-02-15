/*!
 * jQuery Tricksy Plugin v1.0
 *
 * Based on Jquery by Jörn Zaefferer
 *
 * Copyright (c) 2017 Sasha Stadnyk
 *
 * Released under the MIT license
 */

(function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    define( ['jquery'], factory );
  } else if ( typeof module === 'object' && module.exports ) {
    module.exports = factory( require('jquery' ) );
  } else {
    factory( jQuery );
  }
}(function( $ ) {

$.extend($.fn, {
  tricksy: function( options ) {

    var tManager = $.data( this[0], 'tManager' );
    if ( tManager ) { return tManager }
    
    tManager = new $.tManager( options, this );
    $.data( this[0], 'tManager', tManager )

    if ( tManager.settings.onBtnClick ) {
      $(tManager.guns).on( 'click', function( event ) {
        tManager.currentVictim = $.data( this, 'victim' );
        event.preventDefault();
        tManager.bringDown();
      });
    }

    return tManager;
  },

  laws: function() {
    return $.tManager.defaults.rules;
  }
});

$.tManager = function( options, element ) {
  this.settings = $.extend( true, {}, $.tManager.defaults, options );
  this.children = $( element ).children();
  this.currentContent = element[0];
  this.currentVictim = undefined;
  this.victims = [];
  this.guns = [];
  this.init();
}

$.tManager.format = function( source, params ) {
  if ( arguments.length === 1 ) {
    return function() {
      var args = $.makeArray( arguments );
      args.unshift( source );
      return $.tManager.format.apply( this, args );
    };
  }
  if ( params === undefined ) {
    return source;
  }
  if ( arguments.length > 2 && params.constructor !== Array  ) {
    params = $.makeArray( arguments ).slice( 1 );
  }
  if ( params.constructor !== Array ) {
    params = [ params ];
  }
  $.each( params, function( i, n ) {
    source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
      return n;
    });
  });
  return source;
};

$.extend( $.tManager, {
  defaults: {
    onBtnClick: true,
    parentClass: 'myTricksy',

    rules: {
      required: true,
      minlength: 3
    },

    onkeyup: function( element, event ) {
      var tManager = $.data( $('.myTricksy')[0], 'tManager' );

      tManager.currentVictim = element
      tManager.bringDown();
    }
  },

  messages: {
    required: 'This field is required.',
    minlength: $.tManager.format( "Please enter at least {0} characters." )
  },

  prototype: {
    init: function() {
      var guns = this.guns,
          victims = this.victims;

      function delegate( event ) {
        var tManager = $.data( $('.myTricksy')[0], 'tManager' ),
            eventType = 'on' + event.type,
            settings = tManager.settings;

        if ( settings[eventType] ) {
          settings[eventType].call( tManager, this, event );
        }
      }

      this.currentContent.classList.add(this.settings.parentClass);
     
      $.each( this.children, function ( i ) {
        var victim = $( this ).find( 'input' );
        victim.attr( 'name', 'victim_' + i );
        victims.push(victim.addClass( 'victim_' + i )[0]);

        var gun = $( this ).find( 'a, button' );
        $.data( gun[0], 'victim', victim[0] );
        guns.push( gun.addClass('gun_' + i)[0] );
      });


      $(victims).on('keyup', delegate)
    },

    bringDown: function() {
      this.reset();
      this.checkVictim();
      this.displayError();

      return this;
    },

    reset: function() {
      this.errorList = [];
      this.errorMap = {};
    },

    checkVictim: function() {
      var rules = this.settings.rules,
          result, method;


      for ( method in rules ) {
        rule = { method: method, parameters: rules[method] };

        try {
          result = this.methods[method].call( this, this.currentVictim.value, rule.parameters);

          if ( !result ) {
            this.installWhy(rule);
            console.log(rule);
            console.log(this.errorMap);
            return false;
          }
        } catch (e) {
        }
      }
    },

    installWhy: function( rule ) {
      var element = this.currentVictim,
          message = this.defaultMessage( element, rule );

      this.errorList.push({
        message: message,
        element: element,
        method: rule.method
      });

      this.errorMap[element.name] = message;
    },

    defaultMessage: function( element, rule ) {
      if ( typeof rule === 'string' ) {
        rule = { method: rule };
      }

      var message = $.tManager.messages[rule.method];

      if ( typeof message === 'function' ) {
        message = message.call( this, rule.parameters, element );
      }

      return message;
    },

    displayError: function() {
      var msg = this.errorMap[this.currentVictim.name];

      if ( !msg ) {
        this.removeError();
        return false
      }

      var errorMsg = '<span class="label-victim-demage">' + msg,
          errorLabel = $(this.currentVictim).next( '.label-victim-demage' );

      $( this.currentVictim ).addClass( 'victim-demage' );
      if ( errorLabel.length > 0 ) {
        errorLabel.replaceWith( errorMsg );  
      } else {
        $(this.currentVictim).after( errorMsg );
      }
    },

    removeError: function() {
      var label = $(this.currentVictim).siblings( '.label-victim-demage' );

      if (!!label) {
        label.remove();
        this.currentVictim.classList.remove( 'victim-demage' );
      }

      return false
    },

    methods: {
      required: function( value ) {
        return value.length > 0;
      },

      minlength: function( value, param ) {
        return value.length >= param;
      }
    }
  }
});

}));

$('.categories-container').tricksy();
