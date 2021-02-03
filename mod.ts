import { copy, Input, Select } from "./deps.ts";
import { List } from "https://deno.land/x/cliffy@v0.17.0/prompt/list.ts";
import { Secret } from "https://deno.land/x/cliffy@v0.17.0/prompt/secret.ts";
import { Checkbox, Input, prompt } from "./deps.ts";


// Officially-supported templates
const TEMPLATES = [
  "basic",
  "advanced",
];

console.log("WHAT IS THIS? DISCORDENO CLI, WHAT ELSE?");

const name = await Input.prompt({
  default: "my-discordeno-bot",
});

const template = await Input.prompt({
  default: "basic",
  suggestions: [
    ...TEMPLATES,
    "github:discordeno/discordeno-boilerplate",
  ],
// Additional prompts for official templates
if (TEMPLATES.includes(template)) {
  const type = await Select.prompt({
    message: "Enter the type for the project:",
    default: "function",
    options: [
      { name: "Function-based", value: "function" },
      { name: "Class-based", value: "class" },
    ],
  });
  // Resolve the template name to absolute and normalized path
  const templateDir = await Deno.realPath(template);
  // Create the target directory and copy template directory to the target directory
  await copy(`${templateDir}/${type}`, name);
  // Create and copy the "deps.ts" file to the target directory
  await copy(`${templateDir}/deps.ts`, `${name}/deps.ts`);
  // Create and copy the "config.ts" file to the target directory
  await copy(`${templateDir}/config.ts`, `${name}/config.ts`);
} else if (template.startsWith("github:")) {
  // Split the template name by ":" and use the second element as the repository (format: github:USER/REPO)
  const repository = template.split(":")[1];
  const url = `https://api.github.com/repos/${repository}/zipball`;
  const arrayBuffer = await (await fetch(url)).arrayBuffer();
  // Create a new temporary zip file in the default temporary files directory
  const tmpDirPath = await Deno.makeTempFile({
    suffix: ".zip",
  });
  // Open a file (temporary directory) and resolve to an instance of `Deno.File`
  const tmpDir = await Deno.open(tmpDirPath, {
    read: true,
    write: true,
  });
  // Write the content of the array buffer to the writer (temporary file)
  await Deno.writeAll(tmpDir, new Uint8Array(arrayBuffer));
  // Close the file resource by resource ID
  Deno.close(tmpDir.rid);

  // Append the current working directory to the target directory name
  const destPath = `${Deno.cwd()}/${name}`;
  // Spawn a subprocess which runs corresponding utility tools to unzip the retrieved file; "PowerShell Expand-Archive" for Windows and "unzip" for Unix-based operating systems
  const process = Deno.run({
    cmd: Deno.build.os === "windows"
      ? [
        "PowerShell",
        "Expand-Archive",
        "-Path",
        tmpDirPath,
        "-DestinationPath",
        destPath,
      ]
      : ["unzip", tmpDirPath, "-d", destPath],
    stdout: "piped",
    stderr: "piped",
  });
  // Await for the completion of the process
  await process.status();
}



const result = await prompt([{
  name: "name",
  message: "Enter the name of the bot:",
  default: "discordeno-bot",
  type: Input,
}, {
  name: "template",
  message: "Select a template for the bot:",
  default: "basic",
  type: Input,
  suggestions: ["basic", "advanced"],
  list: true,
}, {
  name: "type",
  message: "Enter the type for the project:",
  default: "function",
  type: Input,
  suggestions: ["class", "function"],
  list: true,
}, {
  name: "configuration",
  message: "Select the Setting to Configure",
  type: Checkbox,
  options: [
    "token",
    "prefix",
    "supportServerID",
    "channelIds",
    "roleIDs",
    "userIDs",
  ],
}, {
  name: "token",
  message: "Enter the Bot Token:",
  type: Secret,
  before: async ({ configuration }, next) => {
    if (configuration?.includes("token")) {
      await next(); // run token prompt
    } else {
      await next(true); // skip token prompt
    }
  },
}, {
  name: "prefix",
  message: "Enter the Prefix:",
  type: Input,
  default: "!",
  before: async ({ configuration }, next) => {
    if (configuration?.includes("prefix")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "supportServerID",
  message: "Enter the support-server ID:",
  type: Input,
  default: "",
  before: async ({ configuration }, next) => {
    if (configuration?.includes("supportServerID")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "missingTranslationID",
  message: "Enter the missing-translation ID:",
  type: Input,
  default: "",
  before: async ({ configuration }, next) => {
    if (configuration?.includes("channelIds")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "errorChannelID",
  message: "Enter the error-channel ID:",
  type: Input,
  default: "",
  before: async ({ configuration }, next) => {
    if (configuration?.includes("channelIds")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "patreonVIPRoleID",
  message: "Enter the patreon-VIP-role ID:",
  type: Input,
  default: "!",
  before: async ({ configuration }, next) => {
    if (configuration?.includes("roleIDs")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "botSupporters",
  message: "Enter the bot-Supporters ID:",
  type: List,
  before: async ({ configuration }, next) => {
    if (configuration?.includes("userIDs")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "botDevs",
  message: "Enter the bot-devs ID:",
  type: List,
  before: async ({ configuration }, next) => {
    if (configuration?.includes("userIDs")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}, {
  name: "botOwners",
  message: "Enter the bot-Owners ID:",
  type: List,
  before: async ({ configuration }, next) => {
    if (configuration?.includes("userIDs")) {
      await next(); // run prefix prompt
    } else {
      await next(true); // skip prefix prompt
    }
  },
}]);

console.log(result);
