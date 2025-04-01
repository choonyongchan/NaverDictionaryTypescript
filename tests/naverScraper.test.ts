import { NaverScraper } from '../scraper/naverScraper';
import type { SearchInfo } from '../scraper/datastruct';

describe('NaverScraper', () => {
    // Mock data with real Korean examples
    const mockSearchInfoBasic: SearchInfo = {
        entry: {
            entry_level: 'TOPIK 1',
            entry_importance: 2,
            members: [
                {
                    entry_name: '안녕하세요',
                    origin_language: '安寧하세요',
                    prons: [
                        { show_pron_symbol: 'annyeonghaseyo' },
                        { show_pron_symbol: '안녕하세요' }
                    ]
                }
            ],
            primary_mean: 'hello|||hi',
            means: [
                {
                    part: { part_ko_name: '감탄사' },
                    show_mean: '(인사말로) 안녕하십니까?',
                    description_json: JSON.stringify({
                        en: 'Hello (formal greeting)',
                        ko: '만났을 때 하는 인사말'
                    }),
                    examples: [{ origin_example: '안녕하세요, 반갑습니다.' }]
                }
            ]
        }
    };

    const mockSearchInfoComplex: SearchInfo = {
        entry: {
            entry_level: 'TOPIK 2',
            entry_importance: 3,
            members: [
                {
                    entry_name: '공부하다',
                    origin_language: '工夫하다',
                    prons: [
                        { show_pron_symbol: 'gongbuhada' },
                        { show_pron_symbol: '공부하다' }
                    ]
                }
            ],
            primary_mean: 'to study|||to learn',
            means: [
                {
                    part: { part_ko_name: '동사' },
                    show_mean: '학문이나 기술 등을 배우다',
                    description_json: JSON.stringify({
                        en: 'To study or learn subjects, skills, etc.',
                        ko: '지식이나 기능을 익히려고 노력하다'
                    }),
                    examples: [{ origin_example: '한국어를 열심히 공부하고 있어요.' }]
                },
                {
                    part: { part_ko_name: '동사' },
                    show_mean: '일에 대해 조사하거나 연구하다',
                    description_json: JSON.stringify({
                        en: 'To research or investigate something',
                        ko: '어떤 것을 조사하거나 연구하다'
                    }),
                    examples: [{ origin_example: '그 문제에 대해 더 공부해 보겠습니다.' }]
                }
            ]
        }
    };

    // Tests for private methods
    describe('getTopik', () => {
        it('should return Elementary level text for TOPIK 1', () => {
            const result = (NaverScraper as any).getTopik(mockSearchInfoBasic);
            expect(result).toBe('(TOPIK Elementary)');
        });

        it('should return Intermediate level text for TOPIK 2', () => {
            const result = (NaverScraper as any).getTopik(mockSearchInfoComplex);
            expect(result).toBe('(TOPIK Intermediate)');
        });

        it('should return empty string for non-TOPIK words', () => {
            const mockData = {
                entry: { entry_level: 'Advanced' }
            } as SearchInfo;
            const result = (NaverScraper as any).getTopik(mockData);
            expect(result).toBe('');
        });
    });

    describe('getImportance', () => {
        it('should return correct number of stars', () => {
            const result = (NaverScraper as any).getImportance(mockSearchInfoBasic);
            expect(result).toBe('⭐⭐');
        });

        it('should return three stars for highest importance', () => {
            const result = (NaverScraper as any).getImportance(mockSearchInfoComplex);
            expect(result).toBe('⭐⭐⭐');
        });

        it('should throw error for out-of-range importance', () => {
            const mockData = {
                entry: { entry_importance: 4 }
            } as SearchInfo;
            expect(() => (NaverScraper as any).getImportance(mockData)).toThrow();
        });
    });

    describe('getTitle', () => {
        it('should return correct title', () => {
            const result = (NaverScraper as any).getTitle(mockSearchInfoBasic);
            expect(result).toBe('안녕하세요');
        });
    });

    describe('getHanja', () => {
        it('should return correct hanja', () => {
            const result = (NaverScraper as any).getHanja(mockSearchInfoBasic);
            expect(result).toBe('安寧하세요');
        });
    });

    describe('getEnDef', () => {
        it('should format English definitions correctly', () => {
            const result = (NaverScraper as any).getEnDef(mockSearchInfoBasic);
            expect(result).toBe('1.hello 2.hi');
        });

        it('should return empty string for missing definition', () => {
            const mockData = {
                entry: { primary_mean: '' }
            } as SearchInfo;
            const result = (NaverScraper as any).getEnDef(mockData);
            expect(result).toBe('');
        });
    });

    describe('getPronun', () => {
        it('should format pronunciation correctly', () => {
            const result = (NaverScraper as any).getPronun(mockSearchInfoBasic);
            expect(result).toBe('[annyeonghaseyo] [안녕하세요]');
        });

        it('should return empty string if less than 2 pronunciations', () => {
            const mockData = {
                entry: {
                    members: [{ prons: [{ show_pron_symbol: 'annyeonghaseyo' }] }]
                }
            } as SearchInfo;
            const result = (NaverScraper as any).getPronun(mockData);
            expect(result).toBe('');
        });
    });

    describe('getPartSpeech', () => {
        it('should return correct part of speech', () => {
            const result = (NaverScraper as any).getPartSpeech(mockSearchInfoBasic);
            expect(result).toBe('감탄사');
        });
    });

    describe('getMeaning', () => {
        it('should format meaning correctly with all components', () => {
            const meaningItem = mockSearchInfoBasic.entry.means[0];
            const result = (NaverScraper as any).getMeaning(meaningItem, 0);
            expect(result).toBe('1.(인사말로) 안녕하십니까?\nHello (formal greeting)\n만났을 때 하는 인사말\n|| 안녕하세요, 반갑습니다.');
        });
    });

    describe('getMeanings', () => {
        it('should compile all meanings correctly', () => {
            const result = (NaverScraper as any).getMeanings(mockSearchInfoComplex);
            expect(result).toContain('1.학문이나 기술 등을 배우다');
            expect(result).toContain('2.일에 대해 조사하거나 연구하다');
        });
    });

    // Test for public method
    describe('scrape', () => {
        it('should correctly compile dictionary info for 안녕하세요', () => {
            const result = NaverScraper.scrape(mockSearchInfoBasic);
            
            expect(result).toEqual({
                TopikLevel: '(TOPIK Elementary)',
                ImportanceLevel: '⭐⭐',
                Title: '안녕하세요',
                Hanja: '安寧하세요',
                EnDef: '1.hello 2.hi',
                Pronun: '[annyeonghaseyo] [안녕하세요]',
                PartSpeech: '감탄사',
                Meanings: '1.(인사말로) 안녕하십니까?\nHello (formal greeting)\n만났을 때 하는 인사말\n|| 안녕하세요, 반갑습니다.'
            });
        });

        it('should correctly compile dictionary info for 공부하다', () => {
            const result = NaverScraper.scrape(mockSearchInfoComplex);
            
            expect(result.TopikLevel).toBe('(TOPIK Intermediate)');
            expect(result.ImportanceLevel).toBe('⭐⭐⭐');
            expect(result.Title).toBe('공부하다');
            expect(result.Hanja).toBe('工夫하다');
            expect(result.EnDef).toBe('1.to study 2.to learn');
            expect(result.Pronun).toBe('[gongbuhada] [공부하다]');
            expect(result.PartSpeech).toBe('동사');
            expect(result.Meanings).toContain('한국어를 열심히 공부하고 있어요.');
        });
    });
});