/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Manu Sridharan

/*jslint node: true */
var fs = require('fs');
var path = require('path');
var urlParser = require('url');


/**
 * which source files are required for Jalangi to run in the browser?
 */
var headerSources = ["src/js/Constants.js",
    "src/js/Config.js",
    "src/js/Globals.js",
    "src/js/TraceWriter.js",
    "src/js/TraceReader.js",
    "src/js/SMemory.js",
    "src/js/iidToLocation.js",
    "src/js/RecordReplayEngine.js",
    "src/js/analysis.js",
    "src/js/InputManager.js",
    "node_modules/escodegen/escodegen.browser.js",
    "node_modules/acorn/acorn.js",
    "src/js/utils/astUtil.js",
    "src/js/instrument/esnstrument.js"];


/**
 * concatenates required scripts for Jalangi to run in the browser into a single string
 */
var headerCode;

function headerCodeInit(root) {
    headerSources.forEach(function (src) {
        if (root) {
            src = path.join(root, src);
        }
        headerCode += fs.readFileSync(src);
    });
}

function getHeaderCode(root) {
    if (!headerCode) {
        headerCodeInit(root);
    }
    return headerCode;
}

/**
 * returns an HTML string of <script> tags, one of each header file, with the
 * absolute path of the header file
 */
function getHeaderCodeAsScriptTags(root, relative, analysis) {
    var ret = "";
    if (analysis) {
        // TODO do we still need this?  probably best to do this elsewhere
        if (analysis.indexOf(path.sep) === 0) {
            headerSources.push(analysis);
        } else {
            headerSources.push("src/js/" + analysis);
        }
    }
    headerSources.forEach(function (src) {
        if (root && analysis.indexOf(path.sep) !== 0) {
            src = path.join(root, src);
        }
        if (relative) {
            src = path.relative(process.cwd(), src);
        } else {
            src = path.resolve(src);
        }
        ret += "<script src=\"" + src + "\"></script>";
    });
    if (analysis) {
        headerSources.pop();
    }
    return ret;
}

var inlineRegexp = /#(inline|event-handler|js-url)/;

/**
 * Does the url (obtained from rewriting-proxy) represent an inline script?
 */
function isInlineScript(url) {
    return inlineRegexp.test(url);
}

/**
 * generate a filename for a script with the given url
 */
function createFilenameForScript(url) {
    // TODO make this much more robust
    var parsed = urlParser.parse(url);
    if (inlineRegexp.test(url)) {
        return parsed.hash.substring(1) + ".js";
    } else {
        return parsed.pathname.substring(parsed.pathname.lastIndexOf("/") + 1);
    }
}

exports.getHeaderCode = getHeaderCode;
exports.getHeaderCodeAsScriptTags = getHeaderCodeAsScriptTags;
exports.isInlineScript = isInlineScript;
exports.headerSources = headerSources;
exports.createFilenameForScript = createFilenameForScript;