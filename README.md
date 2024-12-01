## بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيْم
# Obsidian Quran Lookup Plugin
[![CodeQL](https://github.com/abuibrahim2/quranlookup/actions/workflows/codeql.yml/badge.svg)](https://github.com/abuibrahim2/quranlookup/actions/workflows/codeql.yml)


This is a simple utility/text replacement plugin for Obsidian that fills in the quran ayaat (verses) based on a surah:verse(s) shorthand. This uses the 'current editor selection command' capability to replace the selected text with the lookup result.

It looks up based on `Surah-Number:Ayah-Number` or `Surah-Name:Ayah-Number` syntax. For the Surah-Name lookup it uses Fuse.js to do a "fuzzy search" since it's an english transliteration. It replaces that syntax with an Obsidian call-out showing verse+ayah name, arabic, and english.

## How to Use:
1. Open a Note in Obsidian.md
2. In the note, type the `surah:verse` as shown in the examples below
3. Select the recently typed text 
4. In the command panel (cmd+P or ctrl+P) select 'Retrieve Ayat' command
5. Alternatively, you can assign a hotkey to the command (like cmd+shift+k)

## Examples
- Single Ayah lookup
  - `112:1`

![obsidian quran lookup single](/docs/quran-lookup-single.gif?raw=true)

- Multiple Ayaat range
  - `56:24-26`

![obsidian quran lookup range](/docs/quran-lookup-range.gif?raw=true)

- Fuzzy search surah title
  - `Zumar:3-5`
  - `Zomar:3`
  - `Zumaar:6`

- Chained together in single line (separated by spaces)
  - `Zumar:12 6:10-11 7:3-4 Maryam:12 1:3`

![obsidian quran lookup range](/docs/quran-lookup-chained.gif?raw=true)

### New in Version 0.2
A few new features have been added in v0.2. 
1. The ability to hide or show the translation, useful for those who just want the arabic to be displayed
2. All language and translator selection, now users can get any language and translation API provides. This removes the previous custom translator option as that exists now in the present options
3. Arabic Styling Options with CSS so that the Arabic text can display using more appropriate font-family and font-size. This adds the choice for a few nicer looking arabic fonts, as well as font-size selection options
4. Display Container types, text-only, markdown table, and additional Obsidian Callout customization
5. Live Preview in the Settings screen so you can see what a setting change would look like in Obsidian

## Settings
This plugin has some customizations: in `Community Plugins > Installed Plugins > QuranLookup (Options)`

![obsidian quran lookup settings](/docs/settings.png?raw=true)

### Translator languages and Translation Types
- You can choose from a variety of languages, and translators based on the [API language selections](http://api.alquran.cloud/v1/edition/language/en):

| Code | Language  | Translators                                      |
|------|-----------|--------------------------------------------------|
| EN   | ENGLISH   | Ahmed Ali, Ahmed Raza Khan, Arberry, Asad, Daryabadi, Hilali & Khan, Pickthall, Qaribullah & Darwish, Saheeh International, Sarwar, Yusuf Ali, Maududi, Shakir, Transliteration, Ibrahim Walk, Clear Qur'an - Talal Itani, Mubarakpuri, Qarai, Wahiduddin Khan |
| FR   | FRENCH    | Hamidullah                                       |
| DE   | GERMAN    | Abu Rida, Bubenheim & Elyas                      |
| AZ   | AZERBAIJANI | Məmmədəliyev & Bünyadov, Musayev               |
| BN   | BENGALI   | Muhiuddin Khan                                   |
| CS   | CZECH     | Hrbek, Nykl                                      |
| DV   | DHIVEHI   | Office of the President of Maldives              |
| FA   | FARSI     | Ayati, Fooladvand, Elahi Ghomshei                |
| HA   | HAUSA     | Gumi                                             |
| HI   | HINDI     | Suhel Farooq Khan and Saifur Rahman Nadwi        |
| ID   | INDONESIAN| Bahasa Indonesia                                 |
| IT   | ITALIAN   | Piccardo                                         |
| JA   | JAPANESE  | Japanese                                         |
| KO   | KOREAN    | Korean                                           |
| KU   | KURDISH   | Burhan Muhammad-Amin                             |
| ML   | MALAYALAM | Cheriyamundam Abdul Hameed and Kunhi Mohammed Parappoor |
| NL   | DUTCH     | Keyzer                                           |
| NO   | NORWEGIAN | Einar Berg                                       |
| PL   | POLISH    | Bielawskiego                                     |
| PT   | PORTUGUESE| El-Hayek                                         |
| RO   | ROMANIAN  | Grigore                                          |
| RU   | RUSSIAN   | Kuliev, Osmanov, Porokhova                       |
| SD   | SINDHI    | Amroti                                           |
| SO   | SOMALI    | Abduh                                            |
| SQ   | ALBANIAN  | Sherif Ahmeti, Feti Mehdiu, Efendi Nahi          |
| SV   | SWEDISH   | Bernström                                        |
| SW   | SWAHILI   | Al-Barwani                                       |
| TA   | TAMIL     | Jan Turst Foundation                             |
| TH   | THAI      | King Fahad Quran Complex                         |
| TR   | TURKISH   | Suleyman Ates, Ali Bulaç, Diyanet İşleri         |
| TT   | TATAR     | Yakub Ibn Nugman                                 |
| UG   | UYGHUR    | Muhammad Saleh                                   |
| UR   | URDU      | Ahmed Ali, Fateh Muhammad Jalandhry, Syed Zeeshan Haider Jawadi |
| UZ   | UZBEK     | Muhammad Sodik Muhammad Yusuf                   |

### Remove Parenthesis Contents
#### ${🛑\ {\color{red}Experimental}}\ 🛑\$
- Some translations provide additional commentary and explanation in parenthesis ( ) and brackets \[ \] to give context and allow the translator the opportunity to explain a nuanced, complex term. While this is useful at times, it makes the text very verbose and breaks the flow for the reader. With the toggle enabled, this plugin removes that additional text so that the translation is succinct like the arabic. 
- See example below:

![obsidian quran remove paren](/docs/quran-lookup-remove-paren.png?raw=true)

- NOTE: This is experimental and while I have tried to test it, it may not work 100% all the time so extra eyes QA'ing it are appreciated!

### Arabic Styling Options
#### Wrap Quran Arabic in HTML Span, Code Snippet, None
- I wanted to use customized fonts and custom CSS for the Arabic script because the default isn't as appealing and I like the Arabic font larger to be easier to read. 

My options were to embed these settings in a CSS file and either:

A. Wrap the Arabic text in an explicit class assignment like 
```
arText = `<span class="quran-arabic">${arText}</span>`
```
This applies the styling however puts html code in with the text which gets in the way when selecting orediting or copying

B. Override/Repurpose markdown functionality to apply the class, for example, the backtick "`" for code, like
```
arText = "`" + arText + "`"; // Wrap in backticks if the setting is enabled
```
This applies the styling with minimal impact to selecting or copying the text, however it does override the `code` styling so any `code` markdown you have will now have this same CSS styling applied to it. Not an issue if you don't typically use backticks `code`.

C. None
No application of custom tags or styling in the Arabic script (you like the default font or you are applying the font you prefer in the way you like)

### Display Container Type
The previous version only had one display option which was the (usually green colored) Obsidian `TIP` Callout. For info on Obsidian callouts you can refer to this documentation.

I've added more customization to the Obsidian Callout display type as well as two more display options: **Text Only**, and **Markdown Table**

#### Text Only
Self explanatory, this would only output the text of the translation and verse without additional markdown wrappigns

#### Markdown Table
This pastes the verses in a [Markdown Table](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Tables) view with the arabic verse on the right column and the translation on the left. 

#### Obsidian Callout
Encapsulates the verse in an obsidian callout like previously except this time an additional setting will appear that will allow you to choose which Callout type to apply any of the various **Callout Types** that obsidian supports. For more information see: [Obsidian Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts)

### Live Preview
Now there is a _Live Preview_ shown at the bottom of the Settings Page so you can see how your selections will look when applied on your page.

## Attributions
### The Quran API and Source(s)
The Quran verses are retrieved from
- [alquran.cloud](https://alquran.cloud/api) : An opensource Quran API made by the [Islamic Network](https://islamic.network/) ([github](https://github.com/islamic-network)) and respective [contributors](https://alquran.cloud/contributors).
### Fuzzy Search
The Fuzzy search feature is made possible using
- [Fuze.js](https://fusejs.io/) : A powerful lightweight fuzzy-search library, with zero dependencies ([github](https://github.com/krisk/Fuse))
## How to use
- Install & enable the plugin (see [section below](#manually-installing-the-plugin) )
- Select the ayah reference string in your note
- Use the command palette or a hotkey to apply the replace command

## How it works
The lookup uses api.alquran.cloud API to lookup the verses by surah and verse number
For the fuzzy name search, it uses a simple index file surahSlim.json and fuse.js to find the closest sura name and retrieve it's index number.

## Future Feature Ideas (logged in [project Issues](https://github.com/abuibrahim2/quranlookup/issues))
- [ ] Add error notification for 'surah not found' or 'ayah index out of range' (currently doesn't do anything if invalid string is attempted to be upon)
- [ ] Show the translator name in the settings
- [ ] Toggle Display of verses callout sections: e.g. show Arabic Only, Translation Only
- [ ] Right-To-Left alignment for Arabic text
- [ ] Support display of alternate arabic fonts
- [ ] Add support for translations in other languages 
- [ ] Allow for customization of the Call-out style in the settings (e.g. abstract, info, note, success, question, warning, failure, danger, bug, example, quote, custom, none)
- [ ] Give option to show dialog with preview and style options each time (like the Admonition plugins 'Insert Admonition' dialog)
- [ ] Add option to toggle to use 'Admonition' style syntax instead of obsidian call-out style
- [ ] Provide external links to ayah in websites like quran.com
- [ ] Add "Offline Mode" option which downlaods and retrieves verses and translations from the locally saved vault rather than calling API
- [ ] Add command to search for an ayah using search API (displaying results in a dialog)
- [ ] Add audio playback capabilities to playback the verse
- Other ideas?... feel free [to suggest](https://github.com/abuibrahim2/quranlookup/issues)!
## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/quranlookup/`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.

## How to Contribute
I'm one person who just quickly put this together because I wanted this capability in my notes. This is still in need of much refactoring and improvement.
- [For Issues or Feature Requests](https://github.com/abuibrahim2/quranlookup/issues)
- [For making Contributions](./CONTRIBUTING.md)

## Similar Projects
- [Obsidian Quran Vault](https://github.com/AmmarCodes/obsidian-quran-vault)
- [Obsidian Bible Reference](https://github.com/tim-hub/obsidian-bible-reference) - Notable mention, I styled this readme doc after theirs.
