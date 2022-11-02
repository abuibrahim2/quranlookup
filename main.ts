import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Fuse from 'fuse.js'
import { start } from 'repl';
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
};

interface QuranLookupPluginSettings {
	translatorIndex: number;
	removeParens: boolean;
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
	removeParens: true
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

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
				.replace(/ *\[[^)]*\] */g, " ") // remove []
				.replace(/\s+([.,!":])/g, "$1") // fix extra spaces near punctuations
			: txtVal)
	}

	resolveAPIurl(surah:string, edition:string, startAyah:number, ayahRange = 1): string {
		return "https://api.alquran.cloud/v1/surah/"+surah+"/" + edition + "?offset="+startAyah+"&limit="+ayahRange;
	}

	// TODO: Refactor out redundant code
	// Get a range of Ayaat
	async getAyahRange(verse: string): Promise<string> {
		// parsing surah number, ayah range, start/end ayah
		let surah = verse.split(":")[0];
		const ayahRangeText = verse.split(":")[1];
		const startAyah = parseInt(ayahRangeText.split("-")[0])-1;
		const endAyah = parseInt(ayahRangeText.split("-")[1]);
		const ayahRange = endAyah - startAyah;

		const translator = EnTranslations[this.settings.translatorIndex];
		const urlEnglis = this.resolveAPIurl(surah, translator, startAyah, ayahRange);
		const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", startAyah, ayahRange);

		let surahNumber:string[], surahAndAyah:string;
		let arKeys:ArKeys[], enKeys:EnKeys[];
		const removeParens = this.settings.removeParens;

		const totalText = await fetch(urlArabic)
			.then( response => {
				return response.json();
			})
			.then( data => {
				const arText = data.data.ayahs;
				arKeys = arText.map((val: any): ArKeys => ({ verseNum: parseInt(val.numberInSurah), arText: val.text }));
				console.log(arKeys);
			})
			.then(()=>fetch(urlEnglis)
				.then( response => {
					return response.json();
				})
				.then( data => {
					console.log(data);
					const enText = data.data.ayahs;
					
					enKeys = enText.map((val: any): EnKeys => ({ 
						verseNum: parseInt(val.numberInSurah), 
						enText: this.handleParens(val.text, removeParens)}));

					surah = data.data.englishName;
					surahNumber = data.data.number;
					surahAndAyah = "> [!TIP]+ " + surah + " (" + surahNumber + ":"+ ayahRangeText + ")" 
					
					console.log(enText);
					console.log(surahAndAyah);
					console.log( "success" );

					let strAdder = surahAndAyah + '\n'

					const groupings = arKeys.map(itm => ({
						...enKeys.find((item) => (item.verseNum === itm.verseNum) && item),
						...itm
					}));
					for (const g of groupings) {
						strAdder += "> " + g.arText + '\n' + "> " + (g.enText as string) + "\n>\n";
					}
					// remove last excessive '>\n'
					return strAdder.slice(0, -2);
				}
			)
		);
		return totalText;
	}
	// Get a single Ayah
	async getAyah(verse: string): Promise<string> {
		let surah = verse.split(":")[0];
		const ayah = parseInt(verse.split(":")[1])-1;
		const translator = EnTranslations[this.settings.translatorIndex];

		const urlEnglis = this.resolveAPIurl(surah, translator, ayah);
		const urlArabic = this.resolveAPIurl(surah, "ar.quran-simple", ayah);
		
		let arText:string, enText:string, surahNumber:string, ayahNumber:string, surahAndAyah:string;
		const removeParens = this.settings.removeParens;

		const totalText = await fetch(urlArabic)
			.then( response => {
				return response.json();
			})
			.then( data => {
				arText = "> " + data.data.ayahs[0].text;
				console.log(arText);
			})
			.then( () => fetch(urlEnglis)
				.then( response => {
					return response.json();
				})
				.then( data => { 
					enText = "> " + this.handleParens(data.data.ayahs[0].text, removeParens);
					
					surah = data.data.englishName;
					surahNumber = data.data.number;
					ayahNumber = data.data.ayahs[0].numberInSurah;
					surahAndAyah = "> [!TIP]+ " + surah + " (" + surahNumber + ":"+ ayahNumber + ")" 
					
					console.log(enText);
					console.log(surah);
					console.log(ayahNumber);
					console.log( "success" );

					return surahAndAyah + '\n' + arText + '\n' + enText;
				}
			)
		);
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
