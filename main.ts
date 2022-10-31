import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Fuse from 'fuse.js'
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

interface surahMeta {
	place: string;
	type: string;
	count: string;
	title: string;
	titleAr: string;
	index: string;
	pages: string;
	juz: any[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	surahJson: surahMeta[];
	surahList: string[];
	fuse:any;

	async onload() {
		await this.loadSettings();
		this.surahJson = require('./surah.json');
		this.surahList = this.surahJson.map(m => m.title);

		const options = {
			keys: [
			  "title"
			]
		  };
		this.fuse = new Fuse(this.surahJson, options);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Quran Lookup', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Quran Lookup Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'ayah-list-command',
			name: 'Get Ayaat list',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				var ayaat = editor.getSelection().split(" ").filter(Boolean);
				var totalT:string = "";
				var verseText:string = "";

				for (const verse of ayaat) {
					var rVerse = verse;
					
					// Deal with written surah names
					var surah = verse.split(":")[0];
					if (isNaN(parseInt(surah))) {
						var surahIndex:number = 0;
						var surahNum = this.fuse.search(surah)[0].item;
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
				};
				editor.replaceSelection(totalT);
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
 		this.addCommand({
			id: 'surah-number-command',
			name: 'Find Surah number',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				var surahName = editor.getSelection(); 
				var surahIndex:number = 0;
				var surahNum = this.fuse.search(surahName)[0].item;
				/*var surahNum = this.surahJson.find((obj) => {
					return obj.title === surahName;
				  });*/
				if (surahNum != undefined) {
					surahIndex = parseInt((surahNum as surahMeta).index);
				}
				editor.replaceSelection('' + surahIndex);
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

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

	async getAyahRange(verse: string): Promise<string> {
		let totalText:string;
		var surah = verse.split(":")[0];
		var ayahRangeText = verse.split(":")[1];
		var startAyah = parseInt(ayahRangeText.split("-")[0])-1;
		var endAyah = parseInt(ayahRangeText.split("-")[1]);
		var ayahRange = endAyah - startAyah;

		var urlEnglis = "https://api.alquran.cloud/v1/surah/"+surah+"/en.hilali?offset="+startAyah+"&limit="+ayahRange;
		var urlArabic = "https://api.alquran.cloud/v1/surah/"+surah+"/ar.quran-simple?offset="+startAyah+"&limit="+ayahRange;

		let arText:any[], enText:any[], surahNumber:string[], ayahNumber:string[], surahAndAyah:string;
		interface ArKeys { verseNum: number, arText: string };
		interface EnKeys { verseNum: number, enText: string };
		interface BothKeys { verseNum: number, arText: string, enText: string };

		let arKeys:ArKeys[], enKeys:EnKeys[];

		totalText = await fetch(urlArabic)
			.then(function(response) {
				return response.json();
			})
			.then(function(data) {
				 arText = data.data.ayahs;
				 arKeys = arText.map((val: any): ArKeys => ({ verseNum: parseInt(val.numberInSurah), arText: val.text }));
				 console.log(arKeys);
			})
			.then(()=>fetch(urlEnglis)
				.then(function(response) {
					return response.json();
				})
				.then(function(data) {
					console.log(data);
					enText = data.data.ayahs;
					enKeys = enText.map((val: any): EnKeys => ({ verseNum: parseInt(val.numberInSurah), enText: val.text.replace(/ *\([^)]*\) */g, " ") }));
					//enText = data.data.ayahs.map((a: { text: any; }) => a.text.replace(/ *\([^)]*\) */g, " "));
					//enText = data.data.ayahs[0].text.replace(/ *\([^)]*\) */g, " ");
					surah = data.data.englishName;
			
					surahNumber = data.data.number;
					//ayahNumber = data.data.ayahs[0].numberInSurah;
					surahAndAyah = "> [!TIP]+ " + surah + " (" + surahNumber + ":"+ ayahRangeText + ")" 
					
					console.log(enText);
					console.log(surahAndAyah);
					console.log( "success" );

					var strAdder = surahAndAyah + '\n'

					let groupings = arKeys.map(itm => ({
					  ...enKeys.find((item) => (item.verseNum === itm.verseNum) && item),
					  ...itm
					}));
					for (const g of groupings) {
						strAdder += "> " + g.arText + '\n' + "> " + (g.enText as string) + "\n>\n";
					}
					return strAdder.slice(0, -2);
				}
			)
		);

		return totalText;
	}

	async getAyah(verse: string): Promise<string> {
		var surah = verse.split(":")[0];
		var ayah = parseInt(verse.split(":")[1])-1;

		var urlEnglis = "https://api.alquran.cloud/v1/surah/"+surah+"/en.hilali?offset="+ayah+"&limit=1";
		var urlArabic = "https://api.alquran.cloud/v1/surah/"+surah+"/ar.quran-simple?offset="+ayah+"&limit=1";
		
		let arText:string, enText:string, surahNumber:string, ayahNumber:string, surahAndAyah:string;

		let totalText = await fetch(urlArabic)
			.then(function(response) {
				return response.json();
			})
			.then(function(data) {
				 arText = "> " + data.data.ayahs[0].text;
				 console.log(arText);
			})
			.then(()=>fetch(urlEnglis)
				.then(function(response) {
					return response.json();
				})
				.then(function(data) {
					console.log(data);
					enText = "> " + data.data.ayahs[0].text.replace(/ *\([^)]*\) */g, " ");
					surah = data.data.englishName;
			
					surahNumber = data.data.number;
					ayahNumber = data.data.ayahs[0].numberInSurah;
					surahAndAyah = "> [!TIP]+ " + surah + " (" + surahNumber + ":"+ ayahNumber + ")" 
					
					console.log(enText);
					console.log(enText.replace(/ *\([^)]*\) */g, " "));
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
