import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, Notice, MarkdownRenderer, SuggestModal} from "obsidian";
import Fuse from "fuse.js";
// Remember to rename these classes and interfaces!

const Translations: Record<string, { identifier: string; name: string }[]> = {
  en: [
    { identifier: "en.ahmedali", name: "Ahmed Ali" },
    { identifier: "en.ahmedraza", name: "Ahmed Raza Khan" },
    { identifier: "en.arberry", name: "Arberry" },
    { identifier: "en.asad", name: "Asad" },
    { identifier: "en.daryabadi", name: "Daryabadi" },
    { identifier: "en.hilali", name: "Hilali & Khan" },
    { identifier: "en.pickthall", name: "Pickthall" },
    { identifier: "en.qaribullah", name: "Qaribullah & Darwish" },
    { identifier: "en.sahih", name: "Saheeh International" },
    { identifier: "en.sarwar", name: "Sarwar" },
    { identifier: "en.yusufali", name: "Yusuf Ali" },
    { identifier: "en.maududi", name: "Maududi" },
    { identifier: "en.shakir", name: "Shakir" },
    { identifier: "en.transliteration", name: "Transliteration" },
    { identifier: "en.walk", name: "Ibrahim Walk" },
    { identifier: "en.itani", name: "Clear Qur'an - Talal Itani" },
    { identifier: "en.mubarakpuri", name: "Mubarakpuri" },
    { identifier: "en.qarai", name: "Qarai" },
    { identifier: "en.wahiduddin", name: "Wahiduddin Khan" },
  ],
  fr: [{ identifier: "fr.hamidullah", name: "Hamidullah" }],
  de: [
    { identifier: "de.aburida", name: "Abu Rida" },
    { identifier: "de.bubenheim", name: "Bubenheim & Elyas" },
  ],
  az: [
    { identifier: "az.mammadaliyev", name: "Məmmədəliyev & Bünyadov" },
    { identifier: "az.musayev", name: "Musayev" },
  ],
  bn: [{ identifier: "bn.bengali", name: "Muhiuddin Khan" }],
  cs: [
    { identifier: "cs.hrbek", name: "Hrbek" },
    { identifier: "cs.nykl", name: "Nykl" },
  ],
  dv: [
    { identifier: "dv.divehi", name: "Office of the President of Maldives" },
  ],
  fa: [
    { identifier: "fa.ayati", name: "Ayati" },
    { identifier: "fa.fooladvand", name: "Fooladvand" },
    { identifier: "fa.ghomshei", name: "Elahi Ghomshei" },
  ],
  ha: [{ identifier: "ha.gumi", name: "Gumi" }],
  hi: [
    {
      identifier: "hi.hindi",
      name: "Suhel Farooq Khan and Saifur Rahman Nadwi",
    },
  ],
  id: [{ identifier: "id.indonesian", name: "Bahasa Indonesia" }],
  it: [{ identifier: "it.piccardo", name: "Piccardo" }],
  ja: [{ identifier: "ja.japanese", name: "Japanese" }],
  ko: [{ identifier: "ko.korean", name: "Korean" }],
  ku: [{ identifier: "ku.asan", name: "Burhan Muhammad-Amin" }],
  ml: [
    {
      identifier: "ml.abdulhameed",
      name: "Cheriyamundam Abdul Hameed and Kunhi Mohammed Parappoor",
    },
  ],
  nl: [{ identifier: "nl.keyzer", name: "Keyzer" }],
  no: [{ identifier: "no.berg", name: "Einar Berg" }],
  pl: [{ identifier: "pl.bielawskiego", name: "Bielawskiego" }],
  pt: [{ identifier: "pt.elhayek", name: "El-Hayek" }],
  ro: [{ identifier: "ro.grigore", name: "Grigore" }],
  ru: [
    { identifier: "ru.kuliev", name: "Kuliev" },
    { identifier: "ru.osmanov", name: "Osmanov" },
    { identifier: "ru.porokhova", name: "Porokhova" },
  ],
  sd: [{ identifier: "sd.amroti", name: "Amroti" }],
  so: [{ identifier: "so.abduh", name: "Abduh" }],
  sq: [
    { identifier: "sq.ahmeti", name: "Sherif Ahmeti" },
    { identifier: "sq.mehdiu", name: "Feti Mehdiu" },
    { identifier: "sq.nahi", name: "Efendi Nahi" },
  ],
  sv: [{ identifier: "sv.bernstrom", name: "Bernström" }],
  sw: [{ identifier: "sw.barwani", name: "Al-Barwani" }],
  ta: [{ identifier: "ta.tamil", name: "Jan Turst Foundation" }],
  th: [{ identifier: "th.thai", name: "King Fahad Quran Complex" }],
  tr: [
    { identifier: "tr.ates", name: "Suleyman Ates" },
    { identifier: "tr.bulac", name: "Ali Bulaç" },
    { identifier: "tr.diyanet", name: "Diyanet İşleri" },
  ],
  tt: [{ identifier: "tt.nugman", name: "Yakub Ibn Nugman" }],
  ug: [{ identifier: "ug.saleh", name: "Muhammad Saleh" }],
  ur: [
    { identifier: "ur.ahmedali", name: "Ahmed Ali" },
    { identifier: "ur.jalandhry", name: "Fateh Muhammad Jalandhry" },
    { identifier: "ur.jawadi", name: "Syed Zeeshan Haider Jawadi" },
  ],
  uz: [{ identifier: "uz.sodik", name: "Muhammad Sodik Muhammad Yusuf" }],
};

const DisplayOptions: Record<number, string> = {
  0: "Text Only",
  1: "Markdown Table",
  2: "Obsidian Callout (original)",
};

const ArabicStyleOptions: Record<number, string> = {
  0: "None",
  1: "HTML span w/ class",
  2: "Code Override (`)",
};

interface QuranLookupPluginSettings {
  translatorLanguage: string;
  translatorIndex: number;
  displayTypeIndex: number;
  arabicStyleIndex: number;
  includeTranslation: boolean;
  removeParens: boolean;
  displayTable: boolean;
  displayCallOut: boolean;
  calloutType: string; // New field for callout type
  wrapQuranInCode: boolean; // New field to wrap Quran Arabic in backticks or not
  wrapQuranInSpan: boolean;
  fontFamily: string;
  fontSize: string;
  offlineMode: boolean;
  searchArabicEdition: boolean;
}

