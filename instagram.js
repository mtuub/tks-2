const extractFrames = require("ffmpeg-extract-frames");
const InstagramPublisher = require("instagram-publisher");
const fs = require("fs/promises");
const { default: axios } = require("axios");

(async () => {
  const video_path = "artifact/video.mp4";
  const thumbnail_path = "artifact/thumbnail.jpg";

  // create thumbnail
  await extractFrames({
    input: video_path,
    output: thumbnail_path,
    offsets: [1000],
  });

  const affirmation = JSON.parse(await fs.readFile("public/affirmation.json"));

  const tags = await getInstagramTags(affirmation.affirmation);
  const reel_data = {
    video_path,
    thumbnail_path,
    caption: `${affirmation.affirmation}\n\n${tags}`,
  };
  const client = new InstagramPublisher({
    email: "psychicspoon108c@gmail.com",
    password: "12345",
    verbose: true,
  });

  await client.createReel(reel_data);
})();

async function getInstagramTags(text) {
  const response = await axios.get(
    `https://www.tagsfinder.com/en-us/ajax/?hashtag=${text}&limit=30&country=us&fs=off&fp=off&fg=off&custom=&type=live`
  );
  const regex = /<div id="hashtagy" class="text-muted">([\s\S]*?)<\/div>/g;
  const match = regex.exec(response.data);
  const hashtags = match[1].trim();
  return hashtags;
}
