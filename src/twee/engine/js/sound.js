/**
 * This module provides a quick and dirty API for controlling music.
 * In hindsight this was kind of stupid.
 */
// Mute and unmute on load.
$(document).on("sm.passage.shown", () => {
  if (!window.StoryFlags.isSet("enableSound")) {
    Howler.mute(true);
  } else {
    Howler.mute(false);
  }
});

/*
Simple sound controller using howler.js
*/
class SoundInstance {
  /**
   *
   * @param {Howl} howlObject
   */
  constructor(howlObject) {
    this.howl = howlObject;
    this.playing = false;
  }
  fadeIn(duration = 1000) {
    // If sound isn't playing yet, then fade in.
    if (this.playing) {
      return;
    }
    if (this.id == undefined) {
      this.howl.load();
      this.id = this.howl.play();
    } else {
      this.howl.play(this.id);
    }
    this.howl.fade(0.0, this.howl.volume(), duration, this.id);
    this.playing = true;
    this.howl.off("fade", this.id);
  }
  fadeOut(duration = 1000) {
    if (this.howl.playing(this.id)) {
      this.howl.fade(this.howl.volume(), 0.0, duration, this.id);
      this.playing = false;
      this.howl.once("fade", () => {
        this.playing = false;
        this.howl.stop(this.id);
      }, this.id);
    }
  }


}

const SOUNDS_PATH = "assets/sound";
const MUSIC_PATH = "assets/music";

/**
 * On each passage load, checks if the predicate returns true, and the
 * either fade in or out this sound.
 * 
 * @param {Howl} howlObject The sound to use.
 * @param  {...string} tags
 * @returns {number}
 */
const ambienceOnPassageTag = (howlObject, ...tags) => {
  const soundInstance = new SoundInstance(howlObject);
  $(window).on("sm.passage.shown", (_, { passage }) => {
    if (tags.some(t => passage.tags.includes(t))) {
      soundInstance.fadeIn();
    } else {
      soundInstance.fadeOut();
    }
  })
  return soundInstance.id;
}

const howlDefaults = {
  loop: true,
  volume: 0.1,
}

const AmbientSounds = window.AmbientSounds = {
  // Chirping birds from freesound
  // Used in the "morning after" passages
  birds: new Howl({
    ...howlDefaults,
    src: [`${SOUNDS_PATH}/birds.mp3`],
    volume: 0.05,
    loop: true
  }),
  // Stomach sounds from freesound
  // Crickets and suburban outdoor noises from freesound
  gurgle: new Howl({
    ...howlDefaults,
    src: [`${SOUNDS_PATH}/gurgle.mp3`],
    volume: 1.0,
    loop: true
  }),
  crickets: new Howl({
    ...howlDefaults,
    src: [`${SOUNDS_PATH}/crickets.mp3`],
    volume: 0.1,
    loop: true
  }),
  stream1: new Howl({
    ...howlDefaults,
    src: [`${MUSIC_PATH}/holizna/good-reason-to-stay-inside/creature-comforts.mp3`],
    volume: 0.2,
    loop: true
  }),
};

const SoundEffects = window.SoundEffects = {
  achievementGet: new Howl({
    src: [`${SOUNDS_PATH}/xbox-360-achievement-sound.mp3`],
    volume: 0.6,
  })
};

// ambienceOnPassageTag(AmbientSounds.title, "menu");
ambienceOnPassageTag(AmbientSounds.birds, "morning");
ambienceOnPassageTag(AmbientSounds.gurgle, "vore");
ambienceOnPassageTag(AmbientSounds.crickets, "outside");
// ambienceOnPassageTag(AmbientSounds.stream, "stream");

story.state.nowPlaying = null;
let nowPlaying = null;
const cdChanger = {};

setup.refreshMusic = () => {
  if (story.state.nowPlaying === nowPlaying) {
    return; // already playing. noop
  }
  for (const s of Object.values(cdChanger)) {
    s.fadeOut();
  }
  const name = story.state.nowPlaying;
  nowPlaying = story.state.nowPlaying;
  if (name != undefined && AmbientSounds[name] != undefined) {
    cdChanger[name] ??= new SoundInstance(AmbientSounds[name]);
    let soundInstance = cdChanger[name];
    soundInstance.fadeIn();
  }
}

setup.startMusic = (name) => {
  story.state.nowPlaying = name;
  setup.refreshMusic();
}

setup.stopMusic = () => {
  story.state.nowPlaying = null;
  setup.refreshMusic();
}

setup.playAchievementSound = () => {
  SoundEffects.achievementGet.play();
}

$(window).on("sm.passage.shown", (_, { passage }) => {
  setup.refreshMusic();
})