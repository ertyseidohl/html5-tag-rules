# html5-tag-rules

Scrape MDN HTML pages and generate a JSON file from that data.

Not great right now but it's a start.

## Usage

You can just use the existing tags.json file in this repo!

Or, if you want to generate the file yourself, you can download/clone this repo, then:

```
cd /path/to/repo
npm i
node scraper.js
cat tags.json
```

## Options

`--outfile`

Write the output to a different file path. Defaults to './tags.json'.

```
node scraper.js --outfile out.json
```

`--timeout`

Number of milliseconds to wait between each web request (we want to be polite to MDN!).  Defaults to 300. Setting this lower will drastically reduce the time it takes to run this script, but might get you banned from MDN.

```
node scraper.js --timeout 100
```

`--test`

Just pulls a, div, and span, so that you can test your connection without having to pull all of the tags.

```
node scraper.js --test yes
```
