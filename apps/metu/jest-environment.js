const { TestEnvironment } = require('jest-environment-jsdom');

class CustomJSDOMEnvironment extends TestEnvironment {
    constructor(...args) {
        const options = args[0];
        options.testEnvironmentOptions = {
            ...options.testEnvironmentOptions,
            resources: 'usable',
            runScripts: 'dangerously',
            pretendToBeVisual: false,
        };
        super(...args);

        // Mock canvas immediately with simple functions
        this.global.HTMLCanvasElement.prototype.getContext = () => ({
            fillRect: () => { },
            clearRect: () => { },
            drawImage: () => { },
            getImageData: () => ({ data: new Array(4) }),
            putImageData: () => { },
            createImageData: () => ({ data: new Array(4) }),
            save: () => { },
            restore: () => { },
            scale: () => { },
            translate: () => { },
            rotate: () => { },
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
        });
    }
}

module.exports = CustomJSDOMEnvironment;
