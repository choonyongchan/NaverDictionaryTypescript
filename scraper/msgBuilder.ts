import type {DictInfo} from './datastruct';

export class MsgBuilder {

    /**
     * Build a sentence from given components of the Word Information.
     *
     * @param prefix - Prefix of the sentence
     * @param components - Selected components of the Word to include
     * @returns A sentence built from the components
     */
    private static buildSentence(prefix: string, components: string[]): string {
        const sentence: string = components.filter((v: string) => v).join(' ');
        return sentence ? `${prefix}${sentence}` : '';
    }

    /**
     * Create a message from the Word Information.
     *
     * @param info - Information about the word
     * @returns A message built from the Word Information
     */
    public static build(dictInfo: DictInfo): string {
        // Check if all fields are empty
        if (!dictInfo) {return '';}
        if (Object.values(dictInfo).every(value => !value || value == '')) {
            return '';
        }

        const parts: string[] = [
            this.buildSentence('', [dictInfo.TopikLevel, dictInfo.ImportanceLevel]),
            this.buildSentence('', [dictInfo.Title, dictInfo.Hanja]),
            this.buildSentence('', [dictInfo.EnDef]),
            this.buildSentence('----------\nPronunciation:\nroma ', [dictInfo.Pronun]),
            '----------',
            this.buildSentence('', [dictInfo.PartSpeech]),
            this.buildSentence('', [dictInfo.Meanings])
        ];
        const msg: string = parts.filter((s: string) => s).join('\n');
        return msg;    
    }

}