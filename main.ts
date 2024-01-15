import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Fuse from 'fuse.js'
// Remember to rename these classes and interfaces!

const EnTranslations: Record<number, string> = {
	0: "en.ahmedali",
	1: "en.ahmedraza",
	2: "en.arberry",
	3: "en.asad",
	4: "en.daryabadi",
	5: "en.hilali",
	6: "en.pickthall",
	7: "en.qaribullah",
	8: "en.sahih",
	9: "en.sarwar",
	10: "en.yusufali",
	11: "en.maududi",
	12: "en.shakir",
	13: "en.transliteration",
	14: "en.itani",
	15: "custom"
};

interface QuranLookupPluginSettings {
	translatorIndex: number;
	removeParens: boolean;
	customTranslationIdentifier: string;
}

interface surahMeta {
	index: string;
	title: string;
	titleAr: string;
	count: string;
}

interface ArKeys { verseNum: number, arText: string }
interface EnKeys { verseNum: number, enText: string }

const DEFAULT_SETTINGS: QuranLookupPluginSettings = {
	translatorIndex: 5,
	removeParens: true,
	customTranslationIdentifier: "dv.divehi"
}

export default class QuranLookupPlugin extends Plugin {
	settings: QuranLookupPluginSettings;
	surahJson: surahMeta[];
	surahList: string[];
	fuse:any;

