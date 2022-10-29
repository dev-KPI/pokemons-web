'use strict';

const API_BASE_PATH = 'https://pokeapi.co/api/v2/';
const API_POKEMON_PATH = new URL('pokemon', API_BASE_PATH);
const MAX_POKEMON_ID = 905;

const getPokemonByIdOrName = async (getBy) => {
  const getByType = typeof getBy;
  if (getByType !== 'string' && getByType !== 'number') {
    throw TypeError('Query pokemon by number or string');
  }
  const res = await fetch(API_POKEMON_PATH + '/' + getBy);
  if (!res.ok) {
    throw new Error(`Status code:${res.status}`);
  }
  return res.json();
};

const changePicture = (src) => {
  const picture = document.getElementById('pokemon__picture');
  picture.src = src;
};

const search = async () => {
  try {
    const getBy = document.getElementById('search__input').value;
    const fetched = await getPokemonByIdOrName(getBy);
    const src = fetched.sprites.other['official-artwork'].front_default;
    changePicture(src);
  } catch (e) {
    console.log(`Can not search a pokemon ${e}`);
  }
};

const randomSearch = async () => {
  const randomId = (Math.random() * (MAX_POKEMON_ID - 1) + 1).toFixed();
  const searchInput = document.getElementById('search__input');
  searchInput.value = randomId;
  search();
};

{
  const searchInput = document.getElementById('search__input');
  searchInput.addEventListener('keyup', ({ key }) => {
    if (key === 'Enter') {
      search();
    }
  });
}
