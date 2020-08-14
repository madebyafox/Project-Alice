import $ from 'jquery'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {dumpDB, log} from "./database"

console.log("IN ANNOTATION");

// Shorthand for $( document ).ready()
$(function() {

  //FOCUS on modal
  $("#annotateModal").on('shown.bs.modal', function () {
      $(this).find("input:visible:first").focus();
  });

  //close window on backdrop click
  $("#backdrop").on("click", function(){
    window.close();
  });

  //send message and save on annotation click
  $("#saveAnnotation").on("click", function(){
    chrome.runtime.sendMessage({type:"annotation", result:$("#annotation").val()}, function(response) {
     // console.log(annotation.value);
     return true;
     });
    window.close()
  });

});
