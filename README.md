## بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيْ
# Obsidian Quran Lookup Plugin

This is a simple utility/text replacement plugin for Obsidian that fills in the quran ayaat (verses) based on a surah:verse(s) shorthand. This uses the 'current editor selection command' capability to replace the selected text with the lookup result.

It looks up based on `Surah-Number:Ayah-Number` or `Surah-Name:Ayah-Number` syntax. For the Surah-Name lookup it uses Fuse.js to do a "fuzzy search" since it's an english transliteration. It replaces that syntax with an Obsidian call-out showing verse+ayah name, arabic, and english.

## Examples:

- Single Ayah lookup
  - `112:1`

- Multiple Ayaat range
  - `56:24-26`

- Fuzzy search surah title
  - `Zumar:3-5`
  - `Zomar:3`
  - `Zumaar:6`

- Chained together in single line (separated by spaces)
  - `Zumar:12 6:10-11 7:3-4 Maryam:12 1:3`

## Settings
This plugin has some small customizations: in `Community Plugins > Installed Plugins > QuranLookup (Options)`

![obsidian quran lookup settings](https://raw.githubusercontent.com/milkperson/quranlookup/master/docs/settings.png?token=GHSAT0AAAAAAB2SMVRXRWD3AM6U4XXNODREY3AK5UQ)

### Translation Types
- You can choose from a variety of english translation types based on the [API language selections](http://api.alquran.cloud/v1/edition/language/en):
  - en.ahmedali : Ahmed Ali
  - en.ahmedraza : Ahmed Raza Khan
  - en.arberry : A. J. Arberry
  - en.asad : Muhammad Asad
  - en.daryabadi : Abdul Majid Daryabadi
  - en.hilali : Muhammad Taqi-ud-Din al-Hilali and Muhammad Muhsin Khan
  - en.pickthall : Mohammed Marmaduke William Pickthall
  - en.qaribullah : Hasan al-Fatih Qaribullah and Ahmad Darwish
  - en.sahih : Saheeh International
  - en.sarwar : Muhammad Sarwar
  - en.yusufali : Abdullah Yusuf Ali
  - en.maududi : Abul Ala Maududi
  - en.shakir : Mohammad Habib Shakir
  - en.transliteration : English Transliteration
  - en.itani : Clear Qur'an by Talal Itani

### Remove Parenthesis Contents
- Many translations add additional commentary and explanation in parenthesis and brackets to make the english more readable or flow or to better explain a complex word. If enabled, this feature removes that additional text so that the translation succinct.

## The Quran API and Source(s)
The Quran verses are currently powered by
- [alquran.cloud](https://alquran.cloud/api) : An opensource Quran API made by the [Islamic Network](https://islamic.network/) ([github](https://github.com/islamic-network)) and respective [contributors](https://alquran.cloud/contributors).
## Fuzzy Search
The Fuzzy search feature is made possible using
- [Fuze.js](https://fusejs.io/) : A powerful lightweight fuzzy-search library, with zero dependencies ([github](https://github.com/krisk/Fuse))
## How to use
- Install & enable the plugin (see section below)
- Select the ayah reference string in your note
- Use the command palette or a hotkey to apply the replace command

## How it works
The lookup uses api.alquran.cloud API to lookup the verses by surah and verse number
For the fuzzy name search, it uses a simple index file surahSlim.json and fuse.js to find the closest sura name and retrieve it's index number.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/quranlookup/`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
