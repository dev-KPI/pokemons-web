'use strict';
{
  const API_BASE_PATH = 'https://pokeapi.co/api/v2';
  const addPath = (path) => API_BASE_PATH + '/' + path;
  const API_POKEMON_PATH = addPath('pokemon');
  const API_POKEMON_ADDITIONAL_INFO_PATH = addPath('pokemon-species');
  const MAX_POKEMON_ID = 905;

  const searchInput = document.getElementsByClassName('search__input')[0];

  searchInput.addEventListener('keyup', ({ key }) => {
    if (key === 'Enter') {
      search();
    }
  });

  const target = {
    pokemon: document.getElementsByClassName('pokemon')[0],
    search: document.getElementsByClassName('search__input')[0],
    picture: document.getElementsByClassName('pokemon__picture')[0],
    name: document.getElementsByClassName('pokemon__name')[0],
    description: document.getElementsByClassName('pokemon__description')[0],
    height: document.getElementById('pokemonHeight'),
    weight: document.getElementById('pokemonWeight'),
    habitat: document.getElementById('pokemonHabitat'),
    shape: document.getElementById('pokemonShape'),
    type: document.getElementsByClassName('pokemon__type')[0],
  };

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

  const getPokemon = async (idOrName) =>
    getResource(idOrName, API_POKEMON_PATH);

  const getPokemonAdditionalInfo = async (idOrName) =>
    getResource(idOrName, API_POKEMON_ADDITIONAL_INFO_PATH);

  const search = async () => {
    try {
      const userInput = searchInput.value;
      const info = await getPokemon(userInput);
      const additionalInfo = await getPokemonAdditionalInfo(userInput);

      target.picture.src = info.sprites.other['official-artwork'].front_default;
      const name = info.name;
      target.name.textContent = name[0].toUpperCase() + name.substring(1);

      const uniqueDescriptions = new Set(
        additionalInfo.flavor_text_entries
          .filter((item) => item.language.name === 'en')
          .slice(0, 2)
          .map((item) => item.flavor_text)
      );
      const description = [...uniqueDescriptions.values()].join(' ');
      target.description.textContent = description;

      target.height.textContent = info.height + ' feet';
      target.weight.textContent = info.weight + ' lbs';
      target.habitat.textContent = additionalInfo.habitat
        ? additionalInfo.habitat.name
        : 'not known';
      target.shape.textContent = additionalInfo.shape.name;
      target.pokemon.style.visibility = 'visible';

      while (target.type.firstChild) {
        target.type.removeChild(target.type.firstChild);
      }
      const types = info.types.map((item) => item.type.name);
      types.forEach((type) => {
        const li = document.createElement('li');
        li.textContent = type;
        target.type.appendChild(li);
      });
    } catch (e) {
      console.log(`Can not search a pokemon ${e}`);
    }
  };

  const randomSearch = async () => {
    const randomId = (Math.random() * (MAX_POKEMON_ID - 1) + 1).toFixed();
    searchInput.value = randomId;
    search();
  };

  window.search = search;
  window.randomSearch = randomSearch;
}
