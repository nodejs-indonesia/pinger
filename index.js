const spawn = require('child_process').spawn;

/**
 * Ping hostname with OS ping and report every result with callback specified
 *
 * @param {string} hostname - Hostname to ping
 * @param {function} callback - Callback to report back result to caller
 **/
function ping (hostname, callback) {
  let cmd = spawn('ping', [hostname]);

  cmd.stdout.on('data', msg => {
    msg.toString().trim().split('\n').forEach(line => {
      // ignore empty line
      if (line === '') {
        return;
      }

      // ignore first line
      if (line.indexOf('PING') === 0) {
        return;
      }

      if (line.indexOf('Request timeout') === 0) {
        callback(new Error('Request timeout'));
        return;
      }

      // console.log('debug line:', line);

      callback(null, {
        ip: getIp(line),
        seq: getSeq(line),
        ttl: getTtl(line),
        time: getTime(line),
      });
    });
  });
}

/**
 * get ip data from line
 *
 * @param {string} line
 * @return {string}
 **/
function getIp (line) {
  let matches = line.match(/from ([^:]+):/);
  return matches[1];
}

/**
 * get sequence number data from line
 *
 * @param {string} line
 * @return {number}
 **/
function getSeq (line) {
  let matches = line.match(/icmp_seq=(\d+)/);
  return Number(matches[1]);
}

/**
 * get ttl data from line
 *
 * @param {string} line
 * @return {number}
 **/
function getTtl (line) {
  let matches = line.match(/ttl=(\d+)/);
  return Number(matches[1]);
}

/**
 * get time data from line
 *
 * @param {string} line
 * @return {number}
 **/
function getTime (line) {
  let matches = line.match(/time=([0-9.]+) ms/);
  return Number(matches[1]);
}

/**
 * export ping function
 **/
module.exports = ping;
