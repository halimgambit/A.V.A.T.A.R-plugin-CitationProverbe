import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function init () {
    await Avatar.lang.addPluginPak('CitationProverbe');
}

export async function action(data, callback) {

	try {

         const L = await Avatar.lang.getPak('CitationProverbe', data.language);

		const tblActions = {
			getCitation: () => getCitation(data.client, L, callback)
		};

		info("CitationProverbe:", data.action.command, "from", data.client);

		if (tblActions[data.action.command]) {
                await tblActions[data.action.command]();
            } else {
                callback();
            }

	} catch (err) {
		if (data.client) Avatar.Speech.end(data.client);
		error("CitationProverbe:", err.message);
        callback();
	}
}


const getCitation = async (client, L, callback) => {

    try {
		
        const response = await fetch("https://www.proverbes-francais.fr/citation-du-jour/");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let citation = $("blockquote p span").first().text().trim();

        if (!citation) {
            throw new Error(L.get(["speech.errorNoCitation"]));
            callback();
        }

        citation = citation.replace(/^["'«\s]+|["'»\s]+$/g, '');

        const message = L.get(["speech.quote", citation]);

		info(message);

        Avatar.speak(message, client, () => {
           callback();
        });

    } catch (err) {
        error("Erreur citation:", err.message);
        Avatar.speak(L.get(["speech.errorAccess"]), client, () => {
           callback();
        });
    }
}
