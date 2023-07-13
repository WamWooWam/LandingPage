const path = require('path');
const fs = require('fs');
const { minify } = require('minify-xml');

module.exports = function (source) {
    return minify(source);
}