interface surahMeta {
  index: string;
  title: string;
  titleAr: string;
  count: string;
}

//interface ArKeys { verseNum: number; arText: string; }
//interface EnKeys { verseNum: number; enText: string; }

interface QuranData {
  data: {
    surahs: Array<{
      number: number;
      name: string;
      englishName?: string;
      ayahs: Array<{
        number: number;
        text: string;
        numberInSurah: number;
      }>;
    }>;
  };
}

interface OfflineStorage {
    translations: {
        [edition: string]: QuranData;
    };
}

const DEFAULT_SETTINGS: QuranLookupPluginSettings = {
  translatorLanguage: "en",
  translatorIndex: 0,
  displayTypeIndex: 2,
  arabicStyleIndex: 0,
  includeTranslation: true,
  removeParens: true,
  displayTable: false,
  displayCallOut: true,
  calloutType: "tip",
  wrapQuranInCode: false,
  wrapQuranInSpan: false,
  fontFamily: "me_quran",
  fontSize: "24px",
  offlineMode: false,
  searchArabicEdition: false,
};

interface SearchMatch {
    number: number;
    text: string;
    arabicText?: string;
    edition: {
        identifier: string;
        language: string;
        name: string;
        englishName: string;
        type: string;
    };
    surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        revelationType: string;
    };
    numberInSurah: number;
}

type FetchResult = {
    match: SearchMatch;
    data?: { code: number; data: { text: string } };
    error?: { 
        message: string; 
        code?: number; 
        details?: string 
    };
};

class QuranSearchModal extends SuggestModal<SearchMatch> {
    plugin: QuranLookupPlugin;
    editor: Editor;
    searchResults: SearchMatch[] = [];
    suggestions: SearchMatch[] = [];
    searchArabicCheckbox: HTMLInputElement;
    currentPage = 1;
    resultsPerPage = 10;
    totalPages = 1;
    paginationEl: HTMLElement;
    fetchedArabicVerses: Set<string> = new Set(); // Cache to track which verses we've already fetched

    constructor(app: App, plugin: QuranLookupPlugin, editor: Editor) {
        super(app);
        this.plugin = plugin;
        this.editor = editor;
        this.setPlaceholder("Enter text to search for in the Quran...");
        
        // Create footer container
        const footerEl = this.modalEl.createDiv({ cls: 'search-results-footer' });
        
        // Create pagination controls container
        const paginationControlsEl = footerEl.createDiv({ cls: 'pagination-controls' });
        
        // Create pagination element inside pagination controls
        this.paginationEl = paginationControlsEl.createDiv("search-pagination");
        this.paginationEl.style.display = "flex";
        this.paginationEl.style.justifyContent = "center";
        this.paginationEl.style.gap = "10px";
        this.paginationEl.style.marginTop = "10px";
        
        const prevButton = this.paginationEl.createEl("button", { text: "Previous" });
        const pageInfo = this.paginationEl.createSpan();
        const nextButton = this.paginationEl.createEl("button", { text: "Next" });
        
        prevButton.onclick = () => this.changePage(this.currentPage - 1);
        nextButton.onclick = () => this.changePage(this.currentPage + 1);
        
        // Add pagination info span to footer
        const paginationInfo = footerEl.createSpan({ cls: 'pagination-info' });
        
        // Update pagination info
        this.updatePaginationInfo(pageInfo, prevButton, nextButton);
    }

