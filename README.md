# NOTE

By default I only list 20 pokemons so it doesn't take time to load. To change this, on the displayAllPokemons const at the HomePage.js, change the lenght of the array:

    const promises = Array.from({ length: 20 }).map(async (_, index) => {
            const pokemonNumber = index + 1;

It takes any valid number between 1 and 1010
