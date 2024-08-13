#!/usr/bin/env node

import prompts from 'prompts';
import * as unzipper from 'unzipper';

import * as fs from 'fs';
import path from 'path';

async function ask(): Promise<{ inCurrent: boolean, folderName: string, overwrite?: boolean, useUnocss: boolean }> {
    const response = await prompts([{
        type: 'toggle',
        name: 'inCurrent',
        message: 'Would you like to create project in current directory, or in a new subfolder?',
        initial: false,
        active: 'current',
        inactive: 'new',
    }, {
        type: (prev) => prev ? null : 'text',
        name: 'folderName',
        message: 'What is the name of the new project?',
        initial: 'my-new-project',
    }, {
        type: (prev) => fs.existsSync(prev) ? 'confirm' : null,
        name: 'overwrite',
        message: 'Folder already exists, do you want to overwrite it?',
        initial: false
    }, {
        type: 'toggle',
        name: 'useUnocss',
        message: "Do you want to use Unocss?",
        initial: false,
    }
    ]);
    return response;
}

function replaceWordInFile(filePath: string, word: string, replacement: string) {
    let data = fs.readFileSync(filePath, 'utf8');
    let result = data.replace(new RegExp(word, 'g'), replacement);
    fs.writeFileSync(filePath, result, 'utf8');
}

async function main() {
    const template = path.join(path.dirname(process.argv[1]), './template.zip');
    const unoTemplate = path.join(path.dirname(process.argv[1]), './uno-template.zip');

    let response = await ask();
    let folderName = response.folderName ?? '.';

    if (response.inCurrent === true) {
    } else {
        if ("overwrite" in response) {
            if (response.overwrite == true) {
                fs.rmSync(response.folderName, { recursive: true, force: true });
            } else {
                return;
            }
        }
        fs.mkdirSync(folderName);
    }

    fs.createReadStream(template).pipe(unzipper.Extract({ path: folderName })).on('close', () => {
        replaceWordInFile(`${folderName}/package.json`, 'template', response.folderName == '.' ? path.basename(process.cwd()) : response.folderName);
        replaceWordInFile(`${folderName}/src/index.html`, 'template', response.folderName == '.' ? path.basename(process.cwd()) : response.folderName);
        console.log('Project created successfully');
    });

    if (response.useUnocss) {
        fs.createReadStream(unoTemplate).pipe(unzipper.Extract({ path: folderName })).on('close', () => {

        });
    }
}

main();