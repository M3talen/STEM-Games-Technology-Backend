
md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
    breaks: true,
    langPrefix: 'card card-body examples card-task ',
    typographer: true,
});
md.use(require('markdown-it-div'));
var fs = require('fs');
var path = require('path');

bufferFile = (relPath) => {
    console.log(path.join(__dirname, relPath))
    return fs.readFileSync(path.join(__dirname, relPath), "utf8"); // zzzz....
}

renderMd = (file) => {

    var bfDesc = bufferFile('./' + file + "/" + file + "_desc.md");
    var bfEx = bufferFile('./' + file + "/" + file + "_ex.md");

    return {
        description: md.render(bfDesc),
        examples: md.render(bfEx),
    }
}

module.exports = {
    renderMd
}