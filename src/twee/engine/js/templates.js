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

// STREAM CHAT (for Chompstr)

const streamChatOverrides = {
  "DisasterPiece": { color: "#AAA", ornament: "🐰" },
  "disasterPiece": { color: "#888", ornament: "🐰" },
  "Selkie the Hippo": { color: "#FF4444", ornament: "👑" },
  "SelkieSwallows": { color: "#FF0000", ornament: "👑" },
  "riskySecret": { color: "#005682", ornament: "🫐" },
  "excelenciaRodentia": { color: "#848", ornament: "" },
  "bellicoseDinosaur": { color: "orange", ornament: "" },
  "awfulDenise": { color: "hsl(113, 100%, 20%)", ornament: "🐉" },
  "jamesStryker": { color: "#8B4", ornament: "🌱" },
  "carneusCalcified": { color: "#C22", ornament: "" },
  "ginnyTonic": { color: "#C22", ornament: "🍸" },
}

const streamChatParams = (name) => {
  let params = streamChatOverrides[name] ?? {};

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


const streamChat = (messages) => {
  let output = '<div class="chompchat">';
  
  for (const [name, message, isAction, emoji] of messages.filter(m => m)) {
    output += `<p class="chompchat_entry">`;
    output += streamChatEntry(name, message, isAction, emoji);
    output += `</p>`;
  }
  output += '</div>';
  return output;
}
  
const streamChatEntry = (name, message, isAction, emoji) => {
  const {color, ornament} = streamChatParams(name);
  emoji = emoji ?? ornament;

  if (isAction) {
    return `<i>${emoji} <span class="chompchat_entry_name ${name.toLowerCase()}" style="color: ${color}">${name}</span> ${message}</i>`;
  } else {
    return `${emoji} <span class="chompchat_entry_name ${name.toLowerCase()}" style="color: ${color}">${name}</span>: ${message}`;
  }
}

const asterSays = (passage, innerHTML, chatMessage, isAction, emoji) => {
  const a = document.createElement("a");
  a.setAttribute("href", "javascript:void(0)");
  a.setAttribute("data-passage", passage);
  a.innerHTML = innerHTML;
  const message = ["disasterPiece", chatMessage, isAction, emoji];

  a.setAttribute("onclick", `story.state.asterSays = ${JSON.stringify(message)}`);
  return a.outerHTML;
}

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const donation = (name, amount, message, emoji) => {
  const {color, ornament} = streamChatParams(name);
  
  return `<p class="donation">${ornament} <span style="color: ${color}">${name}</span> sent ${moneyFormatter.format(amount)} for <b>"${message}"</b></p>`
}

const groupAdjacent = (arr, keyFunction) => {
  const result = [];
  let current = [];
  let previousKey = keyFunction(arr[0]);

  for (const a of arr) {
    let currentKey = keyFunction(a);
    if (currentKey != previousKey) {
      result.push(current);
      current = [];
    }
    current.push(a);
    previousKey = currentKey;
  }
  if (current.length > 0) {
    result.push(current);
  }

  return result;
}

const coalesceConsecutiveMessages = (arr) => {
  const result = [];
  const grouped = groupAdjacent(arr, a => a[0]);
  for (const g of grouped) {
    const name = g[0][0];
    result.push([name, g.map(a => a[1]).join('<br>')]);
  }
  return result;
}


const discordChat = (messages) => {
  let output = '<div class="discordchat">';

  // handle repeated messages from same usr
  const coalesced = coalesceConsecutiveMessages(messages);
  
  for (const [name, message] of coalesced) {
    output += discordChatEntry(name, message);
  }
  output += '</div>';
  return output;
}
  
const discordChatEntry = (name, message) => {
  const {color } = streamChatParams(name);

  message = message.replaceAll(/:([a-z_]+):/g, (_, a) => 
    `<img class="discordchat_emote" src="assets/img/discord/emote/${a}.png" alt="${a}">`
  )

  return `<div class="discordchat_entry">
    <img class="discordchat_img" src="assets/img/discord/${name}.png" />
    <div class="discordchat_message">
      <span class="discordchat_entry_name ${name.toLowerCase()}" 
      style="color: ${color}">${name}</span><br>
      ${message}
    </div>
  </div>`;
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
    streamChat,
    discordChat,
    asterSays,
    donation
  });
}
