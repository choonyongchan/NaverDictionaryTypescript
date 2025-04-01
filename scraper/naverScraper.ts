import type { DescriptionItem, DictInfo, MeaningItem, SearchInfo } from "./datastruct.ts";

export class NaverScraper {

    /**
     * Scrape TOPIK level from the word item.
     * @param searchInfo - Entry Info
     * @returns TOPIK level
     */
    private static getTopik(searchInfo: SearchInfo): string {
        const topikString: string = searchInfo.entry.entry_level ?? "";
        if (topikString.indexOf("1") != -1) return '(TOPIK Elementary)';
        if (topikString.indexOf("2") != -1) return '(TOPIK Intermediate)';
        return '';
    }

    /**
     * Scrape Importance Stars from the word item.
     * @param searchInfo - Entry Info
     * @returns Importance Stars
     */
    private static getImportance(searchInfo: SearchInfo): string {
        // Note: Importance is ranked from 0-3 stars.
        const numStars: number = searchInfo.entry.entry_importance ?? 0;
        if (numStars < 0 || numStars > 3) throw new ReferenceError('Importance value out of range.');
        return '⭐'.repeat(numStars);
    }

    /**
     * Scrape Title from the word item.
     * @param searchInfo - Entry Info
     * @returns Title
     */
    private static getTitle(searchInfo: SearchInfo): string {
        return searchInfo.entry.members[0].entry_name ?? "";
    }

    /**
     * Scrape Hanja from the word item.
     * @param searchInfo - Entry Info
     * @returns Hanja
     */
    private static getHanja(searchInfo: SearchInfo): string {
        return searchInfo.entry.members[0].origin_language ?? "";
    }

    /**
     * Scrape English Definition from the word item.
     * @param searchInfo - Entry Info
     * @returns English Definition
     */
    private static getEnDef(searchInfo: SearchInfo): string {
        const endef: string = searchInfo.entry.primary_mean ?? "";
        if (!endef) return '';
        const endefArr: string[] = endef.split('|||').map((def: string, idx: number) => `${idx+1}.${def}`);
        return endefArr.join(' ');
    }

    /**
     * Scrape Pronunciation from the word item.
     * @param searchInfo - Word Item
     * @returns Pronunciation
     */
    private static getPronun(searchInfo: SearchInfo): string {
        const pronuns: string[] = (searchInfo.entry.members[0].prons ?? []).map(({ show_pron_symbol }) => show_pron_symbol).filter((p) => p);
        if (pronuns.length < 2) return '';
        const engPronun: string = pronuns[0];
        const korPronun: string = pronuns[1];
        return `[${engPronun}] [${korPronun}]`;
    }

    /**
     * Scrape Part of Speech from the word item.
     * @param searchInfo - Word Item
     * @returns Part of Speech
     */
    private static getPartSpeech(searchInfo: SearchInfo): string {
        // Assumption: For a word, the part of speech is the same for all meanings.
        return searchInfo.entry.means[0].part.part_ko_name ?? "";
    }

    /**
     * Scrape just the English definition from the word item.
     * @param meaningItem - Meaning Item
     * @param idx - Index
     * @returns English Definition
     */
    private static getMeaning(meaningItem: MeaningItem, idx: number): string {
        const meaning: string = meaningItem.show_mean ?? '';
        const descItem: DescriptionItem  = JSON.parse(meaningItem.description_json);
        const eg: string = meaningItem.examples ? meaningItem.examples[0].origin_example ?? '' : "";

        const meaningStr: string = `${idx+1}.${meaning}`;
        const enStr: string = descItem?.en ? `\n${descItem.en}`: "";
        const koStr: string = descItem?.ko ? `\n${descItem.ko}`: "";
        const egStr: string = eg ? `\n|| ${eg}`: "";

        return `${meaningStr}${enStr}${koStr}${egStr}`;
    }

    /**
     * Scrape just the English definitions from the word item.
     * @param searchInfo - Entry Info
     * @returns English Definitionss
     */
    private static getMeanings(searchInfo: SearchInfo): string {
        const meanings: string[] = searchInfo.entry.means.map(NaverScraper.getMeaning);
        return meanings.join('\n\n');
    }

    /**
     * Compile the word item into a dictionary item.
     * @param searchInfo - Entry Info
     * @returns Dictionary Info
     */
    public static scrape(searchInfo: SearchInfo): DictInfo {
        const topik: string = NaverScraper.getTopik(searchInfo);
        const importance: string = NaverScraper.getImportance(searchInfo);
        const title: string = NaverScraper.getTitle(searchInfo);
        const hanja: string = NaverScraper.getHanja(searchInfo);
        const endef: string = NaverScraper.getEnDef(searchInfo);
        const pronun: string = NaverScraper.getPronun(searchInfo);
        const partSpeech: string = NaverScraper.getPartSpeech(searchInfo);
        const meanings: string = NaverScraper.getMeanings(searchInfo);
        return {
            TopikLevel: topik,
            ImportanceLevel: importance,
            Title: title,
            Hanja: hanja,
            EnDef: endef,
            Pronun: pronun,
            PartSpeech: partSpeech,
            Meanings: meanings,
        };
    }
}
