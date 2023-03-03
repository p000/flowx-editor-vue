const {version, homepage} = require('../../package');
const year = new Date().getFullYear();
const years = year === 2023 ? '2023' : '2023-' + year;

module.exports = `
flowx-editor-vue v${version} | (c) ${years} p000ic
Released under the Apache 2 License.
${homepage}
`.trim();
