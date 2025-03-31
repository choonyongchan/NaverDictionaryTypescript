// Data Structure from the Entry Page.
export interface EntryInfo {
    searchResultMap: {
        searchResultListMap: {
            WORD: {
                items: {
                    entryId: string;
                }[];
            };
        };
    };
}

// Data Structures from the Search Page.
export interface DescriptionItem {
    en: string;
    ko: string;
}

export interface MeaningItem {
    show_mean: string; // Meanings
    description_json: string; // Meanings
    part: {
        part_ko_name: string; // PartSpeech
    };
    examples: {
        origin_example: string; // Example
    }[] 
}

export interface SearchInfo {
    entry: {
        entry_level: string; // TopikLevel
        entry_importance: number; // ImportanceLevel
        members: {
            entry_name: string; // Title
            origin_language: string; // Hanja
            prons: {
                show_pron_symbol: string // Pronun
            }[]
        }[];
        primary_mean: string; // EnDef
        means: MeaningItem[];
    }
}

// Data Structures from the Description Page.
export interface DictInfo {
    TopikLevel: string;
    ImportanceLevel: string;
    Title: string;
    Hanja: string;
    EnDef: string;
    Pronun: string;
    PartSpeech: string;
    Meanings: string;
}


