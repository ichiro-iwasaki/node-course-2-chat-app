var socket = io();

socket.on('connect', function() {
  console.log('connectです!');
  var params = jQuery.deparam(window.location.search);
  if (params.name && params.password) {
    socket.emit('login', params, function (err) {
      if (err) {
        console.log('なんらかのエラーでログインできません。');
      } else {
        console.log('ログインできました！');
      }
    });
  };

  socket.on('userFromDB', (user) => {
    jQuery('#user-information').append('<div></div>').text(user.name);
    console.log('ログインしているユーザー名をjQueryで画面表示します。');
  });

});