    onOpen() {
        super.onOpen();

        const { contentEl } = this;
        
        // Create header for search results count
        const headerEl = contentEl.createDiv({ cls: "search-results-header" });
        const countEl = headerEl.createSpan({ cls: "search-results-count" });
        this.updateSearchCount(countEl);

        // Create container for search results
        const resultsContainer = contentEl.createDiv();
        resultsContainer.style.margin = "8px";
        
        // Wait for modal to be fully rendered
        setTimeout(() => {
            // Add checkbox for Arabic search
            const resultsContainer = this.modalEl.querySelector('.prompt-results');
            if (!resultsContainer) {
                console.error('Results container not found');
                return;
            }

            // Create container for checkbox and search button
            const controlsContainer = createEl('div', { cls: 'search-controls-container' });
            resultsContainer.insertAdjacentElement('beforebegin', controlsContainer);
            
            // Create checkbox container
            const checkboxContainer = createEl('div', { cls: 'search-arabic-container' });
            controlsContainer.appendChild(checkboxContainer);
            
            this.searchArabicCheckbox = checkboxContainer.createEl('input', { type: 'checkbox' });
            this.searchArabicCheckbox.checked = this.plugin.settings.searchArabicEdition;
            
            const label = checkboxContainer.createEl('label');
            label.textContent = 'Search Arabic Edition';
            
            // Add search button
            const searchButton = createEl('button', {
                cls: 'mod-cta',
                text: 'Search'
            });
            controlsContainer.appendChild(searchButton);
            
            // Update settings when checkbox changes
            this.searchArabicCheckbox.addEventListener('change', (e) => {
                this.plugin.settings.searchArabicEdition = this.searchArabicCheckbox.checked;
                this.plugin.saveSettings();
            });

            // Handle search button click
            searchButton.addEventListener('click', async () => {
                await this.performSearch();
            });

            // Handle Enter key
            this.inputEl.addEventListener("keydown", async (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    await this.performSearch();
                }
            });
        }, 50);
    }

    updateSearchCount(countEl: HTMLSpanElement) {
        const count = this.searchResults.length;
        countEl.setText(`${count} Search Results`);
    }

    updatePaginationDisplay() {
        const pageInfo = this.paginationEl.querySelector("span");
        const buttons = Array.from(this.paginationEl.querySelectorAll("button"));
        const [prevButton, nextButton] = buttons;
        
        if (pageInfo && prevButton && nextButton) {
            this.updatePaginationInfo(pageInfo, prevButton, nextButton);
            this.refreshSuggestions();
        }
    }

    updatePaginationInfo(pageInfo: HTMLSpanElement, prevButton: HTMLButtonElement, nextButton: HTMLButtonElement) {
        const totalResults = this.searchResults.length;
        this.totalPages = Math.ceil(totalResults / this.resultsPerPage);
        
        // Update page info text
        pageInfo.setText(`Page ${this.currentPage} of ${this.totalPages}`);
        
        // Get or create footer container
        const footerEl = this.modalEl.querySelector('.search-results-footer');
        if (footerEl) {
            // Update pagination info text
            const paginationInfo = footerEl.querySelector('.pagination-info');
            if (paginationInfo) {
                const start = (this.currentPage - 1) * this.resultsPerPage + 1;
                const end = Math.min(this.currentPage * this.resultsPerPage, totalResults);
                paginationInfo.setText(`${start}-${end} of ${totalResults} Search Results`);
            }
        }

        prevButton.disabled = this.currentPage === 1;
        nextButton.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    }

    changePage(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updatePaginationDisplay();
            this.fetchArabicVersesForCurrentPage();
        }
    }

    async performSearch() {
        const query = this.inputEl.value;
        if (query.length < 3) {
            new Notice("Please enter at least 3 characters to search");
            return;
        }

        try {
            new Notice("Searching...");
            
            // Clear the cache when performing a new search
            this.fetchedArabicVerses.clear();
            
            const editions = [
                this.plugin.settings.translatorLanguage + "." + 
                Translations[this.plugin.settings.translatorLanguage][this.plugin.settings.translatorIndex].identifier.split('.')[1]
            ];

            if (this.plugin.settings.searchArabicEdition) {
                editions.push("ar.quran-simple");
            }

            // Initial search for translations and Arabic text if enabled
            const results = await Promise.all(
                editions.map(edition =>
                    fetch(`http://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`)
                        .then(res => res.json())
                        .catch(error => ({ code: 500, error: error.message }))
                )
            );

            // Process translation results
            const translationResults: SearchMatch[] = results[0].code === 200 ? results[0].data.matches : [];
            if (translationResults.length === 0) {
                new Notice("No matches found");
                this.searchResults = [];
                this.updatePaginationDisplay();
                return;
            }

            // Store results and update pagination
            this.searchResults = translationResults;
            this.currentPage = 1;
            this.totalPages = Math.ceil(this.searchResults.length / this.resultsPerPage);
            
            // Fetch Arabic verses only for the current page
            await this.fetchArabicVersesForCurrentPage();
            this.updatePaginationDisplay();
            
            new Notice(`Found ${this.searchResults.length} matches`);
        } catch (error) {
            new Notice("Error searching Quran: " + error.message);
            console.error("Search error:", error);
        }
        
        this.refreshSuggestions();
    }

    async fetchArabicVersesForCurrentPage() {
        if (this.plugin.settings.searchArabicEdition) {
          return; // Arabic text already included in search results
        }

        try {
            const startIdx = (this.currentPage - 1) * this.resultsPerPage;
            const endIdx = Math.min(startIdx + this.resultsPerPage, this.searchResults.length);
            const currentPageResults = this.searchResults.slice(startIdx, endIdx);

            // Filter out verses we've already fetched
            const unfetchedResults = currentPageResults.filter(match => {
                const verseKey = `${match.surah.number}:${match.numberInSurah}`;
                return !this.fetchedArabicVerses.has(verseKey) && !match.arabicText;
            });

            if (unfetchedResults.length === 0) {
                return; // All verses for this page are already fetched
            }

            // Create an array of promise factory functions for unfetched verses
            const fetchPromises = unfetchedResults.map(match => () => {
                const verseKey = `${match.surah.number}:${match.numberInSurah}`;
                return fetch(`http://api.alquran.cloud/v1/ayah/${match.surah.number}:${match.numberInSurah}/ar.quran-simple`)
                    .then(res => res.json())
                    .then(data => ({ match, data, verseKey }) as FetchResult & { verseKey: string })
                    .catch(error => ({ match, error, verseKey }) as FetchResult & { verseKey: string });
            });

            // Use rate limiting to fetch Arabic verses
            const results = await rateLimit<FetchResult & { verseKey: string }>(fetchPromises, 3, 1000);

            // Process results and update cache
            results.forEach((result) => {
                if (result.data?.code === 200) {
                    result.match.arabicText = result.data.data.text;
                    this.fetchedArabicVerses.add(result.verseKey);
                } else if (result.error) {
                    console.error(`Error fetching Arabic verse for ${result.match.surah.number}:${result.match.numberInSurah}:`, result.error);
                }
            });

            this.refreshSuggestions();
        } catch (error) {
            console.error("Error fetching Arabic verses:", error);
            new Notice("Error fetching some Arabic verses");
        }
    }

    getSuggestions(query: string): SearchMatch[] {
        // If no query, return an empty array
        if (!query) return [];

        // Return only the current page of results
        const startIdx = (this.currentPage - 1) * this.resultsPerPage;
        const endIdx = Math.min(startIdx + this.resultsPerPage, this.searchResults.length);
        return this.searchResults.slice(startIdx, endIdx);
    }

    renderSuggestion(match: SearchMatch, el: HTMLElement) {
        // Add suggestion-item class to the parent element
        el.addClass("suggestion-item");
        
        const titleEl = el.createEl("div", { cls: "suggestion-title" });
        const surahEl = titleEl.createSpan({ cls: "surah-reference" });
        surahEl.setText(match.surah.englishName);
        
        const verseRef = titleEl.createSpan({ cls: "verse-reference" });
        verseRef.setText(` ${match.surah.number}:${match.numberInSurah}`);
        
        const textEl = el.createEl("div", { cls: "suggestion-text" });
        textEl.setText(match.text);

        if (match.arabicText) {
            const arabicEl = el.createEl("div", { cls: "suggestion-arabic" });
            arabicEl.setText(match.arabicText);
        }

        // Add mouseover handler to update selected suggestion
        el.addEventListener('mouseover', () => {
            const items = this.resultContainerEl.querySelectorAll('.suggestion-item');
            const index = Array.from(items).indexOf(el);
            if (index >= 0) {
                this.setSelectedItem(index, true);
            }
        });
    }

    refreshSuggestions() {
        this.suggestions = this.getSuggestions(this.inputEl.value);
        // @ts-ignore: Private method exists in SuggestModal
        super.updateSuggestions();
    }

    setSelectedItem(index: number, scrollIntoView = false) {
        const items = this.resultContainerEl.querySelectorAll('.suggestion-item');
        
        // Remove previous selection
        items.forEach(item => item.classList.remove('is-selected'));
        
        // Select the new item
        if (index >= 0 && index < items.length) {
            const selectedItem = items[index] as HTMLElement;
            selectedItem.classList.add('is-selected');
            
            if (scrollIntoView) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    async onChooseSuggestion(match: SearchMatch, evt: MouseEvent | KeyboardEvent) {
        const verseRef = `${match.surah.number}:${match.numberInSurah}`;
        const verseContent = await this.plugin.getAyah(verseRef);
        this.editor.replaceSelection(verseContent);
    }
}

// Add rate limiting utility
async function rateLimit<T>(promises: (() => Promise<T>)[], batchSize = 3, delayMs = 500): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(p => p()));
        results.push(...batchResults);
        if (i + batchSize < promises.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return results;
}

