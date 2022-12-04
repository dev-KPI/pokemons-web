'use strict';
{
  const API_BASE_PATH = 'https://pokeapi.co/api/v2';
  const addPath = (path) => API_BASE_PATH + '/' + path;
  const API_POKEMON_PATH = addPath('pokemon');
  const API_POKEMON_ADDITIONAL_INFO_PATH = addPath('pokemon-species');
  const MAX_POKEMON_ID = 905; // TODO fetch it
  const MIN_POKEMON_ID = 1;
  const NUMBER_OF_STAT_CIRCLES = 6;
  const STATS_COLORS = [
    '#6bf8bd',
    '#f8b26b',
    '#f86b6b',
    '#f86bf8',
    '#6b8bf8',
    '#f8f86b',
  ];

  const targetData = {
    pokemon: 'pokemon',
    searchInput: 'search__input',
    searchButton: 'search__button',
    randomSearch: 'search__random',
    picture: 'pokemon__picture',
    name: 'pokemon__name',
    description: 'pokemon__description',
    height: 'pokemonHeight',
    weight: 'pokemonWeight',
    habitat: 'pokemonHabitat',
    shape: 'pokemonShape',
    type: 'pokemon__type',
    statsContainer: 'stats_container',
    stats: {
      hp: document.getElementById('hpPercents'),
      attack: document.getElementById('attackPercents'),
      defense: document.getElementById('defensePercents'),
      'special-attack': document.getElementById('specialAttackPercents'),
      'special-defense': document.getElementById('specialDefensePercents'),
      speed: document.getElementById('speedPercents'),
    },
  };

  const target = Object.fromEntries(
    Object.entries(targetData).map(([key, value]) =>
      typeof value === 'object'
        ? [key, value]
        : [key, document.getElementsByClassName(value)[0]]
    )
  );

  const getResource = async (idOrName, getFrom) => {
    const type = typeof idOrName;
    if (type !== 'string' && type !== 'number') {
      throw TypeError('Query pokemon by number or string');
    }
    const res = await fetch(getFrom + '/' + idOrName);
    if (!res.ok) {
      throw new Error(`Status code:${res.status}`);
    }
    return res.json();
  };

  const getPokemonInfo = async (idOrName) =>
    getResource(idOrName, API_POKEMON_PATH);

  const getPokemonAdditionalInfo = async (idOrName) =>
    getResource(idOrName, API_POKEMON_ADDITIONAL_INFO_PATH);

  const updatePicture = (pokemonFetchedInfo) => {
    target.picture.src =
      pokemonFetchedInfo.sprites.other['official-artwork'].front_default;
    const name = pokemonFetchedInfo.name;
    target.name.textContent = name[0].toUpperCase() + name.substring(1);
  };

  const updateDescription = (additionalInfo) => {
    const uniqueDescriptions = new Set(
      additionalInfo.flavor_text_entries
        .filter((item) => item.language.name === 'en')
        .slice(0, 2)
        .map((item) => item.flavor_text)
    );
    const description = [...uniqueDescriptions.values()].join(' ');
    target.description.textContent = description;
  };

  const updateProperties = (pokemonFetchedInfo, additionalInfo) => {
    target.height.textContent = pokemonFetchedInfo.height + ' feet';
    target.weight.textContent = pokemonFetchedInfo.weight + ' lbs';
    target.habitat.textContent = additionalInfo.habitat
      ? additionalInfo.habitat.name
      : 'not known';
    target.shape.textContent = additionalInfo.shape.name;
  };

  const updateTypes = (pokemonFetchedInfo) => {
    while (target.type.firstChild) {
      target.type.removeChild(target.type.firstChild);
    }
    const types = pokemonFetchedInfo.types.map((item) => item.type.name);
    types.forEach((type) => {
      const li = document.createElement('li');
      li.textContent = type;
      target.type.appendChild(li);
    });
  };

  const calcOffset = (percents) => {
    if (percents >= 100) return 0;
    const computedStyle = getComputedStyle(target.statsContainer);
    const dash = computedStyle.getPropertyValue('--stroke-dash-array');
    return (+dash - (+dash / 100) * percents).toString();
  };

  const updateStats = (pokemonFetchedInfo) => {
    const fetchedStats = pokemonFetchedInfo.stats;
    for (const item of fetchedStats) {
      const name = item.stat.name;
      const percents = item.base_stat;
      if (target.stats[name]) {
        target.stats[name].textContent = percents;
        target.statsContainer.style.setProperty(
          `--dashoffset-${name}`,
          calcOffset(percents)
        );
      }
    }
  };

  const statNames = Object.keys(target.stats);
  const toggleCircleAnimation = (
    style,
    isUnset = true,
    indexOfCircle = null
  ) => {
    const updateStyle = (styleToUpdate, styleValue) =>
      isUnset
        ? (style[styleToUpdate] = '')
        : (style[styleToUpdate] = styleValue);
    updateStyle('-webkit-animation-name', `fill-${statNames[indexOfCircle]}`);
    updateStyle('-o-animation-name', `fill-${statNames[indexOfCircle]}`);
    updateStyle('animation-name', `fill-${statNames[indexOfCircle]}`);
    updateStyle('-webkit-stroke', STATS_COLORS[indexOfCircle]);
    updateStyle('-o-stroke', STATS_COLORS[indexOfCircle]);
    updateStyle('stroke', STATS_COLORS[indexOfCircle]);
  };

  const updateCirclesAnimation = () => {
    let i = 0;
    while (i < NUMBER_OF_STAT_CIRCLES) {
      const style = document.getElementsByClassName(
        `circle--${statNames[i]}`
      )[0].style;
      toggleCircleAnimation(style);
      toggleCircleAnimation(style, false, i);
      i++;
    }
  };

  const search = async () => {
    try {
      const userInput = target.searchInput.value;
      const pokemonFetchedInfo = await getPokemonInfo(userInput);
      const additionalInfo = await getPokemonAdditionalInfo(userInput);
      updatePicture(pokemonFetchedInfo);
      updateDescription(additionalInfo);
      updateProperties(pokemonFetchedInfo, additionalInfo);
      updateTypes(pokemonFetchedInfo);
      updateStats(pokemonFetchedInfo);
      target.pokemon.style.visibility = 'visible';
      requestAnimationFrame(() => updateCirclesAnimation()); //?
    } catch (e) {
      console.log(`Can not search a pokemon ${e}`);
    }
  };

  const randomSearch = async () => {
    const randomId = (
      Math.random() * (MAX_POKEMON_ID - MIN_POKEMON_ID) +
      MIN_POKEMON_ID
    ).toFixed();
    target.searchInput.value = randomId;
    search();
  };

  (() => {
    const circles = document.getElementsByClassName('circle');
    const options = {
      root: null,
    };

    for (let i = 0; i < circles.length; i++) {
      new IntersectionObserver((entries) => {
        console.log(entries); // to see if observer works
        const style = entries[0].target.style;
        if (entries[0].isIntersecting) {
          toggleCircleAnimation(style, false, i);
          return;
        }
        toggleCircleAnimation(style);
      }, options).observe(circles[i]);
    }
  })();

  target.searchInput.addEventListener('keyup', ({ key }) => {
    if (key === 'Enter') {
      search();
    }
  });

  target.searchButton.addEventListener('click', search);
  target.randomSearch.addEventListener('click', randomSearch);
}
