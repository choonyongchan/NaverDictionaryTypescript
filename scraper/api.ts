import { NaverScraper } from "./naverScraper";
import type { DictInfo, EntryInfo, SearchInfo } from "./datastruct";
import { MsgBuilder } from "./msgBuilder";


export class NaverAPI {

    private static readonly sanitisationPattern: RegExp = /[^a-zA-Z가-힣]/g; 
    private static readonly fetchoptions = {
        "headers": {
          "Referer": "https://korean.dict.naver.com/koendict/",
        },
        "method": "GET",
    };

    /**
     * Isolate only letters from the message
     * @param s - The message to sanitise
     * @returns The sanitised message
     */
    private static sanitise(s: string): string {
        return s.replace(NaverAPI.sanitisationPattern, '');
    }
        
    /**
     * Fetch the JSON data from the given URL.
     * 
     * @param url - URL
     * 
     * @returns JSON Data
     */
    private static fetchData(url: string): Promise<any> {
        return fetch(url, NaverAPI.fetchoptions).then(res => res.json());
    }

    /**
     * Format the search term into a URL for the Naver Dictionary.
     * 
     * @param searchTerm - Search Term
     * 
     * @returns Naver Dictionary URL
     */
    private static getEntryURL(searchTerm: string): string {
        return `https://korean.dict.naver.com/api3/koen/search?query=${searchTerm}&m=mobile&range=entrySearch`;
    } 

    /**
     * Fetcn the Entry Information from the given search term.
     * 
     * @param searchTerm - Search Term
     * 
     * @returns Search Result Data
     */
    public static getEntryInfo(searchTerm: string): Promise<EntryInfo> {
        const entrySearchUrl: string = NaverAPI.getEntryURL(searchTerm);
        return NaverAPI.fetchData(entrySearchUrl);
    }


    /**
     * Retrieve the Entry ID of the Search Term from the Entry Information.
     * 
     * @param searchInfo - Entry Information
     * 
     * @returns Entry ID
     */
    public static getEntryId(searchInfo: EntryInfo): string {
        return searchInfo.searchResultMap.searchResultListMap.WORD.items[0].entryId;
    }

    /**
     * Format the Entry ID into a URL for the Naver Dictionary.
     * 
     * @param entryId - Entry ID
     * 
     * @returns Naver Dictionary URL
     */
    private static getSearchURL(entryId: string): string {
        return `https://korean.dict.naver.com/api/platform/koen/entry?entryId=${entryId}`;
    }

    /**
     * Fetch the Search Information from the given Entry ID.
     * 
     * @param entryId - Entry ID
     * 
     * @returns Search Result Data
     */
    public static getSearchInfo(entryId: string): Promise<SearchInfo> {
        const searchURL: string = NaverAPI.getSearchURL(entryId);
        return NaverAPI.fetchData(searchURL);
    }

    public static async getEntryInfoRaw(term: string): Promise<EntryInfo> {
        const termSanitised: string = NaverAPI.sanitise(term);
        return NaverAPI.getEntryInfo(termSanitised);
    }

    public static async getSearchInfoRaw(term: string): Promise<SearchInfo> {
        const entryInfo: EntryInfo = await NaverAPI.getEntryInfoRaw(term);
        const entryId: string = NaverAPI.getEntryId(entryInfo);
        return NaverAPI.getSearchInfo(entryId);
    }

    /**
     * Get the dictionary information of the term
     * @param term - The term to search
     * @returns The dictionary information of the term
     */
    public static async get(term: string): Promise<DictInfo> {
        const searchInfo: SearchInfo = await NaverAPI.getSearchInfoRaw(term);
        return NaverScraper.scrape(searchInfo);
    }

    public static async getMessage(term: string): Promise<string> {
        const dictinfo: DictInfo = await NaverAPI.get(term);
        return MsgBuilder.build(dictinfo);
    }
}

// console.log(await NaverAPI.getMessage("사랑"));