export default class QuranLookupPlugin extends Plugin {
  settings: QuranLookupPluginSettings;
  surahJson: surahMeta[];
  surahList: string[];
  fuse: any;
  offlineData: { [key: string]: QuranData } = {};

  async onload() {
    await this.loadSettings();

    // Load offline data if enabled
    if (this.settings.offlineMode) {
      await this.ensureOfflineData();
    }

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: "ayah-list-command",
      name: "Retrieve Ayaat",
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        // tokenize verse shorthand
        const ayaat = editor.getSelection().split(" ").filter(Boolean);
        let totalT = "";
        let verseText = "";

        for (const verse of ayaat) {
          let rVerse = verse;

          // Deal with written surah names
          const surah = verse.split(":")[0];
          if (isNaN(parseInt(surah))) {
            let surahIndex = 0;

            // validate that fuse was initialized first
            if (!this.fuse) {
              console.error('Fuse.js is not initialized.');
              return;
            }
            const surahNum = this.fuse.search(surah)[0].item;
            if (surahNum != undefined) {
              surahIndex = parseInt((surahNum as surahMeta).index);
            }
            rVerse = "" + surahIndex + ":" + verse.split(":")[1];
          }
          // Determine if Range vs Single Ayah
          if (rVerse.includes("-")) {
            verseText = await this.getAyahRange(rVerse);
          } else {
            verseText = (await this.getAyah(rVerse)) + "\n";
          }
          totalT += verseText + "\n";
        }
        editor.replaceSelection(totalT);
      },
    });

    // Add search command
    this.addCommand({
        id: 'search-quran',
        name: 'Search Quran',
        editorCallback: (editor: Editor, view: MarkdownView) => {
            new QuranSearchModal(this.app, this, editor).open();
        }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new QuranLookupSettingTab(this.app, this));

    // Apply initial styles
    this.updateStyles();
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async onLayoutReady() {
    console.log('Layout is ready. Initializing Surah data...');
    await this.initializeSurahData();
  }

  private async initializeSurahData() {
    try {
        // Load surah data
        this.surahJson = require("./surahSlim.json");
        this.surahList = this.surahJson.map((m) => m.title);

        // Initialize Fuse.js
        const options = { keys: ['title'] };
        this.fuse = new Fuse(this.surahJson, options);

        console.log('Surah data initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize Surah data:', error);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  handleParens(txtVal: string, removeParens: boolean) {
    return removeParens
      ? txtVal
          .replace(/ *\([^)]*\)*/g, "") // remove ()
          .replace(/ \[(.+?)\]/g, " ") // remove []
          .replace(/\s+([.,!":])/g, "$1") // fix extra spaces near punctuations
      : txtVal;
  }

  updateStyles() {
    // Convert StyleSheetList to an array
    const sheets = Array.from(document.styleSheets);

    for (const sheet of sheets) {
        try {
            // Access rules within the stylesheet
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of Array.from(rules)) { // Convert CSSRuleList to an array
                // Find the .quran-arabic CSS rule
                if ((rule as CSSStyleRule).selectorText === '.quran-arabic') {
                    (rule as CSSStyleRule).style.fontFamily = `${this.settings.fontFamily}, 'Segoe UI Fixed', monospace`;
                    (rule as CSSStyleRule).style.fontSize = this.settings.fontSize;
                }
            }
        } catch (e) {
            // Catch potential cross-origin errors, ignore
            console.warn('Could not access stylesheet:', e);
        }
    }

    // Updates the Code styling override style setting
    if (this.settings.arabicStyleIndex == 2) {
      this.toggleCodeStyling(true);
    } else {
      this.toggleCodeStyling(false);
    }
  }

  toggleCodeStyling(apply: boolean): void {
    const styleId = "quran-arabic-code-style";

    // Remove existing dynamic style
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
        existingStyle.remove();
    }

    // Add styles dynamically if `apply` is true
    if (apply) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .cm-s-obsidian span.cm-inline-code,
            .cm-s-obsidian .HyperMD-codeblock,
            .markdown-preview-view code,
            .callout-content code,
            .markdown-rendered code,
            .table-cell-wrapper .esm-rtl,
            td.esm-rtl {
                background-color: transparent !important;
                font-family: ${this.settings.fontFamily}, 'Segoe UI Fixed', monospace;
                font-size: ${this.settings.fontSize} !important;
                line-height: 200%;
                direction: rtl;
            }
        `;
        document.head.appendChild(style);
    }
  }

  applyArabicStyle(txtVal: string, styleIndex: number)  {
    if (styleIndex == 1) {
      return `<span class="quran-arabic">${txtVal}</span>`;
    } else if (styleIndex == 2) {
      return "`"  + txtVal + "`";
    } else {
      return txtVal;
    }
  }

  resolveAPIurl( surah: string, edition: string, startAyah: number, ayahRange = 1 ): string {
    return ( "https://api.alquran.cloud/v1/surah/" + surah + "/" + edition + "?offset=" + startAyah + "&limit=" + ayahRange );
  }

  async fetchArabicOnly(urlArabic: string) {
    const arabicResponse = await fetch(urlArabic);
    const arabic = await arabicResponse.json();
    return arabic;
  }

  async fetchArabicAndTranslation(urlArabic: string, urlEnglish: string) {
    const [arabicResponse, englishResponse] = await Promise.all([
      fetch(urlArabic),
      fetch(urlEnglish),
    ]);
    const arabic = await arabicResponse.json();
    const english = await englishResponse.json();
    return [arabic, english];
  }

  async getAyah(verse: string): Promise<string> {
    const surah = verse.split(":")[0];
    const ayah = parseInt(verse.split(":")[1]) - 1;
    
    let result = "";
    
    if (this.settings.offlineMode) {
      // Offline mode
      const arabicData = await this.getOfflineVerse(parseInt(surah), ayah + 1, "ar.quran-simple");
      let translationData = null;
      
      if (this.settings.includeTranslation) {
        const translationEdition = Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier;
        translationData = await this.getOfflineVerse(parseInt(surah), ayah + 1, translationEdition);
      }

      if (arabicData) {
        const arText = this.applyArabicStyle(arabicData.data.ayahs[0].text, this.settings.arabicStyleIndex);
        const surahName = translationData ? translationData.data.englishName : arabicData.data.name;
        const surahNumber = arabicData.data.number;
        const ayahNumber = arabicData.data.ayahs[0].numberInSurah;
        const verseHeader = `${surahName} (${surahNumber}:${ayahNumber})`;
        
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |  |\n| ---- | ---- |\n`;
          if (translationData) {
            const enText = this.handleParens(translationData.data.ayahs[0].text, this.settings.removeParens);
            result += "| " + enText + " | " + arText + " |\n";
          } else {
            result += "| " + arText + " | " + arText + " |\n";
          }
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += "> [!" + calloutType + "]+ " + verseHeader + "\n";
          if (translationData) {
            const enText = this.handleParens(translationData.data.ayahs[0].text, this.settings.removeParens);
            result += "> " + enText + "\n> " + arText + "\n>";
          } else {
            result += "> " + arText + "\n>";
          }
        } else {
          // Text Only
          result += `${verseHeader}\n`;
          if (translationData) {
            const enText = this.handleParens(translationData.data.ayahs[0].text, this.settings.removeParens);
            result += `${enText}\n${arText}\n`;
          } else {
            result += arText + "\n";
          }
        }
      }
    } else {
      // Online mode
      const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", ayah);
      
      if (this.settings.includeTranslation) {
        const translator = Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier;
        const urlEnglish = this.resolveAPIurl(surah, translator, ayah);
        const [arabic, english] = await this.fetchArabicAndTranslation(urlArabic, urlEnglish);
      
        const arText = this.applyArabicStyle(arabic.data.ayahs[0].text, this.settings.arabicStyleIndex);
        const enText = this.handleParens(english.data.ayahs[0].text, this.settings.removeParens);
        const surahName = english.data.englishName;
        const surahNumber = english.data.number;
        const ayahNumber = english.data.ayahs[0].numberInSurah;
      
        const verseHeader = `${surahName} (${surahNumber}:${ayahNumber})`;
      
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |  |\n| ---- | ---- |\n`;
          result += "| " + enText + " | " + arText + " |\n";
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += "> [!" + calloutType + "]+ " + verseHeader + "\n> " + enText + "\n> " + arText + "\n>";
        } else {
          // Text Only
          result += `${verseHeader}\n${enText}\n` + arText + "\n";
        }
      } else {
        // Arabic Only
        const arabic = await this.fetchArabicOnly(urlArabic);
        const arText = this.applyArabicStyle(arabic.data.ayahs[0].text, this.settings.arabicStyleIndex);
        const surahName = arabic.data.name;
        const surahNumber = arabic.data.number;
        const ayahNumber = arabic.data.ayahs[0].numberInSurah;
      
        const verseHeader = `${surahName} (${surahNumber}:${ayahNumber})`;
      
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |\n| ---- |\n`;
          result += "| " + arText + " |\n";
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += `> [!${calloutType}]+ ${verseHeader}\n> ` + arText + "\n>";
        } else {
          // Text Only
          result += `${verseHeader}\n` + arText + "\n";
        }
      }
    }
    
    return result;
  }
  
  async getAyahRange(verse: string): Promise<string> {
    const surah = verse.split(":")[0];
    const ayahRangeText = verse.split(":")[1];
    const startAyah = parseInt(ayahRangeText.split("-")[0]) - 1;
    const endAyah = parseInt(ayahRangeText.split("-")[1]);
    const ayahRange = endAyah - startAyah;
    
    let result = "";
    
    if (this.settings.offlineMode) {
      // Offline mode
      const arabicData = await this.getOfflineVerseRange(parseInt(surah), startAyah + 1, endAyah, "ar.quran-simple");
      let translationData = null;
      
      if (this.settings.includeTranslation) {
        const translationEdition = Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier;
        translationData = await this.getOfflineVerseRange(parseInt(surah), startAyah + 1, endAyah, translationEdition);
      }

      if (arabicData) {
        const surahName = translationData ? translationData.data.englishName : arabicData.data.name;
        const surahNumber = arabicData.data.number;
        const verseHeader = `${surahName} (${surahNumber}:${ayahRangeText})`;
        
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |  |\n| ---- | ---- |\n`;
          for (let i = 0; i < arabicData.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabicData.data.ayahs[i].text, this.settings.arabicStyleIndex);
            if (translationData) {
              const enText = this.handleParens(translationData.data.ayahs[i].text, this.settings.removeParens);
              result += "| " + enText + " | " + arText + " |\n";
            } else {
              result += "| " + arText + " | " + arText + " |\n";
            }
          }
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += `> [!${calloutType}]+ ${verseHeader}\n`;
          for (let i = 0; i < arabicData.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabicData.data.ayahs[i].text, this.settings.arabicStyleIndex);
            if (translationData) {
              const enText = this.handleParens(translationData.data.ayahs[i].text, this.settings.removeParens);
              result += "> " + enText + "\n> " + arText + "\n>\n";
            } else {
              result += "> " + arText + "\n>\n";
            }
          }
          result = result.trim();
        } else {
          // Text Only
          result += `${verseHeader}\n`;
          for (let i = 0; i < arabicData.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabicData.data.ayahs[i].text, this.settings.arabicStyleIndex);
            if (translationData) {
              const enText = this.handleParens(translationData.data.ayahs[i].text, this.settings.removeParens);
              result += `${enText}\n${arText}\n\n`;
            } else {
              result += arText + "\n\n";
            }
          }
          result = result.trim();
        }
      }
    } else {
      // Online mode
      const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", startAyah, ayahRange);
      
      if (this.settings.includeTranslation) {
        const translator = Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier;
        const urlEnglish = this.resolveAPIurl(surah, translator, startAyah, ayahRange);
        const [arabic, english] = await this.fetchArabicAndTranslation(urlArabic, urlEnglish);
      
        const surahName = english.data.englishName;
        const surahNumber = english.data.number;
        const verseHeader = `${surahName} (${surahNumber}:${ayahRangeText})`;
      
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |  |\n| ---- | ---- |\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabic.data.ayahs[i].text, this.settings.arabicStyleIndex);
            const enText = this.handleParens(english.data.ayahs[i].text, this.settings.removeParens);
            result += "| " + enText + " | " + arText + " |\n";
          }
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += `> [!${calloutType}]+ ${verseHeader}\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabic.data.ayahs[i].text, this.settings.arabicStyleIndex);
            const enText = this.handleParens(english.data.ayahs[i].text, this.settings.removeParens);
            result += `> ${enText}\n> ` + arText + "\n>\n";
          }
          result = result.trim();
        } else {
          // Text Only
          result += `${verseHeader}\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = this.applyArabicStyle(arabic.data.ayahs[i].text, this.settings.arabicStyleIndex);
            const enText = this.handleParens(english.data.ayahs[i].text, this.settings.removeParens);
            result += `${enText}\n` + arText + "\n\n";
          }
          result = result.trim();
        }
      } else {
        // Arabic Only
        const arabic = await this.fetchArabicOnly(urlArabic);
      
        const surahName = arabic.data.name;
        const surahNumber = arabic.data.number;
        const verseHeader = `${surahName} (${surahNumber}:${ayahRangeText})`;
      
        if (this.settings.displayTypeIndex === 1) {
          // Markdown Table
          result += `| ${verseHeader} |\n| ---- |\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = arabic.data.ayahs[i].text;
            result += "| " + arText + " |\n";
          }
        } else if (this.settings.displayTypeIndex === 2) {
          // TIP Callout
          const calloutType = this.settings.calloutType || 'tip';
          result += `> [!${calloutType}]+ ${verseHeader}\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = arabic.data.ayahs[i].text;
            result += "> " + arText + "\n>\n";
          }
          result = result.trim();
        } else {
          // Text Only
          result += `${verseHeader}\n`;
          for (let i = 0; i < arabic.data.ayahs.length; i++) {
            const arText = arabic.data.ayahs[i].text;
            result += arText + "\n\n";
          }
          result = result.trim();
        }
      }
    }
    
    return result;
  }

  async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
  
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
  
        clearTimeout(timeoutId);
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request timed out');
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Failed to fetch after maximum retries');
  }

  async ensureOfflineData(): Promise<void> {
    const arabicEdition = "ar.quran-simple";
    const translationEdition = this.settings.includeTranslation 
      ? Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier
      : null;

    try {
      // Initialize storage if needed
      const storage = await this.loadData();
      if (!storage) {
        await this.saveData({ translations: {} });
      }

      // Check if we have offline data
      const arabicData = await this.loadOfflineData(arabicEdition);
      const translationData = translationEdition 
        ? await this.loadOfflineData(translationEdition)
        : null;

      if (!arabicData) {
        console.log('Downloading Arabic Quran data...');
        const arabicResponse = await this.fetchWithRetry(`https://api.alquran.cloud/v1/quran/${arabicEdition}`);
        const arabicJson = await arabicResponse.json();
        if (!arabicJson.data) {
          throw new Error('Invalid data received from API');
        }
        await this.saveOfflineData(arabicEdition, arabicJson);
      } else {
        this.offlineData[arabicEdition] = arabicData;
      }

      if (translationEdition && !translationData) {
        console.log(`Downloading translation data (${translationEdition})...`);
        const translationResponse = await this.fetchWithRetry(`https://api.alquran.cloud/v1/quran/${translationEdition}`);
        const translationJson = await translationResponse.json();
        if (!translationJson.data) {
          throw new Error('Invalid translation data received from API');
        }
        await this.saveOfflineData(translationEdition, translationJson);
      } else if (translationEdition && translationData) {
        this.offlineData[translationEdition] = translationData;
      }
    } catch (error) {
      console.error('Failed to ensure offline data:', error);
      throw error;
    }
  }

  async loadOfflineData(edition: string): Promise<QuranData | null> {
    try {
      const data = await this.loadData();
      if (!data || typeof data !== 'object') {
        await this.saveData({ translations: {} });
        return null;
      }
      const storage = data as OfflineStorage;
      return storage.translations?.[edition] || null;
    } catch (error) {
      console.error(`Failed to load offline data for ${edition}:`, error);
      return null;
    }
  }

  async saveOfflineData(edition: string, data: QuranData): Promise<void> {
    try {
      const storage = (await this.loadData() as OfflineStorage) || { translations: {} };
      storage.translations = storage.translations || {};
      storage.translations[edition] = data;
      await this.saveData(storage);
      this.offlineData[edition] = data;
    } catch (error) {
      console.error(`Failed to save offline data for ${edition}:`, error);
      throw error;
    }
  }

  async getOfflineVerse(surah: number, ayah: number, edition: string): Promise<any> {
    const data = this.offlineData[edition];
    if (!data) {
      throw new Error(`No offline data available for edition ${edition}`);
    }

    const surahData = data.data.surahs.find(s => s.number === surah);
    if (!surahData) {
      throw new Error(`Surah ${surah} not found in offline data`);
    }

    const ayahData = surahData.ayahs.find(a => a.numberInSurah === ayah);
    if (!ayahData) {
      throw new Error(`Ayah ${ayah} not found in Surah ${surah}`);
    }

    return {
      data: {
        number: surahData.number,
        name: surahData.name,
        englishName: surahData.englishName,
        ayahs: [ayahData]
      }
    };
  }

  async getOfflineVerseRange(surah: number, startAyah: number, endAyah: number, edition: string): Promise<any> {
    const data = this.offlineData[edition];
    if (!data) {
      throw new Error(`No offline data available for edition ${edition}`);
    }

    const surahData = data.data.surahs.find(s => s.number === surah);
    if (!surahData) {
      throw new Error(`Surah ${surah} not found in offline data`);
    }

    const ayahs = surahData.ayahs.filter(a => 
      a.numberInSurah >= startAyah && a.numberInSurah <= endAyah
    );

    if (ayahs.length === 0) {
      throw new Error(`No ayahs found in range ${startAyah}-${endAyah} for Surah ${surah}`);
    }

    return {
      data: {
        number: surahData.number,
        name: surahData.name,
        englishName: surahData.englishName,
        ayahs: ayahs
      }
    };
  }

  async toggleOfflineMode(value: boolean): Promise<void> {
    if (value) {
      new Notice('Downloading Quran data for offline use...');
      try {
        await this.ensureOfflineData();
        this.settings.offlineMode = true;
        await this.saveSettings();
        new Notice('Offline mode enabled successfully');
      } catch (error) {
        console.error('Failed to enable offline mode:', error);
        new Notice('Failed to enable offline mode. Please check your internet connection and try again.');
        // Reset the toggle
        this.settings.offlineMode = false;
        await this.saveSettings();
      }
    } else {
      this.settings.offlineMode = false;
      await this.saveSettings();
      new Notice('Offline mode disabled');
    }
  }
}  

