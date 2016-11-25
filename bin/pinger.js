#!/usr/bin/env node

const ping = require('../index');
const spawn = require('child_process').spawn;

const SLA_MESSAGES = ["excellent", "good", "bad"];

let hostname = process.argv[2] || 'google.com';
let online = false;
let sla = 0;

/**
 * Get time now as string
 *
 * @return {string}
 **/
function now () {
  let t = new Date();
  return `${t.getFullYear()}-${pad(t.getMonth(), 2)}-${pad(t.getDate(), 2)} ${pad(t.getHours(), 2)}:${pad(t.getMinutes(), 2)}:${pad(t.getSeconds(), 2)}`;
}

/**
 * Format number with padding
 *
 * @param {number} num - Number to format
 * @param {number} width - Padding width
 * @return {string}
 **/
function pad (num, width) {
  num = num + '';
  return num.length >= width ? num : new Array(width - num.length + 1).join('0') + num;
}

let queue = [];
let running = false;

/**
 * Say message with OS text to speech
 * This function will push to queue to make sure saying not overlapped
 *
 * @param {string} msg - Message to say
 **/
function say (msg) {
  queue.push(msg);

  if (running) {
    return;
  }

  sayFromQueue();
}

/**
 * Internal function to say from queue
 * This function will recursively say from queue until queue is empty
 **/
function sayFromQueue () {
  if (queue.length === 0) {
    return;
  }

  running = true;

  msg = queue.shift();

  let cmd = spawn('say', [ msg ]);
  cmd.on('exit', () => {
    running = false;
    sayFromQueue();
  });
}

function getSla (time) {
  if (time <= 100) {
    return 1;
  }

  if (time <= 500) {
    return 2;
  }

  return 3;
}

let errCount = 0;
/**
 * Main function
 **/
ping(hostname, (err, data) => {
  if (err) {
    if (sla !== 0) {
      errCount++;
      if (errCount < 3) {
        return;
      }
      sla = 0;
      say('Connection down');
    }
    console.error(`${now()} error=${err.message}`);
    return;
  }

  errCount = 0;

  let newSla = getSla(data.time);
  if (newSla !== sla) {
    sla = newSla;
    say(`Connection up with service level ${SLA_MESSAGES[sla - 1]}`);
  }

  console.log(`${now()} from=${data.ip} ttl=${data.ttl} time=${data.time} ms`);
});
