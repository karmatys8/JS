// Source: https://udn.realityripple.com/docs/Tools/Performance/Scenarios/Intensive_JavaScript
function calculatePrimes(iterations) {
  var primes = [];
  for (var i = 0; i < iterations; i++) {
    var candidate = i * (1000000000 * Math.random());
    var isPrime = true;
    for (var c = 2; c <= Math.sqrt(candidate); ++c) {
      if (candidate % c === 0) {
        // not prime
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(candidate);
    }
  }
  this.postMessage(JSON.stringify(primes));
}

this.addEventListener("message", (e) => {
  calculatePrimes(e.data);
  this.close();
});