class QuranLookupSettingTab extends PluginSettingTab {
  plugin: QuranLookupPlugin;

  constructor(app: App, plugin: QuranLookupPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display(): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Quran Lookup Settings" });

    new Setting(containerEl)
      .setName("Include Translation")
      .setDesc("If true, provides translation under the Arabic verse")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.includeTranslation)
          .onChange(async (includeTranslation) => {
            this.plugin.settings.includeTranslation = includeTranslation;
            await this.plugin.saveSettings();
            this.display();
          });
      });

    if (this.plugin.settings.includeTranslation) {
      new Setting(containerEl)
        .setName("Translator Language")
        .setDesc("Select the language for translation")
        .addDropdown((dropdown) => {
          const languages = Object.keys(Translations);
          languages.forEach((lang) => {
            dropdown.addOption(lang, lang.toUpperCase());
          });

          dropdown
            .setValue(this.plugin.settings.translatorLanguage)
            .onChange(async (value) => {
              this.plugin.settings.translatorLanguage = value;
              this.plugin.settings.translatorIndex = 0; // Reset to default translation when language changes
              await this.plugin.saveSettings();
              this.display();
            });
        });

      new Setting(containerEl)
        .setName("Translation Type")
        .setDesc("Which translation to use")
        .addDropdown((dropdown) => {
          const selectedLanguage = this.plugin.settings.translatorLanguage;
          const translations = Translations[selectedLanguage];
          translations.forEach((translation, index) => {
            dropdown.addOption(index.toString(), translation.name);
          });

          dropdown
            .setValue(this.plugin.settings.translatorIndex.toString())
            .onChange(async (value) => {
              this.plugin.settings.translatorIndex = +value;
              await this.plugin.saveSettings();

              // If in offline mode, ensure the new translation is downloaded
              if (this.plugin.settings.offlineMode && this.plugin.settings.includeTranslation) {
                const translationEdition = Translations[this.plugin.settings.translatorLanguage][+value].identifier;
                const existingData = await this.plugin.loadOfflineData(translationEdition);
                
                if (!existingData) {
                  new Notice('Downloading new translation for offline use...');
                  try {
                    const response = await this.plugin.fetchWithRetry(`https://api.alquran.cloud/v1/quran/${translationEdition}`);
                    const translationJson = await response.json();
                    if (!translationJson.data) {
                      throw new Error('Invalid translation data received from API');
                    }
                    await this.plugin.saveOfflineData(translationEdition, translationJson);
                    new Notice('New translation downloaded successfully');
                  } catch (error) {
                    console.error('Failed to download translation:', error);
                    new Notice('Failed to download translation. Please check your internet connection.');
                  }
                }
              }
              
              this.display();
            });
        });
    

    new Setting(containerEl)
      .setName("Remove Parenthesis Content")
      .setDesc("If true, removes the added translator content that would normally appear in parenthesis")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.removeParens)
          .onChange(async (removeParens) => {
            this.plugin.settings.removeParens = removeParens;
            await this.plugin.saveSettings();
            this.display();
          });
      });
    }

    /*new Setting(containerEl)
      .setName('Wrap Quran Arabic in Code Snippet')
      .setDesc('If true, wraps the Arabic verse in backticks to use code formatting')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.wrapQuranInCode)
          .onChange(async (value) => {
            this.plugin.settings.wrapQuranInCode = value;
            await this.plugin.saveSettings();
            this.display();
          });
      });*/

    new Setting(containerEl)
      .setName('Arabic Styling Options')
      .setDesc('Wraps the Arabic verse in HTML Span CSS, backticks, or None')
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(ArabicStyleOptions)
          .setValue(this.plugin.settings.arabicStyleIndex.toString())
          .onChange(async (value) => {
            this.plugin.settings.arabicStyleIndex = +value;
            if (this.plugin.settings.arabicStyleIndex == 2) {
              this.plugin.toggleCodeStyling(true);
            } else {
              this.plugin.toggleCodeStyling(false);
            }
            await this.plugin.saveSettings();
            this.display();
          });
      });

      // Font Family Selector
    new Setting(containerEl)
      .setName('Font Family')
      .setDesc('Select the font family for the Quran text.')
      .addDropdown(dropdown => {
          dropdown.addOptions({
              'me_quran': 'me_quran',
              'NooreHidayah': 'NooreHidayah',
              'Uthmani': 'Uthmani',
              'Amiri': 'Amiri',
              'Quran': 'Quran',
              'kfc_naskh': 'kfc_naskh',
              'scheherazade': 'scheherazade',
              'Kitab-Regular': 'Kitab-Regular',
              'pdms_saleem': 'pdms_saleem',
              'xb_zar-webfont': 'xb_zar-webfont',
          })
          .setValue(this.plugin.settings.fontFamily)
          .onChange(async (value) => {
              this.plugin.settings.fontFamily = value;
              await this.plugin.saveSettings();
              this.plugin.updateStyles();
          });
      });

    new Setting(containerEl)
      .setName('Font Size')
      .setDesc('Set the font size for the Quran text.')
      .then(setting => {
          const container = setting.controlEl.createDiv({ cls: 'font-size-container' });
  
          // Create the text field
          const textField = container.createEl('input', { type: 'text' });
          textField.value = this.plugin.settings.fontSize;
          textField.addEventListener('input', async (event) => {
              this.plugin.settings.fontSize = textField.value;
              await this.plugin.saveSettings();
              this.plugin.updateStyles();
          });
  
          // Create the plus button
          const plusButton = container.createEl('button', { text: '+' });
          plusButton.addEventListener('click', async () => {
              let fontSize = parseInt(this.plugin.settings.fontSize.replace('px', ''), 10);
              fontSize = isNaN(fontSize) ? 24 : fontSize; // Default to 24 if invalid
              fontSize += 2;
  
              this.plugin.settings.fontSize = `${fontSize}px`;
              await this.plugin.saveSettings();
              this.plugin.updateStyles();
  
              // Update the text field value
              textField.value = this.plugin.settings.fontSize;
          });
  
          // Create the minus button
          const minusButton = container.createEl('button', { text: '-' });
          minusButton.addEventListener('click', async () => {
              let fontSize = parseInt(this.plugin.settings.fontSize.replace('px', ''), 10);
              fontSize = isNaN(fontSize) ? 24 : fontSize; // Default to 24 if invalid
              fontSize = Math.max(2, fontSize - 2); // Prevent size going below 2px
  
              this.plugin.settings.fontSize = `${fontSize}px`;
              await this.plugin.saveSettings();
              this.plugin.updateStyles();
  
              // Update the text field value
              textField.value = this.plugin.settings.fontSize;
          });
      });
  

    new Setting(containerEl)
      .setName('Display Container Type')
      .setDesc('Which container to use for displaying the verses')
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(DisplayOptions)
          .setValue(this.plugin.settings.displayTypeIndex.toString())
          .onChange(async (value) => {
            this.plugin.settings.displayTypeIndex = +value;
            await this.plugin.saveSettings();
            this.display();
          });
      });

    // New Setting for Callout Type (conditionally visible)
    if (this.plugin.settings.displayTypeIndex === 2) { // Only if TIP Callout is chosen
      new Setting(containerEl)
        .setName('Callout Type')
        .setDesc('Select the callout type to use')
        .addDropdown((dropdown) => {
          const calloutTypes = {
            'note': 'Note',
            'abstract': 'Abstract',
            'info': 'Info',
            'todo': 'Todo',
            'tip': 'Tip',
            'success': 'Success',
            'question': 'Question',
            'warning': 'Warning',
            'failure': 'Failure',
            'danger': 'Danger',
            'bug': 'Bug',
            'example': 'Example',
            'quote': 'Quote'
          };
    
          dropdown
            .addOptions(calloutTypes)
            .setValue(this.plugin.settings.calloutType || 'tip')
            .onChange(async (value) => {
              this.plugin.settings.calloutType = value;
              await this.plugin.saveSettings();
              this.display();
            });
        });
    }
    
    // Offline Mode Setting
    new Setting(containerEl)
      .setName('Offline Mode')
      .setDesc('If true, uses offline data for Quran verses')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.offlineMode)
          .onChange(async (value) => {
            await this.plugin.toggleOfflineMode(value);
            this.display();
          });
      });

    // Search Arabic Edition Setting
    new Setting(containerEl)
      .setName('Search Arabic Edition')
      .setDesc('If true, searches the Arabic edition of the Quran')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.searchArabicEdition)
          .onChange(async (value) => {
            this.plugin.settings.searchArabicEdition = value;
            await this.plugin.saveSettings();
            this.display();
          });
      });

    // Show downloaded editions
    if (this.plugin.settings.offlineMode) {
      const downloadedEditionsEl = containerEl.createEl('div', { 
        cls: 'setting-item-description',
        attr: { style: 'margin-left: 40px; margin-bottom: 24px;' }
      });
      
      // Check both in-memory and stored data
      const inMemoryEditions = Object.keys(this.plugin.offlineData || {});
      const storedData = await this.plugin.loadData() as OfflineStorage || { translations: {} };
      const storedEditions = Object.keys(storedData.translations || {});
      
      // Combine and deduplicate editions
      const downloadedEditions = Array.from(new Set([...inMemoryEditions, ...storedEditions]));
      
      if (downloadedEditions.length > 0) {
        downloadedEditionsEl.createEl('div', { 
          text: 'Downloaded editions:',
          attr: { style: 'margin-bottom: 8px; opacity: 0.75;' }
        });
        
        for (const edition of downloadedEditions) {
          const editionName = edition === 'ar.quran-simple' ? 'Arabic (Simple)' : 
            Translations[edition.split('.')[0]]?.find(t => t.identifier === edition)?.name || edition;
          
          downloadedEditionsEl.createEl('div', { 
            text: `• ${editionName}`,
            attr: { style: 'margin-left: 12px; opacity: 0.75;' }
          });
        }
      } else {
        downloadedEditionsEl.createEl('div', { 
          text: 'No editions downloaded yet. They will be downloaded automatically when verses are looked up.',
          attr: { style: 'opacity: 0.75;' }
        });
      }
    }

    // Adding the preview section
    this.addPreview(containerEl);
  }

  async addPreview(containerEl: HTMLElement) {
    const previewContainer = containerEl.createEl('div', { cls: 'quran-lookup-preview' });
    previewContainer.createEl('h3', { text: 'Preview' });
  
    let previewContent = '';
    try {
      // Use the existing getAyah() function to get the first verse of the 2nd chapter (2:1)
      const verse = "2:2";
      previewContent = await this.plugin.getAyah(verse);
    } catch (error) {
      console.error("Error fetching preview verse:", error);
      previewContent = "Unable to load preview. Please check your settings.";
    }
  
    // Clear previous preview content if any
    previewContainer.empty();
  
    // Create the div to hold the Markdown preview with proper classes for styling
    const markdownContainer = previewContainer.createEl('div', {
      cls: 'markdown-preview-view',
      attr: {
        style: 'pointer-events: none;' // Disable any pointer events (read-only mode)
      }
    });
  
    // Add CSS classes matching Obsidian's styles for table, header, and cells
    markdownContainer.classList.add('cm-embed-block', 'cm-table-widget', 'markdown-rendered');
  
    // Render markdown content as a read-only preview
    MarkdownRenderer.renderMarkdown(previewContent, markdownContainer, '', this.plugin);
  
    // Add styles to the table for better visual match
    const style = document.createElement('style');
    style.textContent = `
      .quran-lookup-preview table {
        border-collapse: collapse;
        width: 100%;
      }
      .quran-lookup-preview th,
      .quran-lookup-preview td {
        border: 1px solid transparent; /* Set the border color to transparent */
        padding: 8px;
        text-align: left;
      }
      .quran-lookup-preview .table-wrapper {
        overflow-x: auto;
      }
      .quran-lookup-preview .table-editor {
        border: 1px solid transparent; /* Set default border color to transparent */
      }
    `;
    document.head.appendChild(style);
  }
}