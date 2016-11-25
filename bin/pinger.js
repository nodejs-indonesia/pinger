const ping = require('../index');
const spawn = require('child_process').spawn;

let hostname = process.argv[2] || 'google.com';
let online = false;

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

/**
 * Say message with OS text to speech
 * This function will push to queue to make sure saying not overlapped
 *
 * @param {string} msg - Message to say
 **/
function say (msg) {
  queue.push(msg);

  if (queue.length > 1) {
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

  msg = queue.shift();
  let cmd = spawn('say', [ msg ]);
  cmd.on('exit', sayFromQueue);
}

/**
 * Main function
 **/
ping(hostname, (err, data) => {
  if (err) {
    if (online) {
      say('Connection down');
      online = false;
    }
    console.error(`${now()} ERROR> ${err.message}`);
    return;
  }

  if (!online) {
    say('Connection up');
    online = true;
  }

  console.log(`${now()} from=${data.ip} ttl=${data.ttl} time=${data.time} ms`);
});
