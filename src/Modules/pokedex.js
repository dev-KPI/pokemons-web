'use strict';
{
  const API_BASE_PATH = 'https://pokeapi.co/api/v2';
  const addPath = (path) => API_BASE_PATH + '/' + path;
  const API_POKEMON_PATH = addPath('pokemon');
  const API_POKEMON_ADDITIONAL_INFO_PATH = addPath('pokemon-species');
  const MAX_POKEMON_ID = 905;

  const pokemonTarget = document.getElementsByClassName('pokemon')[0];
  const searchInput = document.getElementsByClassName('search__input')[0];
  const pictureTarget = document.getElementsByClassName('pokemon__picture')[0];
  const nameTarget = document.getElementsByClassName('pokemon__name')[0];
  const descriptionTarget = document.getElementsByClassName(
    'pokemon__description'
  )[0];
  const heightTarget = document.getElementById('pokemonHeight');
  const weightTarget = document.getElementById('pokemonWeight');
  const habitatTarget = document.getElementById('pokemonHabitat');
  const shapeTarget = document.getElementById('pokemonShape');

  const getResource = async (idOrName, getFrom) => {
    const getByType = typeof idOrName;
    if (getByType !== 'string' && getByType !== 'number') {
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

  window.search = async () => {
    try {
      const userInput = searchInput.value;
      const pokemon = await getPokemon(userInput);
      const additionalInfo = await getPokemonAdditionalInfo(userInput);

      pictureTarget.src =
        pokemon.sprites.other['official-artwork'].front_default;
      const name = pokemon.name;
      nameTarget.textContent = name[0].toUpperCase() + name.substring(1);

      const uniqueDescriptions = new Set(
        additionalInfo.flavor_text_entries
          .filter((item) => item.language.name === 'en')
          .slice(0, 2)
          .map((item) => item.flavor_text)
      );
      const description = [...uniqueDescriptions.values()].join(' ');
      descriptionTarget.textContent = description;

      heightTarget.textContent = pokemon.height;
      weightTarget.textContent = pokemon.weight;
      habitatTarget.textContent = additionalInfo.habitat
        ? additionalInfo.habitat.name
        : 'not known';
      shapeTarget.textContent = additionalInfo.shape.name;
      pokemonTarget.style.visibility = 'visible';
    } catch (e) {
      console.log(`Can not search a pokemon ${e}`);
    }
  };

  window.randomSearch = async () => {
    const randomId = (Math.random() * (MAX_POKEMON_ID - 1) + 1).toFixed();
    searchInput.value = randomId;
    search();
  };

  window.searchInput.addEventListener('keyup', ({ key }) => {
    if (key === 'Enter') {
      search();
    }
  });
}
