import { MsgBuilder } from '../scraper/msgBuilder';
import type { DictInfo } from '../scraper/datastruct';

describe('MsgBuilder', () => {

    describe('buildSentence method', () => {
        // To test private method, we need to access it using type assertion
        const buildSentence = (MsgBuilder as any).buildSentence.bind(MsgBuilder);
        
        it('should concatenate components with a prefix', () => {
            expect(buildSentence('Prefix: ', ['one', 'two', 'three'])).toBe('Prefix: one two three');
        });
        
        it('should filter out empty components', () => {
            expect(buildSentence('Prefix: ', ['one', '', 'three'])).toBe('Prefix: one three');
        });
        
        it('should return empty string when all components are empty', () => {
            expect(buildSentence('Prefix: ', ['', ''])).toBe('');
        });
        
        it('should return empty string when components array is empty', () => {
            expect(buildSentence('Prefix: ', [])).toBe('');
        });
        
        it('should handle empty prefix correctly', () => {
            expect(buildSentence('', ['one', 'two'])).toBe('one two');
        });
        
        it('should handle single component', () => {
            expect(buildSentence('Prefix: ', ['single'])).toBe('Prefix: single');
        });
    });

    describe('build method', () => {
        it('should build a complete message when all fields are provided', () => {
            const dictInfo: DictInfo = {
                TopikLevel: '(TOPIK Elementary)',
                ImportanceLevel: '★★★',
                Title: '안녕하세요',
                Hanja: '安寧-',
                EnDef: 'Hello',
                Pronun: 'annyeonghaseyo',
                PartSpeech: 'expression',
                Meanings: '1. Hello 2. Hi'
            };

            const expected = 
                '(TOPIK Elementary) ★★★\n' +
                '안녕하세요 安寧-\n' +
                'Hello\n' +
                '----------\n' +
                'Pronunciation:\n' +
                'roma annyeonghaseyo\n' +
                '----------\n' +
                'expression\n' +
                '1. Hello 2. Hi';

            expect(MsgBuilder.build(dictInfo)).toBe(expected);
        });

        it('should handle missing fields', () => {
            const dictInfo: DictInfo = {
                Title: '안녕하세요',
                Meanings: '1. Hello 2. Hi'
            } as DictInfo;

            const expected = 
                '안녕하세요\n' +
                '----------\n' +
                '1. Hello 2. Hi';

            expect(MsgBuilder.build(dictInfo)).toBe(expected);
        });

        it('should handle empty fields', () => {
            const dictInfo: DictInfo = {
                TopikLevel: '',
                ImportanceLevel: '',
                Title: '',
                Hanja: '',
                EnDef: '',
                Pronun: '',
                PartSpeech: '',
                Meanings: ''
            };
            const expected = '';
            expect(MsgBuilder.build(dictInfo)).toBe(expected);
        });

        it('should handle undefined dictInfo', () => {
            const dictInfo = undefined as unknown as DictInfo;
            const expected = '';
            expect(MsgBuilder.build(dictInfo)).toBe(expected);
        });

        it('should not include empty components in the output', () => {
            const dictInfo: DictInfo = {
                Title: '단어',
                Hanja: '',
                Meanings: '의미'
            } as DictInfo;

            const result = MsgBuilder.build(dictInfo);
            expect(result).toBe('단어\n----------\n의미');
        });
    });
});