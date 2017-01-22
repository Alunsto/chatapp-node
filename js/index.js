var last_sender;

$(document).ready(function() {
  /*
  writeText("computer", "are you ready?", "left");
  setTimeout(function() {
    var options = {
      "id": "ready",
      "question": "are you ready?",
      "option_one_text": "yes",
      "option_one_value": 1,
      "option_one_response": "good then",
      "option_two_text": "no",
      "option_two_value": 0,
      "option_two_response": "too bad",
      "general_response": "Let's begin",
      "time_until_general": 1500
    }
    writeOption(options);
  },700);
  */
});

function writeText(name, text, justification, repeat) {
  justification_capital = justification.capitalizeFirstLetter();
  if (repeat) {
  var to_write = `
  <div class="row">
  <div class="col-md-12">
  <h1 class="animated bounceIn`+justification_capital+` `+justification+` message-text">`+text+`</h1>
  </div>
  </div>
  `;
  }
  else {
  var to_write = `
  <div class="row">
  <div class="col-md-12">
  <!-- <hr width="5%" align="left" style="margin-left:2vw;"> -->
  <i><h4 class="animated bounceIn`+justification_capital+` `+justification+` name-text">`+name+`</h4></i>
  <h1 class="animated bounceIn`+justification_capital+` `+justification+` message-text">`+text+`</h1>
  </div>
  </div>
  `;
  }
  $(".wrapper").append(to_write);
  toBottom("message_area");
}

function writeOption(options) {
  if ($("."+options.id).length != 0) {
    console.log("id already taken");
    return;
  }
  if (typeof options.general_response === "undefined") {
    options.general_response = "";
  }
  if (typeof options.question === "undefined") {
    options.question = "";
  }
  var to_write = `
  <div class="row">
  <div class="col-md-12">
  <h2 class="animated bounceInLeft"><i>`+options.question+`</i></h2>
  <button class="`+options.id+` animated bounceInLeft minimal-button" value="`+options.option_one_value+`" data-response="`+options.option_one_response+`" data-general-response="`+options.general_response+`" data-time-until-general-response="`+options.time_until_general+`">`+options.option_one_text+`</button>
  <button class="`+options.id+` animated bounceInLeft minimal-button" value="`+options.option_two_value+`" data-response="`+options.option_two_response+`" data-general-response="`+options.general_response+`" data-time-until-general-response="`+options.time_until_general+`">`+options.option_two_text+`</button>
  </div>
  </div>
  `;
  $(".wrapper").append(to_write);
  toBottom("message_area");
  $("#input_text").prop("disabled", true);
}
function respond(text) {
    setTimeout(function() {
      writeText("computer", text, "left");
    }, 600);
}

$(document).on("click", "button", function() {
  var id = $(this).attr('class').split(' ')[0];
  var value = $(this).attr('value');
  var response = $(this).attr('data-response');
  $("."+id).removeClass("minimal-button");
  $("."+id).addClass("minimal-button-static");
  $(this).removeClass("minimal-button-static");
  $(this).addClass("minimal-button-static-selected");
  $("."+id).prop('disabled', true);
  respond(response);
  if ($(this).attr('data-general-response') != "") {
    var general_response = $(this).attr('data-general-response')
    var time_until_general_response = $(this).attr('data-time-until-general-response')
    setTimeout(function() {
      respond(general_response);
      $("#input_text").prop("disabled", false);
    },time_until_general_response);
  }
});

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

function toBottom(div) {
  $("#"+div).scrollTop($("#"+div)[0].scrollHeight);
}

function hash()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

//Connected to server
socket.on('connect', function(data) {
  console.log('Connected to server ');
}

//Connection close
socket.on('disconnect', function(data) {
  console.log('Disconnected');
};

//Message Receved
socket.on('message', function(data) {
  //alert('Message '+ev.data);
  var data = JSON.parse(ev.data); //PHP sends Json data
  console.log(JSON.stringify(data, null, 4));
  if (data.msgtype == "user-msg" && JSON.parse(data.sender_id) != user_id) {
    console.log(data.msgtype);
    var sender_name = JSON.parse(data.sender_name);
    var message = JSON.parse(data.message);
    if (JSON.parse(data.sender_id) == last_sender) {
    writeText(sender_name, message, "left", true);
    }
    else {
    writeText(sender_name, message, "left", false);
    }
      last_sender = JSON.parse(data.sender_id);
  }
  else if (data.msgtype == "num_connected") {
    var num_users = JSON.parse(data.num_connected);
    online_users_symbols = ""
    for (var i = 0 ; i < num_users; i++) {
      online_users_symbols += `<i class="fa fa-circle-o" aria-hidden="true"></i>`;
    }
    $("#online-users-area").html(online_users_symbols);
    console.log(num_users+" connected");
  }
  else if (data.msgtype == "num_connected") {

  }
};

//Error
socket.on('error', function(data) {
  console.log('Error '+ev.data);
};

function sendMessage() {
  var message = $("#input_text").val();
  if (message != "") {
    var websocket_data = {
      name: JSON.stringify(user_name),
      user_id: JSON.stringify(user_id),
      message: JSON.stringify(message),
    };

    websocket.send(JSON.stringify(websocket_data));
  }
}
