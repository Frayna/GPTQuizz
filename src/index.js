import OpenAI from "openai";
import dotenv from 'dotenv'
import * as tmi from 'tmi.js';

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

const banUser = ({user, time}) => {
	console.log(`Banning ${user} for ${time} seconds`);
}

// const conversation = [
// 	{ 
// 		role: "system", 
// 		content: `Tu es un modérateur sous le nom de GPTMod d'une chaine twitch et tu dois bannir les personnes qui ne sont pas respectueuses. Sois sévère mais juste ! Tu peux utiliser la fonction sendChatMessage si tu souhaite répondre à un utilisateur.` 
// 		},
// 	{ role: "user", content: "Jeami : Salut @GPTMod, Comment ça va ?" }
// ];

// const chatCompletion = await openai.chat.completions.create({
//     messages: conversation,
// 	functions: [
// 		{
// 			"name": "banUser",
// 			"parameters": {
// 				type: "object",
// 				properties: {
// 					user: {
// 						type: "string",
// 						description: "The user name to ban",
// 						example: "toto"
// 					},
// 					time: {
// 						type: "integer",
// 						description: "The time in seconds to ban the user",
// 						example: 300
// 					}
// 				},
// 				required: ["user", "time"]
// 			},
// 		}
// 	],
//     model: "gpt-3.5-turbo",
// });


const conversation = [
	{ 
		role: "system", 
		content: `Tu es un présentateur d'emission et tu fais les questions et les réponses. Un sujet va t'être envoyé avec une difficulté de 1 à 10.`
		},
	{ role: "user", content: `Sujet : Minecraft, Difficulté : 10` }
];

const chatCompletion = await openai.chat.completions.create({
    messages: conversation,
	functions: [
		{
			"name": "createQuestion",
			"parameters": {
				type: "object",
				properties: {
					question: {
						type: "string",
						description: "The question that will be asked to the user",
						example: "Quelle est la capitale de la France ?"
					},
					possibleAnswers: {
						type: "array",
						description: "The 4 possible answers to the question",
						example: ["Paris", "Lyon", "Marseille", "Toulouse"],
						"items": {
							"type": "string"
						}
					},
					answer: {
						type: "string",
						description: "The answer to the question",
						example: "Paris"
					}
				},
				required: ["question", "possibleAnswers", "answer"]
			},
		}
	],
    model: "gpt-3.5-turbo",
	function_call: {"name": "createQuestion"}
});


conversation.push(chatCompletion.choices[0].message);

const client = new tmi.Client({
	// options: { debug: true },
	// identity: {
	// 	username: process.env.BOT_USERNAME,
	// 	password: process.env.OAUTH_BOT_TOKEN
	// },
	channels: [ 'thefrayna' ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
	console.log(message);
	if(message.startsWith('!answer')) {
		const answer = message.split('!answer ')[1];
		const fcall = JSON.parse(conversation[conversation.length - 1].function_call.arguments);
		if(["1","2","3","4"].includes(answer) && fcall.possibleAnswers[parseInt(answer) - 1] === fcall.answer) {
			console.log(`@${tags.username}, bonne réponse !`);
		}
	}
	// if(self) return;
	// if(message.toLowerCase() === '!hello') {
	// 	client.say(channel, `@${tags.username}, heya!`);
	// }
});

// console.log(conversation[conversation.length - 1].function_call);
const quizz = JSON.parse(conversation[conversation.length - 1].function_call.arguments)
console.log("Question :", quizz.question);
console.log("Question :", quizz.possibleAnswers);
console.log("Question :", quizz.answer);