const {koaApp, init} = require('./koaApp');
const PORT = process.env.PORT || 80
// import { Configuration, OpenAIApi } from "openai";
// const { Configuration, OpenAIApi } = require('./openai');
const proxying = require('./utils/http/proxying');

if(process.env.PLATFORM == 'FAAS') { // Set this ENV in FAAS to make it work
    exports.handler = koaApp.callback();
    exports.initializer = init;
} else { // Local Test
    init();
    koaApp.listen(PORT);
}