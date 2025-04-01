import { NaverAPI } from '../scraper/api';
import { NaverScraper } from '../scraper/naverScraper';
import { MsgBuilder } from '../scraper/msgBuilder';
import type { DictInfo, EntryInfo, SearchInfo } from '../scraper/datastruct';

// Mock fetch globally
global.fetch = jest.fn();

describe('NaverAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Private Methods', () => {
        // We'll test private methods by exposing them temporarily via prototype
        describe('sanitise', () => {
            it('removes special characters from Korean text', () => {
                const sanitiseMethod = NaverAPI['sanitise'];
                expect(sanitiseMethod('안녕!')).toBe('안녕');
                expect(sanitiseMethod('고양이?')).toBe('고양이');
                expect(sanitiseMethod('사랑-')).toBe('사랑');
            });

            it('removes numbers and special characters', () => {
                const sanitiseMethod = NaverAPI['sanitise'];
                expect(sanitiseMethod('학교123')).toBe('학교');
                expect(sanitiseMethod('한국어2023!')).toBe('한국어');
            });

            it('preserves Korean and English characters', () => {
                const sanitiseMethod = NaverAPI['sanitise'];
                expect(sanitiseMethod('한글English')).toBe('한글English');
            });

            it('handles empty strings', () => {
                const sanitiseMethod = NaverAPI['sanitise'];
                expect(sanitiseMethod('')).toBe('');
            });
        });

        describe('fetchData', () => {
            it('fetches JSON data with proper headers', async () => {
                const mockJsonResponse = { data: 'test data' };
                const mockResponse = {
                    json: jest.fn().mockResolvedValue(mockJsonResponse)
                };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

                const fetchDataMethod = NaverAPI['fetchData'];
                const result = await fetchDataMethod('https://example.com/api');
                
                expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
                    "headers": {
                        "Referer": "https://korean.dict.naver.com/koendict/",
                    },
                    "method": "GET",
                });
                expect(mockResponse.json).toHaveBeenCalled();
                expect(result).toEqual(mockJsonResponse);
            });

            it('propagates fetch errors', async () => {
                const fetchDataMethod = NaverAPI['fetchData'];
                (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
                
                await expect(fetchDataMethod('https://example.com/api')).rejects.toThrow('Network error');
            });
        });

        describe('getEntryURL', () => {
            it('returns properly formatted entry URL', () => {
                const getEntryURLMethod = NaverAPI['getEntryURL'];
                const url = getEntryURLMethod('사과');
                expect(url).toBe('https://korean.dict.naver.com/api3/koen/search?query=사과&m=mobile&range=entrySearch');
            });

            it('handles complex search terms', () => {
                const getEntryURLMethod = NaverAPI['getEntryURL'];
                const url = getEntryURLMethod('한국어공부');
                expect(url).toBe('https://korean.dict.naver.com/api3/koen/search?query=한국어공부&m=mobile&range=entrySearch');
            });
        });

        describe('getSearchURL', () => {
            it('returns properly formatted search URL', () => {
                const getSearchURLMethod = NaverAPI['getSearchURL'];
                const url = getSearchURLMethod('12345');
                expect(url).toBe('https://korean.dict.naver.com/api/platform/koen/entry?entryId=12345');
            });
        });
    });

    describe('Public Methods', () => {
        describe('getEntryInfo', () => {
            it('fetches entry information for a search term', async () => {
                const mockEntryData = { searchResultMap: { searchResultListMap: { WORD: { items: [] } } } };
                const mockResponse = { json: jest.fn().mockResolvedValue(mockEntryData) };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
                
                const result = await NaverAPI.getEntryInfo('사과');
                
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://korean.dict.naver.com/api3/koen/search?query=사과&m=mobile&range=entrySearch',
                    expect.any(Object)
                );
                expect(result).toEqual(mockEntryData);
            });
        });

        describe('getEntryId', () => {
            it('extracts entry ID from entry info', () => {
                const mockEntryInfo = {
                    searchResultMap: {
                        searchResultListMap: {
                            WORD: {
                                items: [
                                    { entryId: '12345' }
                                ]
                            }
                        }
                    }
                } as unknown as EntryInfo;

                const entryId = NaverAPI.getEntryId(mockEntryInfo);
                expect(entryId).toBe('12345');
            });
        });

        describe('getSearchInfo', () => {
            it('fetches search information using entry ID', async () => {
                const mockSearchData = { entryId: '12345', entry: { word: '사과' } };
                const mockResponse = { json: jest.fn().mockResolvedValue(mockSearchData) };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
                
                const result = await NaverAPI.getSearchInfo('12345');
                
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://korean.dict.naver.com/api/platform/koen/entry?entryId=12345',
                    expect.any(Object)
                );
                expect(result).toEqual(mockSearchData);
            });
        });

        describe('getEntryInfoRaw', () => {
            it('sanitizes the search term and fetches entry info', async () => {
                const mockEntryData = { searchResultMap: { searchResultListMap: { WORD: { items: [] } } } };
                const mockResponse = { json: jest.fn().mockResolvedValue(mockEntryData) };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
                
                const result = await NaverAPI.getEntryInfoRaw('사과!123');
                
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://korean.dict.naver.com/api3/koen/search?query=사과&m=mobile&range=entrySearch',
                    expect.any(Object)
                );
                expect(result).toEqual(mockEntryData);
            });

            it('handles empty search terms', async () => {
                const mockEntryData = { searchResultMap: { searchResultListMap: { WORD: { items: [] } } } };
                const mockResponse = { json: jest.fn().mockResolvedValue(mockEntryData) };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
                
                const result = await NaverAPI.getEntryInfoRaw('');
                
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://korean.dict.naver.com/api3/koen/search?query=&m=mobile&range=entrySearch',
                    expect.any(Object)
                );
            });
        });

        describe('getSearchInfoRaw', () => {
            it('gets entry info and then fetches search info', async () => {
                // Mock for getEntryInfoRaw
                const mockEntryInfo = {
                    searchResultMap: {
                        searchResultListMap: {
                            WORD: {
                                items: [
                                    { entryId: '54321' }
                                ]
                            }
                        }
                    }
                } as unknown as EntryInfo;
                
                const mockSearchInfo = { entryId: '54321', entry: { word: '김치' } };
                
                jest.spyOn(NaverAPI, 'getEntryInfoRaw').mockResolvedValue(mockEntryInfo);
                jest.spyOn(NaverAPI, 'getSearchInfo').mockResolvedValue(mockSearchInfo as unknown as SearchInfo);
                
                const result = await NaverAPI.getSearchInfoRaw('김치');
                
                expect(NaverAPI.getEntryInfoRaw).toHaveBeenCalledWith('김치');
                expect(NaverAPI.getSearchInfo).toHaveBeenCalledWith('54321');
                expect(result).toEqual(mockSearchInfo);
            });

            it('handles when no entry is found', async () => {
                const mockEmptyEntryInfo = {
                    searchResultMap: {
                        searchResultListMap: {
                            WORD: {
                                items: []
                            }
                        }
                    }
                } as unknown as EntryInfo;
                
                jest.spyOn(NaverAPI, 'getEntryInfoRaw').mockResolvedValue(mockEmptyEntryInfo);
                
                await expect(NaverAPI.getSearchInfoRaw('존재하지않는단어')).rejects.toThrow();
            });
        });

        describe('get', () => {
            it('retrieves and scrapes dictionary information', async () => {
                const mockSearchInfo = { entryId: '12345', entry: { word: '학교' } } as unknown as SearchInfo;
                const mockDictInfo = { word: '학교', meanings: ['school'] } as unknown as DictInfo;
                
                jest.spyOn(NaverAPI, 'getSearchInfoRaw').mockResolvedValue(mockSearchInfo);
                jest.spyOn(NaverScraper, 'scrape').mockReturnValue(mockDictInfo);
                
                const result = await NaverAPI.get('학교');
                
                expect(NaverAPI.getSearchInfoRaw).toHaveBeenCalledWith('학교');
                expect(NaverScraper.scrape).toHaveBeenCalledWith(mockSearchInfo);
                expect(result).toEqual(mockDictInfo);
            });

            it('works with complex Korean words', async () => {
                const mockSearchInfo = { entryId: '67890', entry: { word: '안녕하세요' } } as unknown as SearchInfo;
                const mockDictInfo = { word: '안녕하세요', meanings: ['hello'] } as unknown as DictInfo;
                
                jest.spyOn(NaverAPI, 'getSearchInfoRaw').mockResolvedValue(mockSearchInfo);
                jest.spyOn(NaverScraper, 'scrape').mockReturnValue(mockDictInfo);
                
                const result = await NaverAPI.get('안녕하세요');
                
                expect(NaverAPI.getSearchInfoRaw).toHaveBeenCalledWith('안녕하세요');
                expect(result).toEqual(mockDictInfo);
            });
        });

        describe('getMessage', () => {
            it('builds a message from dictionary info', async () => {
                const mockDictInfo = { word: '감사합니다', meanings: ['thank you'] } as unknown as DictInfo;
                const mockMessage = '감사합니다 - thank you';
                
                jest.spyOn(NaverAPI, 'get').mockResolvedValue(mockDictInfo);
                jest.spyOn(MsgBuilder, 'build').mockReturnValue(mockMessage);
                
                const result = await NaverAPI.getMessage('감사합니다');
                
                expect(NaverAPI.get).toHaveBeenCalledWith('감사합니다');
                expect(MsgBuilder.build).toHaveBeenCalledWith(mockDictInfo);
                expect(result).toBe(mockMessage);
            });

            it('handles common Korean expressions', async () => {
                const mockDictInfo = { word: '미안해요', meanings: ['I\'m sorry'] } as unknown as DictInfo;
                const mockMessage = '미안해요 - I\'m sorry';
                
                jest.spyOn(NaverAPI, 'get').mockResolvedValue(mockDictInfo);
                jest.spyOn(MsgBuilder, 'build').mockReturnValue(mockMessage);
                
                const result = await NaverAPI.getMessage('미안해요');
                
                expect(NaverAPI.get).toHaveBeenCalledWith('미안해요');
                expect(result).toBe(mockMessage);
            });
        });
    });
});