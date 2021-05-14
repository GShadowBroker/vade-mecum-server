export default () => {
    const titleEl = document.querySelector("a font, font a");
    const title = titleEl?.innerText.replace(/\s+N\s+o\s+/gi, " nº ");
    const descriptionEl = document.querySelector("table p font[color='#800000'], p font[color='#800000'], table p span font");
    const description = descriptionEl?.innerText;
    // Refine creation of Titles to prevent them from being created as separate elements
    let pRaw = Array.from(document.querySelectorAll("body :is(p, h1, h2, h3, h4, h5, h6)"), (el) => {
        let textEl = el.innerText;
        // Check if it's PARTE GERAL or PARTE ESPECIAL
        if (/^P\s+A\s+R\s+T\s+E\s/gi.test(textEl)) {
            if (/^P\s+A\s+R\s+T\s+E\s+G\s+E\s+R\s+A\s+L$/gi.test(textEl)) {
                textEl = "PARTE GERAL";
            }
            else if (/^P\s+A\s+R\s+T\s+E\s+E\s+S\s+P\s+E\s+C\s+I\s+A\s+L$/gi.test(textEl)) {
                textEl = "PARTE ESPECIAL";
            }
        }
        // Return pRaw with filtered items:
        return textEl
            .replace(/\s\s+/gi, " ")
            .replace("(&nbsp;)(&nbsp;)+", " ")
            .replace(/Art.&nbsp;/gi, "Art. ")
            .replace(/\s+N\s+o\s+/gi, " nº ")
            .trim();
    }).filter((el) => {
        const excludeWords = [
            "vigência",
            "índice",
            "índice temático",
            "mensagem de veto",
            "emendas constitucionais",
            "emendas constitucionais de revisão",
            "ato das disposições constitucionais transitórias",
            "atos decorrentes do disposto no § 3º do art. 5º",
            "lei de introdução às normas do direito brasileiro"
        ];
        if (excludeWords.includes(el.toLowerCase()) ||
            /^\s+$/gi.test(el) ||
            /^\(vide\s.+\)/gi.test(el) ||
            /^vide\s.+/gi.test(el) ||
            /^vigência|^mensagem\s+de\s+veto/gi.test(el) ||
            el === "*") {
            return false;
        }
        return !!el;
    });
    // Returns the article number or null
    const extractArtNum = (text) => {
        text = text.trim().replace(/^Art(\.+\s+|\s+\.+)+?(?=\d+)/gi, "Art. ");
        const art = text.match(/^Art.\s*.+?(\s-|\.\s|\s|\(VETADO\)|\(REVOGADO\))+?/gi);
        if (!art || !Array.isArray(art))
            return null;
        const matchArt = art[0].match(/(\d+?\.\d+-[a-záàâãéèêíïóôõöúçñ]|\d+?\.\d+|\d+(º+?|°+?|o+?)?-[a-záàâãéèêíïóôõöúçñ]|\d+(º+?|°+?|o+?)?)/gi);
        if (!matchArt || !Array.isArray(matchArt))
            return null;
        if (!matchArt[0])
            return null;
        if (/-o/gi.test(matchArt[0])) {
            return matchArt[0];
        }
        return matchArt[0].replace(/o/gi, "º");
    };
    // Returns the paragraph number or null
    const extractParaNum = (text) => {
        text = text.trim();
        const para = text.match(/^§(\s+?)?\d+(?=(º+?|°+?|o+?))/gi);
        if (!para || !Array.isArray(para))
            return null;
        return para[0].replace("§", "").replace(/\s+/gi, "");
    };
    // Get title if text is a title or null if not
    const getHeaderName = (text) => {
        text = text.trim();
        const titles = ["parte", "livro", "título", "capítulo", "seção", "subseção"];
        const firstWordArray = text.match(/^[a-záàâãéèêíïóôõöúçñ]+/gi);
        if (!firstWordArray || !Array.isArray(firstWordArray))
            return null;
        const firstWord = firstWordArray[0];
        if (!firstWord)
            return null;
        if (firstWord.length === 1) {
            const firstWordArrayWithSpaces = text.match(/^([a-záàâãéèêíïóôõöúçñ]+\s{0,1})+/gi);
            if (!firstWordArrayWithSpaces || !Array.isArray(firstWordArrayWithSpaces)) {
                return null;
            }
            const firstWordWithSpaces = firstWordArrayWithSpaces[0];
            if (!firstWordWithSpaces)
                return null;
            const wordWithoutSpaces = firstWordWithSpaces
                .trim()
                .replace(/\s/gi, "")
                .toLowerCase();
            return titles.includes(wordWithoutSpaces) ? wordWithoutSpaces : null;
        }
        return titles.includes(firstWord.toLowerCase()) ? firstWord : null;
    };
    const getNamelessHeader = (text) => {
        // Assumes it is not a named header (ex. capítulo, título, livro etc)
        if (text.length > 120)
            return null;
        if (/^.+(\.|:|;)$/gi.test(text))
            return null;
        if (/^§§/gi.test(text))
            return null;
        const regex = new RegExp(/^(Art.|§\s|Parágrafo|\w\)\w*\s*|\d+\s|\d+\.\s|[IVXLC]{1,3}-*[a-záàâãéèêíïóôõöúçñ]{0,1}-*\s|Pena\s|Penalidade\s|Infração\s|Medida\s+?administrativa)/, "gi");
        if (regex.test(text))
            return null;
        return text;
    };
    const filterPara = (paraArr) => {
        const newArr = [];
        let lastElemIsTitle = false;
        for (let i = 0; i < paraArr.length; i++) {
            if (getHeaderName(paraArr[i]) &&
                /^[a-záàâãéèêíïóôõöúçñ]+\s+[a-záàâãéèêíïóôõöúçñ]+$/gi.test(paraArr[i])) {
                newArr.push(paraArr[i]);
                lastElemIsTitle = true;
            }
            else if (lastElemIsTitle) { // paraArr[i - 1]
                newArr[newArr.length - 1] = `${newArr[newArr.length - 1]} - ${paraArr[i]}`;
                lastElemIsTitle = false;
            }
            else if (/^\((Redação\s+dada|Incluído\s+)/gi.test(paraArr[i])) {
                newArr[newArr.length - 1] = `${newArr[newArr.length - 1]} ${paraArr[i]}`;
                lastElemIsTitle = false;
            }
            else {
                newArr.push(paraArr[i]);
            }
        }
        return newArr;
    };
    pRaw = filterPara(pRaw);
    // Format articles into a javascript objects
    const formattedContent = [];
    const titlesArray = [];
    const headerArray = [];
    const footerArray = [];
    let reachedFooter = false;
    // Format pRaw
    for (const el of pRaw) {
        // Break loop at the end of law
        if (/^((E|Ê)ste\s+texto\s+não\s+substitui)/gi.test(el) &&
            formattedContent.length > 5)
            break;
        if (/^(Anexo|Anexo\s+[IVXLC]+)/gi.test(el) &&
            formattedContent.length > 20)
            break;
        // Flag loop as having reached footer
        if (/^(Brasília|Rio\sde\sJaneiro)/gi.test(el) && formattedContent.length > 5) {
            reachedFooter = true;
        }
        // Push to footer instead of content
        if (reachedFooter) {
            footerArray.push(el);
            continue;
        }
        // If it's an article
        if (/^Art\.(\s)?/gi.test(el)) {
            const art = extractArtNum(el);
            formattedContent.push({
                art: art,
                caput: el
                    .replace(/^Art(\.+\s+|\s+\.+)+?(?=\d+)/gi, "Art. ") // Replace malformatted art (ex.: CLT's "Art. . 177 -")
                    .replace(/^Art.\s*\d+(\.\d+)?(-[a-záàâãéèêíïóôõöúçñ]+)?(º+?|°+?|o+?)?(-[a-záàâãéèêíïóôõöúçñ]+)?(\.\s+?)?(\s+?-\s+?)?\s*/gi, "")
                    .trim()
                    .replace(/^\./gi, ""),
                children: [],
            });
            if (titlesArray[titlesArray.length - 1]) {
                titlesArray[titlesArray.length - 1].children.push(art);
            }
            continue;
        }
        // Not article
        const headerName = getHeaderName(el);
        const namelessHeader = getNamelessHeader(el);
        if (headerName && !reachedFooter) {
            titlesArray.push({
                type: headerName,
                content: el.replace(/\n/gi, " - "),
                children: [],
            });
            continue;
        }
        if (namelessHeader && !reachedFooter && titlesArray.length > 0) {
            // Check if it's a nameless title (ex.: Extinção de punibilidade)
            titlesArray.push({
                type: null,
                content: el.replace(/\n/gi, " - "),
                children: [],
            });
            continue;
        }
        if (formattedContent.length > 0) {
            // Check whether formattedContent array is NOT empty
            const subNum = extractParaNum(el);
            const regex = new RegExp(`${subNum}o(?=(\\s)*[a-záàâãéèêíïóôõöúçñ]+)`, "gi");
            formattedContent[formattedContent.length - 1].children.push({
                type: "provisório",
                content: el.replace(regex, `${subNum}º `)
            });
            // const lastTitle = titlesArray[titlesArray.length - 1];
            // if (!lastTitle) continue;
            // if (lastTitle.title !== "") continue;
            // let lastArtObject = lastTitle.arts.find((item) => !!item.art);
            // if (!lastArtObject) {
            //   const beforeLastTitle = titlesArray[titlesArray.length - 2];
            //   if (!beforeLastTitle) continue;
            //   lastArtObject = beforeLastTitle.arts[beforeLastTitle.arts.length - 1];
            //   if (!lastArtObject) continue;
            // }
            // // if (lastArtObject.subArt) continue;
            // lastTitle.arts.push({
            //   art: lastArtObject.art,
            //   subArt: el,
            // });
            continue;
        }
        // If DISPOSIÇÃO PRELIMINAR and empry formatted content, push to titles
        if (/^DISPOSIÇÃO\s+PRELIMINAR/gi.test(el)) {
            titlesArray.push({
                type: "disposição",
                content: el,
                children: [],
            });
            continue;
        }
        // If empty, push header element to headerArray
        headerArray.push(el);
    }
    return {
        title,
        description,
        header: headerArray,
        footer: footerArray,
        synopsis: titlesArray,
        content: formattedContent,
        pRaw // for debugging only
    };
};
