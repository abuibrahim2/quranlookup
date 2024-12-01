import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, MarkdownRenderer} from "obsidian";
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
}

interface surahMeta {
  index: string;
  title: string;
  titleAr: string;
  count: string;
}

interface ArKeys { verseNum: number; arText: string; }
interface EnKeys { verseNum: number; enText: string; }

const DEFAULT_SETTINGS: QuranLookupPluginSettings = {
  translatorLanguage: "en",
  translatorIndex: 0,
  displayTypeIndex: 2,
  arabicStyleIndex: 0,
  includeTranslation: true,
  removeParens: true,
  displayTable: false,
  displayCallOut: true,
  calloutType: 'tip', // Default callout type
  wrapQuranInCode: false,
  wrapQuranInSpan: false,
  fontFamily: 'me_quran',
  fontSize: '24px',
};

export default class QuranLookupPlugin extends Plugin {
  settings: QuranLookupPluginSettings;
  surahJson: surahMeta[];
  surahList: string[];
  fuse: any;

  async onload() {
    await this.loadSettings();

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
    
    const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", ayah);
    let result = "";
    
    if (this.settings.includeTranslation) {
      const translator = Translations[this.settings.translatorLanguage][this.settings.translatorIndex].identifier;
      const urlEnglish = this.resolveAPIurl(surah, translator, ayah);
      const [arabic, english] = await this.fetchArabicAndTranslation(urlArabic, urlEnglish);
    
      const arText = this.applyArabicStyle(arabic.data.ayahs[0].text, this.settings.arabicStyleIndex);
      //const arText = this.settings.wrapQuranInCode ? "`" + arabic.data.ayahs[0].text + "`" : arabic.data.ayahs[0].text;
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
      //const arText = this.settings.wrapQuranInCode ? "`" + arabic.data.ayahs[0].text + "`" : arabic.data.ayahs[0].text;
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
    
    return result;
  }
  
  async getAyahRange(verse: string): Promise<string> {
    const surah = verse.split(":")[0];
    const ayahRangeText = verse.split(":")[1];
    const startAyah = parseInt(ayahRangeText.split("-")[0]) - 1;
    const endAyah = parseInt(ayahRangeText.split("-")[1]);
    const ayahRange = endAyah - startAyah;
    
    const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", startAyah, ayahRange);
    let result = "";
    
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
          //const arText = this.settings.wrapQuranInCode ? "`" + arabic.data.ayahs[i].text + "`" : arabic.data.ayahs[i].text;
          const enText = this.handleParens(english.data.ayahs[i].text, this.settings.removeParens);
          result += `| ${enText} | ` + arText + " |\n";
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
    
    return result;
  }
}  

class QuranLookupSettingTab extends PluginSettingTab {
  plugin: QuranLookupPlugin;

  constructor(app: App, plugin: QuranLookupPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
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