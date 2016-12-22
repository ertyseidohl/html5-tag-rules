const request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs');

const argv = require('optimist')
    .default('timeout', 300)
    .default('outfile', './tags.json')
    .default('test', false)
    .default('silent', false)
    .argv;

const URL = "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/";

let elements = argv.test ? ["a", "div", "span"] : [
    "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio",
    "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button",
    "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content",
    "data", "datalist", "dd", "del", "details", "dfn", "dir", "div", "dl", "dt",
    "em", "embed",
    "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset",
    "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html",
    "i", "iframe", "img", "input", "ins", "isindex",
    "kbd", "keygen",
    "label", "legend", "li", "link", "listing",
    "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter",
    "nav", "nobr", "noframes", "noscript",
    "object", "ol", "optgroup", "option", "output",
    "p", "param", "plaintext", "pre", "progress",
    "q",
    "rp", "rt", "ruby",
    "s", "samp", "script", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup",
    "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt",
    "u", "ul",
    "var", "video",
    "wbr",
    "xmp"
];

const output = [];

const scrape = (elt, html) => {
    if (!argv.silent) {
        console.log("Scraping " + elt + "...");
    }
    let $ = cheerio.load(html);
    let eltData = {};

    eltData.name = elt;

    // properties
    eltData.properties = {};
    let eltPropertiesSelector = null;

    // some properties are in the properties table ( :D )
    // some properties are in a standard-table class table ( D: )
    if ($('.properties').length) {
        eltPropertiesSelector = '.properties tr';
    } else if ('#Usage_Context + .standard-table') {
        eltPropertiesSelector = '#Usage_Context + .standard-table tr';
    }

    if (eltPropertiesSelector) {
        $(eltPropertiesSelector).each((i, el) => {
            let $el = $(el);
            eltData.properties[$el.find("th, td:first-child").text()] = $el.find("td:not(:first-child)").text()
        });
    }

    //specifications
    if ($('#Specifications .standard-table').length) {
        eltData.specifications = [];
        $('.standard-table').find('tbody tr').each((i, el) => {
            let $el = $(el);
            let $td = $el.find('td').first();

            eltData.specifications.push({
                name: $td.contents()[0].children[0].data,
                url: $td.find('a').attr('href')
            })
        });
    }

    //warnings
    eltData.warnings = [
            'nonStandard',
            'obsolete',
            'deprecated'

        ].map(w => $('.' + w).length ? w : 0)
        .filter(w => !!w);

    output.push(eltData);
}

const pull = (resolve, reject, elt) => {
    if (!argv.silent) {
        console.log("Pulling " + elt + "...");
    }
    request(URL + elt, (err, _, html) => {
        if (err) {
            reject(err);
            return;
        }

        scrape(elt, html);
        resolve();
    });
}

const process = (elts) => {
    let promises = [];
    for (let i = 0; i < elts.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            setTimeout(pull, argv.timeout * i, resolve, reject, elts[i]);
        }));
    }
    Promise.all(promises).then(
        () => {
            fs.writeFile(argv.outfile, JSON.stringify(output), () => {
                if (!argv.silent) {
                    console.log("done")
                }
            });
        },
        (err) => {
            console.err(err);
        }
    )
}

//debug
process(elements);