	async onload() {
		await this.loadSettings();

		// Setup the sura name list for fuzzy recall
		this.surahJson = require('./surahSlim.json');
		this.surahList = this.surahJson.map(m => m.title);
		const options = { keys: ["title"] };
		this.fuse = new Fuse(this.surahJson, options);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'ayah-list-command',
			name: 'Retrieve Ayaat',
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
						const surahNum = this.fuse.search(surah)[0].item;
						if (surahNum != undefined) {
							surahIndex = parseInt((surahNum as surahMeta).index);
						}
						rVerse = "" + surahIndex + ":" + verse.split(":")[1];
					}
					// Determine if Range vs Single Ayah
					if (rVerse.contains("-")) {
						verseText = await this.getAyahRange(rVerse);
					} else {
						verseText = await this.getAyah(rVerse) + '\n';
					}
					totalT += verseText + '\n';
				}
				editor.replaceSelection(totalT);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QuranLookupSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handleParens(txtVal:string, removeParens:boolean) {
		return (removeParens ? 
			txtVal
				.replace(/ *\([^)]*\)*/g, "") // remove ()
				.replace(/ \[(.+?)\]/g, " ") // remove []
				.replace(/\s+([.,!":])/g, "$1") // fix extra spaces near punctuations
			: txtVal)
	}

	resolveAPIurl(surah:string, edition:string, startAyah:number, ayahRange = 1): string {
		return "https://api.alquran.cloud/v1/surah/"+surah+"/" + edition + "?offset="+startAyah+"&limit="+ayahRange;
	}

	async fetchArabicAndTranslation(urlArabic:string, urlEnglish:string) {
		const [arabicResponse, englishResponse] = await Promise.all([
			fetch(urlArabic),
			fetch(urlEnglish)
		]);
		const arabic = await arabicResponse.json();
		const english = await englishResponse.json();
		return [arabic, english];
	}

	getTranslator() {
		/**
		 * Helper function to get the translator name
		 **/
		let translator;
		if (this.settings.translatorIndex == 15) { // 15 is the index for custom translation
			translator = this.settings.customTranslationIdentifier;
		} else {
			translator = EnTranslations[this.settings.translatorIndex];
		}
		return translator;
	}

	// TODO: Factor out redundant code in the next 2 functions
	// Get a range of Ayaat
	async getAyahRange(verse: string): Promise<string> {
		// parsing surah number, ayah range, start/end ayah
		const surah = verse.split(":")[0];
		const ayahRangeText = verse.split(":")[1];
		const startAyah = parseInt(ayahRangeText.split("-")[0])-1;
		const endAyah = parseInt(ayahRangeText.split("-")[1]);
		const ayahRange = endAyah - startAyah;

		// prepare fetch URLs
		const translator = this.getTranslator();
		const urlEnglis = this.resolveAPIurl(surah, translator, startAyah, ayahRange);
		const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", startAyah, ayahRange);

		// Fetch the content from the API
		const totalText = this.fetchArabicAndTranslation(urlArabic, urlEnglis).then(([arabic, englis]) => {
			// Extract values from the API responses
			const arKeys = arabic.data.ayahs.map((val: any): ArKeys => ({ verseNum: +val.numberInSurah, arText: val.text }));
			const enKeys = englis.data.ayahs.map((val: any): EnKeys => ({ verseNum: +val.numberInSurah, enText: this.handleParens(val.text, this.settings.removeParens)}));
			const surahName = englis.data.englishName;
			const surahNumber = englis.data.number;

			// Combine arabic & translations into an array of single object {verse_number, arabic, english}
			const groupings = arKeys.map((itm: ArKeys) => ({
				...enKeys.find((item: EnKeys) => (item.verseNum === itm.verseNum) && item),
				...itm
			}));

			// Format for Obsidian call-out markup display '>'
			const surahAndAyah = "> [!TIP]+ " + surahName + " (" + surahNumber + ":"+ ayahRangeText + ")" 
			let strAdder = surahAndAyah + '\n'
			
			// iterate verse by verse arabic then english
			for (const g of groupings) {
				strAdder += "> " + g.arText + '\n' + "> " + (g.enText as string) + "\n>\n";
			}
			return strAdder.slice(0, -2); // remove extra '>\n' at the end
		}).catch(error => {
			// TODO: Display a notification of error
			return "";
		});

		return totalText;
	}
	// Get a single Ayah
	async getAyah(verse: string): Promise<string> {
		// parsing out surah and ayah
		const surah = verse.split(":")[0];
		const ayah = parseInt(verse.split(":")[1])-1;

		// prepare fetch URLs
		const translator = this.getTranslator();
		const urlEnglis = this.resolveAPIurl(surah, translator, ayah);
		const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", ayah);

		// Fetch the content from the API
		const totalText = this.fetchArabicAndTranslation(urlArabic, urlEnglis).then(([arabic, englis]) => {
			// Extract values from the API responses
			const arText = arabic.data.ayahs[0].text;
			const enText = this.handleParens(englis.data.ayahs[0].text, this.settings.removeParens);
			const surahName = englis.data.englishName;
			const surahNumber = englis.data.number;
			const ayahNumber = englis.data.ayahs[0].numberInSurah;

			// Format and return for Obsidian call-out markeup display '>'
			const surahAndAyah = "> [!TIP]+ " + surahName + " (" + surahNumber + ":"+ ayahNumber + ")"; 
			return surahAndAyah + '\n' + '>' + arText + '\n' + '>' + enText;
		}).catch(error => {
			// TODO: Display a notification of error
			return "";
		});

		return totalText;
	}
}
class QuranLookupSettingTab extends PluginSettingTab {
	plugin: QuranLookupPlugin;

	constructor(app: App, plugin: QuranLookupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Quran Lookup Settings'});

		new Setting(containerEl)
			.setName('Translation Type')
			.setDesc('Which english translation to use')
			.addDropdown((dropdown) => { dropdown
				.addOptions(EnTranslations)
				.setValue(this.plugin.settings.translatorIndex.toString())
				.onChange(async (value) => {
					this.plugin.settings.translatorIndex = +value
					console.log(this.plugin.settings.translatorIndex);
					await this.plugin.saveSettings();
					this.display();
				});
			});

		// if custom translation is selected, add a text box to enter the url
		if (this.plugin.settings.translatorIndex == 15) {
			new Setting(containerEl)
				.setName('Custom Translation')
				.setDesc('Enter the Edition eg: dv.divehi ')
				.addText((text) => {
						text
							.setPlaceholder('dv.divehi')
							.setValue(this.plugin.settings.customTranslationIdentifier)
							.onChange(async (value) => {
								this.plugin.settings.customTranslationIdentifier = value;
								await this.plugin.saveSettings();
							});
					}
				);
		}

		new Setting(containerEl)
			.setName('Remove Parenthesis Content')
			.setDesc('If true, removes the added translator content that would normally appear in parenthesis')
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
}
