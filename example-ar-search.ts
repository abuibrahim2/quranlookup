// @ts-ignore
import Fuse from 'fuse.js';

// Define types
interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
}

interface QuranData {
  surahs: Surah[];
}

// Sample Quran data (first two surahs, simplified)
const quranData: QuranData = {
  surahs: [
    {
      number: 1,
      name: "سورة الفاتحة",
      englishName: "Al-Faatiha",
      ayahs: [
        { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 1, surahNumber: 1, surahName: "الفاتحة" },
        { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", numberInSurah: 2, surahNumber: 1, surahName: "الفاتحة" },
        { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 3, surahNumber: 1, surahName: "الفاتحة" },
      ]
    },
    {
      number: 2,
      name: "سورة البقرة",
      englishName: "Al-Baqara",
      ayahs: [
        { number: 1, text: "الم", numberInSurah: 1, surahNumber: 2, surahName: "البقرة" },
        { number: 2, text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", numberInSurah: 2, surahNumber: 2, surahName: "البقرة" },
      ]
    }
  ]
};

// Function to remove tashkeel
function removeTashkeel(text: string): string {
  const tashkeelRegex = /[\u0617-\u061A\u064B-\u0652]/g;
  return text.replace(tashkeelRegex, '');
}

// Function to normalize Arabic text
function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '');
}

// Preprocess the Quran data
const preprocessedQuranData: Ayah[] = quranData.surahs.flatMap(surah =>
  surah.ayahs.map(ayah => ({
    ...ayah,
    normalizedText: normalizeArabic(ayah.text),
    textWithoutTashkeel: removeTashkeel(normalizeArabic(ayah.text))
  }))
);

// Search function
function searchQuran(quranData: QuranData, query: string, limit = 10): Ayah[] {
  const originalQuery = normalizeArabic(query);
  const queryWithoutTashkeel = removeTashkeel(originalQuery);

  const options = {
    keys: ['normalizedText', 'textWithoutTashkeel'],
    includeScore: true,
    threshold: 0.3,
    useExtendedSearch: true,
  };

  const fuse = new Fuse(preprocessedQuranData, options);
  const results = fuse.search({
    $or: [
      { normalizedText: originalQuery },
      { textWithoutTashkeel: queryWithoutTashkeel }
    ]
  });

  return results.slice(0, limit).map(result => result.item);
}

// Test the search function
const searchQuery = "الحمد لله";
const searchResults = searchQuran(quranData, searchQuery, 5);

// Display results
console.log("Search Query:", searchQuery);
console.log("Search Results:");
searchResults.forEach(ayah => {
  console.log(`Surah ${ayah.surahNumber} (${ayah.surahName}), Verse ${ayah.numberInSurah}:`);
  console.log(ayah.text);
  console.log('---');
});