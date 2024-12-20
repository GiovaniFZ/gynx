const fs = require('fs');
const axios = require('axios');
const { getStrings } = require('../plugins/checklang.js');
const { isOnSpamWatch } = require('../plugins/lib-spamwatch/spamwatch.js');
const spamwatchMiddleware = require('../plugins/lib-spamwatch/Middleware.js')(isOnSpamWatch);

const scrobbler_url = 'http://ws.audioscrobbler.com/2.0/';
const api_key = process.env.lastKey;

const dbFile = 'src/props/lastfm.json';
let users = {};

function loadUsers() {
  if (!fs.existsSync(dbFile)) {
    console.log(`WARN: Last.fm user database ${dbFile} not found. Creating a new one.`);
    saveUsers();
    return;
  }

  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    users = JSON.parse(data);
  } catch (err) {
    console.log("WARN: Error loading the Last.fm user database:", err);
    users = {};
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error("WARN: Error saving Last.fm users:", err);
  }
}

module.exports = (bot) => {
  loadUsers();

  bot.command('setuser', (ctx) => {
    const userId = ctx.from.id;
    const Strings = getStrings(ctx.from.language_code);
    const lastUser = ctx.message.text.split(' ')[1];

    if (!lastUser) {
      return ctx.reply(Strings.lastFmNoUser, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id
      });
    };

    users[userId] = lastUser;
    saveUsers();

    const message = Strings.lastFmUserSet.replace('{lastUser}', lastUser);

    ctx.reply(message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id
    });
  });

  bot.command(['lt', 'lmu', 'last', 'lfm'], spamwatchMiddleware, async (ctx) => {
    const userId = ctx.from.id;
    const Strings = getStrings(ctx.from.language_code);
    const lastfmUser = users[userId];

    if (!lastfmUser) {
      return ctx.reply(Strings.lastFmNoSet, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id
      });
    };

    try {
      const response = await axios.get(scrobbler_url, {
        params: {
          method: 'user.getRecentTracks',
          user: lastfmUser,
          api_key,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': "kowalski-@KowalskiNodeBot-node-telegram-bot"
        }
      });

      const track = response.data.recenttracks.track[0];

      if (!track) {
        const noRecent = Strings.lastFmNoRecent.replace('{lastfmUser}', lastfmUser);
        return ctx.reply(noRecent, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_to_message_id: ctx.message.message_id
        });
      };

      const trackName = track.name;
      const artistName = track.artist['#text'];
      const nowPlaying = track['@attr'] && track['@attr'].nowplaying ? Strings.lastFmListeningNow : Strings.lastFmLastPlayed;


      const imageExtralarge = track.image.find(img => img.size === 'extralarge');
      const imageMega = track.image.find(img => img.size === 'mega');
      const imageUrl = (imageExtralarge && imageExtralarge['#text']) || (imageMega && imageMega['#text']) || '';

      const trackUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;
      const artistUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}`;
      const userUrl = `https://www.last.fm/user/${encodeURIComponent(lastfmUser)}`;

      let num_plays = '';
      try {
        const response_plays = await axios.get(scrobbler_url, {
          params: {
            method: 'track.getInfo',
            api_key,
            track: trackName,
            artist: artistName,
            username: lastfmUser,
            format: 'json',
          },
          headers: {
            'User-Agent': "kowalski-@KowalskiNodeBot-node-telegram-bot"
          }
        });
        num_plays = response_plays.data.track.userplaycount;

        if (!num_plays || num_plays === undefined) {
          num_plays = 0;
        };
      } catch (err) {
        console.log(err)
        const message = Strings.lastFmErr
          .replace("{lastfmUser}", `[${lastfmUser}](${userUrl})`)
          .replace("{err}", err);
        ctx.reply(message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_to_message_id: ctx.message.message_id
        });
      };

      const message = Strings.lastFmStatusFor
        .replace("{lastfmUser}", `[${lastfmUser}](${userUrl})`)
        .replace("{nowPlaying}", nowPlaying)
        .replace("{trackName}", `[${trackName}](${trackUrl})`)
        .replace("{artistName}", `[${artistName}](${artistUrl})`)
        .replace("{plays}", `${num_plays}`);

      if (imageUrl) {
        ctx.replyWithPhoto(imageUrl, {
          caption: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_to_message_id: ctx.message.message_id
        });
      } else {
        ctx.reply(message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_to_message_id: ctx.message.message_id
        });
      };
    } catch (err) {
      const userUrl = `https://www.last.fm/user/${encodeURIComponent(lastfmUser)}`;
      const message = Strings.lastFmErr
        .replace("{lastfmUser}", `[${lastfmUser}](${userUrl})`)
        .replace("{err}", err);
      ctx.reply(message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id
      });
    };
  });
};
