const { upload, comment } = require("youtube-videos-uploader");
const fs = require("fs/promises");
const { default: axios } = require("axios");
const glob = require("glob");
require("dotenv").config();

const email = process.env.YT_EMAIL;
(async () => {
  const credentials = {
    email,
    pass: "process.env.YT_PASSWORD",
  };

  await getYTCookies();

  const affirmation = JSON.parse(await fs.readFile("public/affirmation.json"));

  const aff_link = "https://psychicspoon.com/manifest";

  const tags = await retrieveVideoTags(affirmation.affirmation);

  const data = {
    path: "artifact/video.mp4",
    title: `${affirmation.affirmation} #manifestation #affirmation`,
    description: `Tags: (${tags.join(", ")})`,
    isNotForKid: true,
  };

  // Upload video
  glob(
    // "node_modules/puppeteer/.local-chromium/**/chrome-win/chrome.exe",
    "node_modules/puppeteer/.local-chromium/**/chrome-linux/chrome",
    function (er, file_path) {
      upload(credentials, [data], {
        executablePath: file_path[0],
      }).then((urls) => {
        console.log(`Uploaded video`);
        // comment after 1 minute
        setTimeout(() => {
          const comments = [
            {
              link: urls[0],
              comment: `Manifest Love & Money Instantly: ${aff_link}`,
              pin: true,
            },
          ];

          comment(credentials, [...comments]).then((_) =>
            console.log(`Commented on video`)
          );
        }, 60000);
      });
    }
  );
})();

async function retrieveVideoTags(title) {
  try {
    const headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      referer: "https://rapidtags.io/generator/",
    };

    const res = await axios.get(
      `https://rapidtags.io/api/generator?type=YouTube&query=${title}`,
      { headers }
    );
    return res.data["tags"];
  } catch (error) {
    return [];
  }
}

async function getYTCookies() {
  const cookies = (await axios.get(`${process.env.API_URL}:3002/cookies`)).data
    .data;
  //   retrieve yt cookies from api
  try {
    await fs.mkdir(`yt-auth`, { recursive: true });
  } catch (error) {}

  const cookiesName = `cookies-${email
    .replace("@", "-")
    .replace(".", "_")}.json`;
  await fs.writeFile(`yt-auth/${cookiesName}`, JSON.stringify(cookies));
}
