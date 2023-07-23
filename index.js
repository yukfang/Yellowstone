const {koaApp, init} = require('./koaApp');
const PORT = process.env.PORT || 80
// import { Configuration, OpenAIApi } from "openai";
const { Configuration, OpenAIApi } = require('./openai');
const proxying = require('./utils/http/proxying');

if(process.env.PLATFORM == 'FAAS') { // Set this ENV in FAAS to make it work
    exports.handler = koaApp.callback();
    exports.initializer = init;
} else { // Local Test
    init();
    koaApp.listen(PORT);
}



async function main() {
    const configuration = new Configuration({
        organization: "org-cMqDvEaOJiyWZ0zfxqURSW2L",
        apiKey: process.env.OPENAI_API_KEY || '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',
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.listEngines();
    
    console.log(response)
}


async function listModels() {
    const endpoint      = 'https://api.openai.com/v1/models';
    const method        = 'GET';

    let header      = {Cookie: cookie.value}
    let param       = {
        order_id,
        archive_after: true,
        lang: 'EN'
    };
    let body        = null;


    const response = (await proxying(method, endpoint, header, param, body, true));
    // console.log(response.data)
}