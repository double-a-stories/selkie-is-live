const Templates = (window.Templates = window.T = {});
{
  const contentWarningInline = (...warnings) =>
    `<em>(<abbr title="Content Warning">CW</abbr>: ` +
    warnings
      .sort()
      .map((w) => `<span style="white-space:nowrap;">${w}.</span>`)
      .join(" ") +
    `)</em>`;

  const contentWarningParagraph = (...warnings) =>
    `<p class="content-warning"><b>Content warning</b>: ` +
    warnings
      .sort()
      .map((w) => `<span style="white-space:nowrap;">${w}.</span>`)
      .join(" ") +
    `</p>`;

  const infoMessage = (msg) =>
  `ⓘ <i>${msg}</i>`;
  const infoMessageBox = (msg) => 
  `<p class="content-warning">${infoMessage(msg)}</p>`;

  const restart = () => passage.render(`<a0 onclick="setup.restart()">Restart.</a>`);

  const rewind = () => passage.render(`<a0 onclick="setup.rewind()">Rewind.</a>`);

  // Templates for Hazel Epilogue

  const socialMediaComment = ([username, comment]) =>
    `<p><b>${username}</b> ${comment}</p>`;

  const hashtag = (tag) => `<span aria-label="hashtag">#</span>${tag}`;

  const likes = (likes) =>
    `<p class="social-card__likes"><span aria-label="${+likes | 0} likes">♡ ${
      +likes | 0
    }</span></p>`;

  const hoursAgo = (hours) =>
    `${+hours | 0}<span aria-label="hours">h</span> ago`;
  const minutesAgo = (mins) =>
    `${+mins | 0}<span aria-label="minutes">m</span> ago`;

  const socialMediaCard = ({
    name,
    username,
    time,
    body,
    hashtags,
    likeCount,
    comments,
  }) =>
    `<div class="social-card">
    <p>${name} <small>${username} – ${time}</small></p>
    <div class="social-card__body">${body}</div>
    <p><small>${(hashtags || []).map(hashtag).join(" ")}</small>
    ${likes(likeCount)}
    ${
      comments
        ? `<div.social-card__comments>${(comments || [])
            .map(socialMediaComment)
            .join("\n")}</div>`
        : ``
    }
</div>`;

const manyCommands = (passages, finalText) => {
  let output = '';

  const passagesToShow = passages.filter(p => !visited(p));
  for (const p of passagesToShow) {
    output += `* [[${p}]]\n`;
  }
  if (passagesToShow.length == 0 && finalText) {
    // output += `* [[${finalPassage}]]\n`;
    output += finalText
  }
  
  return passage.render(output);
}

const chatOverrides = {
  "disasterPiece": { color: "#888", ornament: "🐰" },
  "SelkieSlurps": { color: "#FF0000", ornament: "👑" },
  "riskySecret": { color: "#005682", ornament: "🫐" },
  "excelenciaRodentia": { color: "#848", ornament: "" },
  "bellicoseDinosaur": { color: "orange", ornament: "" },
  "awfulDenise": { color: "hsl(113, 100%, 20%)", ornament: "🐉" },
  "jamesStryker": { color: "#8B4", ornament: "🌱" },
  "carneusCalcified": { color: "#C22", ornament: "" },
  "ginnyTonic": { color: "#C22", ornament: "🍸" },
}

const getChatParams = (name) => {
  let params = chatOverrides[name] ?? {};

  const range = function(hash, min, max) {
      var diff = max - min;
      var x = ((hash % diff) + diff) % diff;
      return x + min;
  }

  let hash = 0;
  if (name.length === 0) return hash;
  for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
  }

  const h = range(hash, 20, 341);
  const s = range(hash, 100, 101);
  const l = range(hash, 30, 45);

  params.color ??= `hsl(${h}, ${s}%, ${l}%)`;

  params.ornament ??= "";

  return params;
}


const chat = (messages) => {
  let output = '<div class="chompchat">';
  
  for (const [name, message, isAction, emoji] of messages) {
    output += `<p class="chompchat_entry">`;
    output += chatEntry(name, message, isAction, emoji);
    output += `</p>`;
  }
  output += '</div>';
  return output;
}
  
const chatEntry = (name, message, isAction, emoji) => {
  const {color, ornament} = getChatParams(name);
  emoji = emoji ?? ornament;
  if (isAction) {
    return `<i>${emoji} <span class="chompchat_entry_name ${name.toLowerCase()}" style="color: ${color}">${name}</span> ${message}</i>`;
  } else {
    return `${emoji} <span class="chompchat_entry_name ${name.toLowerCase()}" style="color: ${color}">${name}</span>: ${message}`;
  }
}


  Object.assign(window.Templates, {
    CWI: contentWarningInline,
    contentWarningInline,
    CWP: contentWarningParagraph,
    contentWarningParagraph,
    infoMessage,
    infoMessageBox,
    restart,
    rewind,
    hoursAgo,
    hashtag,
    minutesAgo,
    socialMediaCard,
    manyCommands,
    chat
  });
}
