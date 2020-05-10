"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const path = require("path");
/**
* This function takes a line of the textfiles and checks
* if one of the given commands is contained in the line.
* If the command is found a commandStruct object is returned,
* containing the command name and an array of arguments
*/
function getCommandArg(line, command) {
    //Remove comments from the line
    if (line.includes('#')) {
        line = line.substr(0, line.indexOf('#'));
    }
    //Split line into strings without whitespaces, filter empty elemets
    let line_arr = line.split(RegExp('\\s+')).filter(function (e) { return e; });
    // Initialize empty commandStruct variable
    const com_struct = {};
    // Check the words for each provided command
    command.forEach(c => {
        const c_str = line_arr.find(e => e == c);
        if (c_str) {
            for (let index = 0; index < line_arr.length; index++) {
                if (index == 0) {
                    com_struct.command = c_str;
                    com_struct.args = [];
                }
                else {
                    com_struct.args.push(line_arr[index]);
                }
            }
        }
    });
    return com_struct;
}
/**
* This function checks wheter a file given as input for
* a read-command actually exists.
*/
function check_read_paths(document, line_index, errors) {
    const read_commands = [
        'read_data',
        'read_dump',
        'read_restart'
    ];
    const line_str = document.lineAt(line_index).text;
    const com_struct = getCommandArg(line_str, read_commands);
    if (com_struct.command) { // was a read-command found at all?
        // Initialize Diagnostic Variables
        let position = undefined;
        let msg = '';
        if (com_struct.args.length > 0) { // path specified?
            const file_path = com_struct.args[0];
            // File doesn't exist
            if (!fileExists(document, file_path)) {
                const arg_pos = line_str.search(file_path);
                position = getRange(line_str, line_index, file_path);
                msg = `The file ${file_path} does not exist`;
            }
        }
        else { // no path given
            position = getRange(line_str, line_index, com_struct.command);
            msg = `The command ${com_struct.command} requires an argument speciying the file to read`;
        }
        // Add Error to Diagnostics Array
        if (position) {
            errors.push({
                message: msg,
                range: position,
                severity: vscode_1.DiagnosticSeverity.Error
            });
        }
    }
    return errors;
}
exports.check_read_paths = check_read_paths;
/**
* Returns the range of a given string
* within a given line of the document.
* Similar to getWordRangeAtPosition
* from vscode api
*/
function getRange(line_str, line_idx, argument) {
    const arg_pos = line_str.search(argument);
    const rng = new vscode_1.Range(line_idx, arg_pos, line_idx, arg_pos + argument.length);
    return rng;
}
/**
* Returns the absolute path of the
* directory a given TextDocument is in
*/
function getDocDir(document) {
    let cwd = document.uri.fsPath;
    if (cwd) {
        cwd = path.dirname(cwd);
    }
    return cwd;
}
/**
* Returns a boolean, indicating wether
* a given file exists. Path can be absolute or
* relative to the location of the TextDocument
*/
function fileExists(document, file_path) {
    if (!path.isAbsolute(file_path)) {
        const docDir = getDocDir(document);
        file_path = path.join(docDir, file_path);
    }
    if (fs_1.existsSync(file_path)) {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=lmps_lint.js.map