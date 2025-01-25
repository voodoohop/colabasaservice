
export const responsive = ({ isXs }) => (isXs ?? false)
  ? `Condense the text to 5 words maximum. It needs to be super short for mobile friendliness. Don't exceed 5 words!`
  : null;

export const translate = ({ userLanguage }) => userLanguage?.startsWith("en")
  ? null
  : `Translate to: ${userLanguage}. `;

export const rephrase = () => `Formulate with a direct, friendly but professional tone. Preserve clarity and conciseness without undue formality.`;

export const emojify = () => `Enrich the text with suitable emojis and varied text styles (use bold and italics). Do not rephrase or change the text length.`;

export const teamStyle = () => `Describe it with one very very short poetic sentence, 6 words maximum. Make it professional and impactful.`;

export const supporterStyle = () => `Convey very very briefly, 5 words maximum.`;

export const friendlyMarkdownStyle = () => `Flesh out in attractive friendly markdown using bold, italic, and many related emojis, Only regular font size. No title. Start with the first bullet point.`;

export const shortTechnical = () => `Convey in one very short sentence. Technical language is fine. Be very synthetic. Do not link the Pollinations.ai website. Any other link in the description should be displayed as a clickable word`;

export const oneSentence = () => `Express this in one sentence.`;

export const noLink = () => `Do not use any link URL`;
