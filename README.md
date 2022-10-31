# Obsidian Quran Lookup Plugin

This is a simple utility/text replacement plugin for Obsidian that fills in the quran ayaat (verses) based on a surah:verse(s) shorthand. This uses the 'current editor selection command' capability to replace the selected text with the lookup result.

It looks up based on `Surah-Number:Ayah-Number` or `Surah-Name:Ayah-Number` syntax. For the Surah-Name lookup it uses Fuse.js to do a "fuzzy search" since it's an english transliteration. It replaces that syntax with an Obsidian call-out showing verse+ayah name, arabic, and english.

## Examples:

- Single Ayah lookup
  - `68:7`

- Multiple Ayaat range
  - `68:3-10`

- Fuzzy search surah title
  - `Zumar:4-5`
  - `Zmr:3`
  - `Zumaar:6`

- Chained together in single line
  - `Zumar:12 6:10-11 7:3-4 Maryam:12 1:3`

## How to use
- Install & enable the plugin
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
