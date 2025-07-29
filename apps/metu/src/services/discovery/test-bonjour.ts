import Bonjour from 'bonjour-service';

console.log('Bonjour type:', typeof Bonjour);
console.log('Bonjour:', Bonjour);

try {
    const instance = new Bonjour.Bonjour();
    console.log('new Bonjour.Bonjour() worked:', instance);
} catch (e) {
    console.log('new Bonjour.Bonjour() failed:', e);
}

try {
    const instance = new Bonjour.default();
    console.log('new Bonjour.default() worked:', instance);
} catch (e) {
    console.log('new Bonjour.default() failed:', e);
}
