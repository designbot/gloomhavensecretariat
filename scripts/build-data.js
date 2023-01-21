const fs = require('fs');
const path = require('path');
const input_dir = './data'
const output_dir = './src/assets/data'

const load_subfolder = function (edition_path, folder, default_value) {
  const dir = path.join(edition_path, folder);
  if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
    // console.debug("\nLoad subfolder: '" + dir + "'");
    const files = fs.readdirSync(dir).map((file) => path.join(dir, file)).filter((file_path) =>
      fs.lstatSync(file_path).isFile()
    );
    files.sort((value) => value.toLowerCase());
    let result = [];
    for (let path of files) {
      // console.debug("Read file: '" + path + "'");
      const f = fs.readFileSync(path, 'utf8');
      try {
        object = JSON.parse(f);
      } catch (e) {
        console.error("Error parsing: " + path, e);
      }
      result.push(object)
    }
    return result;
  }
  // console.warn("\nCould not load subfolder: '" + dir + "'");
  return default_value;
}

const load_file = function (edition_path, file, default_value) {
  const file_path = path.join(edition_path, file);
  if (fs.existsSync(file_path) && fs.lstatSync(file_path).isFile()) {
    // console.debug("\nLoad file: '" + file_path + "'");
    const f = fs.readFileSync(file_path, 'utf8');
    try {
      return JSON.parse(f);
    } catch (e) {
      console.error(file, e);
    }
  }
  // console.warn("\nCould not load file: '" + file_path + "'");
  return default_value;
}

const edition_dirs = fs.readdirSync(input_dir).map((file) => path.join(input_dir, file)).filter((file_path) =>
  fs.lstatSync(file_path).isDirectory()
);

for (edition_path of edition_dirs) {
  // console.debug("\n\n------Load edition: '" + edition_path + "'-------");
  let edition_data = load_file(edition_path, 'base.json', {});

  if (!edition_data['edition']) {
    edititon_data['edition'] = path.basename(edition_path);
  }

  if (!edition_data['conditions']) {
    edition_data['conditions'] = [];
  }

  if (!edition_data['extensions']) {
    edition_data['extensions'] = [];
  }

  edition_data['characters'] = load_subfolder(edition_path, 'character', []);
  edition_data['monsters'] = load_subfolder(edition_path, 'monster', []);
  edition_data['decks'] = load_subfolder(edition_path, 'deck', []);
  edition_data['scenarios'] = load_file(edition_path, 'scenarios.json', []);

  const scenariosFolder = path.join(edition_path, 'scenarios');
  if (fs.existsSync(scenariosFolder) && fs.lstatSync(scenariosFolder).isDirectory()) {
    for (let scenarioFile of fs.readdirSync(scenariosFolder)) {
      const inputFile = path.join(scenariosFolder, scenarioFile);
      if (fs.lstatSync(inputFile).isFile()) {
        const f = fs.readFileSync(inputFile, 'utf8');
        try {
          const scenario = JSON.parse(f);
          const existing = edition_data['scenarios'].find((scenarioData) => scenarioData.index == scenario.index && scenarioData.edition == scenario.edition && scenarioData.group == scenario.group);
          if (existing) {
            edition_data['scenarios'].splice(edition_data['scenarios'].indexOf(existing), 1, scenario);
            console.debug(scenario.edition + " Scenario #" + scenario.index + (scenario.group ? ' [' + scenario.group + ']' : '') + " replaced with new format.");
          } else {
            edition_data['scenarios'].push(scenario);
          }
        } catch (e) {
          console.error(inputFile, e);
        }
      }
    }
  }

  edition_data['scenarios'] = edition_data['scenarios'].sort((a, b) => {
    if (!a.group && b.group) {
      return -1;
    } else if (a.group && !b.group) {
      return 1;
    } else if (a.group && b.group && a.group != b.group) {
      return a.group.toLowerCase < b.group.toLowerCase() ? -1 : 1;
    }

    if (a.index.match(/(\d+)/) && b.index.match(/(\d+)/)) {
      return +(a.index.match(/(\d+)/)[0]) - +(b.index.match(/(\d+)/)[0])
    }

    return a.index.toLowerCase < b.index.toLowerCase() ? -1 : 1;
  })

  edition_data['sections'] = load_file(edition_path, 'sections.json', []);

  const sectionsFolder = path.join(edition_path, 'sections');
  if (fs.existsSync(sectionsFolder) && fs.lstatSync(sectionsFolder).isDirectory()) {
    for (let sectionFile of fs.readdirSync(sectionsFolder)) {
      const inputFile = path.join(sectionsFolder, sectionFile);
      if (fs.lstatSync(inputFile).isFile()) {
        const f = fs.readFileSync(inputFile, 'utf8');
        try {
          const section = JSON.parse(f);
          const existing = edition_data['sections'].find((sectionData) => sectionData.index == section.index && sectionData.edition == section.edition && sectionData.group == section.group);
          if (existing) {
            edition_data['sections'].splice(edition_data['sections'].indexOf(existing), 1, section);
            console.log(section.edition + " Section #" + section.index + (section.group ? ' [' + section.group + ']' : '') + " replaced with new format.");
          } else {
            edition_data['sections'].push(section);
          }
        } catch (e) {
          console.error(inputFile, e);
        }
      }
    }
  }

  edition_data['sections'] = edition_data['sections'].sort((a, b) => {
    if (!a.group && b.group) {
      return -1;
    } else if (a.group && !b.group) {
      return 1;
    } else if (a.group && b.group && a.group != b.group) {
      return a.group.toLowerCase < b.group.toLowerCase() ? -1 : 1;
    }

    if (a.index.match(/(\d+)/) && b.index.match(/(\d+)/)) {
      return +(a.index.match(/(\d+)/)[0]) - +(b.index.match(/(\d+)/)[0])
    }

    return a.index.toLowerCase < b.index.toLowerCase() ? -1 : 1;
  })

  edition_data['items'] = load_file(edition_path, 'items.json', []);
  edition_data['label'] = load_file(edition_path, 'label.json', {});
  edition_data['labelSpoiler'] = load_file(edition_path, 'label-spoiler.json', {});

  const output_path = path.join(output_dir, (edition_data['edition']) + '.json');

  // console.debug("\n> Write file: '" + output_path + "'");

  fs.writeFile(output_path, JSON.stringify(edition_data), 'utf8', (err) => {
    if (err) {
      console.error(err);
    }
  });
}