'use strict';

const WASM_URL = '../../../wasm.wasm';

var wasm;
var logLine = [];
var memory8;

const go = new Go();
var importObject = {
  env: {
    'syscall/js.stringVal': go.importObject.go['syscall/js.stringVal'],
    'syscall/js.valueGet': go.importObject.go['syscall/js.valueGet'],
    'syscall/js.valueSet': go.importObject.go['syscall/js.valueSet'],
    'syscall/js.valueCall': go.importObject.go['syscall/js.valueCall'],
    'syscall/js.valueNew': go.importObject.go['syscall/js.valueNew'],
    'syscall/js.valuePrepareString': go.importObject.go['syscall/js.valuePrepareString'],
    'syscall/js.valueLoadString': go.importObject.go['syscall/js.valueLoadString'],

    io_get_stdout: function() {
      return 1;
    },
    resource_write: function(fd, ptr, len) {
      if (fd == 1) {
        for (let i=0; i<len; i++) {
          let c = memory8[ptr+i];
          if (c == 13) { // CR
            // ignore
          } else if (c == 10) { // LF
            // write line
            let line = new TextDecoder("utf-8").decode(new Uint8Array(logLine));
            logLine = [];
            console.log(line);
          } else {
            logLine.push(c);
          }
        }
      } else {
        console.error('invalid file descriptor:', fd);
      }
    },
  },
};

function updateResult() {
  wasm.exports.update();
}

function init() {
  document.querySelector('#a').oninput = updateResult;
  document.querySelector('#b').oninput = updateResult;

  WebAssembly.instantiateStreaming(fetch(WASM_URL), importObject).then(function(obj) {
    wasm = obj.instance;
    memory8 = new Uint8Array(wasm.exports.memory.buffer);
    go.run(wasm);
    //wasm.exports.cwa_main();
    updateResult();
  })
}

init();
