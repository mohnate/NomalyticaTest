(function() {
  $('#mm-pass').focus(function(){
    $(this).parents('.mm-formgroup').addClass('mm-movelabel');
  });

  $('#mm-pass').blur(function(){
    var inputValue = $(this).val();
    if ( inputValue == "" ) {
      $(this).removeClass('filled');
      $(this).parents('.mm-formgroup').removeClass('mm-movelabel');  
    } else {
      $(this).addClass('filled');
    }
  });

  $(document).ready(function() {
    $(".mm-formgroup").addClass("mm-movelabel");

    const myTimeout = setTimeout(loading, 2000);

    function loading() {
        $(".mm-loading").css("z-index", -1);
    }
  });

  let pass = document.getElementById('mm-pass');

  if (!pass) {
    // If the variable is undefined, assign it
    pass = document.getElementById('mm-pass');
  }

  const inputHandler = function(e) {
    $(".mm-wrong-pass").hide();
    if(e.target.value == '')
      $(".mm-unlocksubmit").removeClass("mm-entered");
    else
      $(".mm-unlocksubmit").addClass("mm-entered");
  }

  if (pass) {
    pass.addEventListener('input', inputHandler);
  }

  $(".mm-unlocksubmit").click(function() {
    if($(".mm-unlocksubmit").hasClass("mm-entered"))
      $(".mm-wrong-pass").show();
  });

  // $(document).click(function(event) {
  //   if (!$(event.target).closest("#mm-container").length) {
  //     $("body").find("#mm-container").addClass("invisible");
  //   }
  // })

})();