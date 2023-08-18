import React, {useEffect, useState} from 'react';
import "../css/Home.css";
import pokemonLogo from "../images/pokemon_logo.png";
import axios from "axios";
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText'
import {useNavigate} from "react-router-dom";
import {compareArraysAsSet} from "@testing-library/jest-dom/dist/utils";
export default function HomePage() {

    const PokemonAPI = "https://pokeapi.co/api/v2/pokemon/";
    const TypesAPI = "https://pokeapi.co/api/v2/type/"
    const navigate = useNavigate();
    const [pokemonName, setPokemonName] = useState("");
    const amountSqares = 10;
    const [pokemonData, setPokemonData] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const niceColors = ["#FF5733", "#F3722C", "#577590",  "#F8961E", "#90BE6D",
        "#F9C74F", "#43AA8B", "#4D908E",  "#277DA1", "#F94144", "#764E9F", "#6A4C93",
        "#7D3C98", "#D7D2CC", "#8E8D8A", "#6B6E70", "#3E3D3D", "#222222"];

    const [currentPokemonSearch, setCurrentPokemonSearch] = useState("");
    const [currentTypeSearch, setCurrentTypeSearch] = useState("");

    const [displayablePokemons, setDisplayablePokemons] = useState([])
    const handleNavigate = (name) => {
        navigate('/pokemon/' + name.charAt(0).toLowerCase() + name.slice(1));
    }

        // Cambiuar esto para hacerlo como yo quiero
    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1.4),
        borderRadius: '20px',
        width: '70px',
        textAlign: 'center',
        color: 'white',
        fontFamily: "Courier New",
        fontWeight: "bold",
        marginRight:"40px"
    }));

   //1010 pokemons numbered from https://pokeapi.co/api/v2/pokemon/1 to https://pokeapi.co/api/v2/pokemon/1010
    const displayAllPokemons = async () => {
        // By default I put 20 so it loads faster
        const promises = Array.from({ length: 20 }).map(async (_, index) => {
            const pokemonNumber = index + 1;
            try {
                const response = await axios.get(`${PokemonAPI}${pokemonNumber}`);
                const typesArray = response.data.types.map(typeObj => typeObj.type.name.charAt(0).toUpperCase() + typeObj.type.name.slice(1));

                const pokemonInfo = {
                    name: response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1),
                    image: response.data.sprites.front_default,
                    types: typesArray
                };
                return new Promise((resolve) => {
                    ImageInfo(pokemonInfo.image, function (img) {
                        pokemonInfo.width = img.width;
                        pokemonInfo.height = img.height;
                        resolve(pokemonInfo);
                    });
                });
            } catch (error) {
                console.error(`Error fetching data for Pokemon #${pokemonNumber}:`, error);
                return null;
            }
        });

        const pokemonInfo = await Promise.all(promises);
        console.log(pokemonInfo);
        setPokemonData(pokemonInfo.filter(pokemon => pokemon !== null));
    };


    // buscar para cada tipo y asignarle color en una lista.

    // Second api call.
    // 18 types numbered from https://pokeapi.co/api/v2/type/1 to https://pokeapi.co/api/v2/type/18
    const getAllTypes = async () => {
        const promises = Array.from({ length: 18 }).map(async (_, index) => {
            const typeNumber = index + 1;
            try {
                const response = await axios.get(`${TypesAPI}${typeNumber}`);
                return response.data.name; // Return the fetched data
            } catch (error) {
                console.error(`Error fetching data for Type #${typeNumber}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);

        const validResults = results.filter(result => result !== null);

        setPokemonTypes(validResults);
    };

    useEffect(() => {
        displayAllPokemons();
        getAllTypes();
    }, [])

    // Every
    useEffect(() => {
        console.log(displayablePokemons); // Log the updated state when it changes
    }, [displayablePokemons]);

    const searchByName = (event, value) => {
        setCurrentPokemonSearch(value);

        const matchingPokemon = pokemonData.find(pokemon => pokemon.name === value);

        if (matchingPokemon) {
            setCurrentPokemonSearch(matchingPokemon.name);
            setDisplayablePokemons([matchingPokemon]); // Wrap the matchingPokemon in an array
        }
        else{
            setDisplayablePokemons([]);
        }
    };

    const searchByType = (event, value) => {
        setCurrentTypeSearch(value);

        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);

        const matchingPokemon = pokemonData.filter(pokemon => {
            for (let i = 0; i < pokemon.types.length; i++) {
                console.log(pokemon.types[i])
                if (pokemon.types[i] === capitalizedValue) {
                    return true; // Return true if any type matches
                }
            }
            return false; // Return false if no types match
        });

        // solo listq el primero aca, esta mal
        if (matchingPokemon) {
            setDisplayablePokemons(matchingPokemon); // Wrap the matchingPokemon in an array
        }
        else{
            setDisplayablePokemons([]);
        }
    }


    // cuando pongo el mouse encima me agarra el pokemon y me mete la animación.
    const handleMouseEnter = (index) => {
        // Clone the pokemonData array to avoid directly modifying state
        const updatedPokemonData = [...pokemonData];
        updatedPokemonData[index].isHovered = true;
        setPokemonData(updatedPokemonData);
    };


    const handleMouseLeave = (index) => {
        const updatedPokemonData = [...pokemonData];
        updatedPokemonData[index].isHovered = false;
        setPokemonData(updatedPokemonData);
    };

    const ImageInfo = (path, onLoad) => {
        var img = new Image();
        img.src = path;
        img.onload = function() {
            onLoad(img);
        };
        img.onerror = function(error) {
            console.error('Image load error:', error);
            onLoad(null);
        };
    };

    return (
        <div className={"background"}>

            {/*Logo*/}
            <div className={"logo"} >
                <img style={{height: "200px"}} src={pokemonLogo}></img>
            </div>

            {/*Searches*/}
            <div className={"searches"}>
                <div className={"autocomplete"}>
                    <Autocomplete
                        disablePortal
                        options={pokemonData}
                        sx={{ width: 600, backgroundColor:"white", opacity:"90%", borderRadius:"5px"}}
                        getOptionLabel={(option) => option.name} // Specify that the name is used for label and search
                        renderInput={(params) => <TextField {...params} label="Search a pokemon" />}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <ListItemText primary={option.name} />
                            </li>
                        )}
                        onChange={(event, value) => setCurrentPokemonSearch(value ? value.name : '')}
                        onInputChange={searchByName}
                    />
                </div>
                <div className={"search-by-type"}>
                        <Autocomplete
                            disablePortal
                            options={pokemonTypes} // Use the list of type strings directly
                            sx={{ width: 300, backgroundColor: "white", opacity: "90%", borderRadius: "5px" }}
                            renderInput={(params) => <TextField {...params} label="Search by type" />}
                            onChange={(event, value) => setCurrentTypeSearch(value || "")}
                            onInputChange={searchByType}
                        />
                </div>
            </div>

            {/*Pokemons*/}
            {displayablePokemons.length === 0 && currentTypeSearch === '' && (
            <div className={"grid-of-squares"}>
                {pokemonData.map((pokemon, index) => (
                <div key={index} className="square" onClick={()=> handleNavigate(pokemonData[index].name)}>
                    <img
                        src={pokemon.image}
                        alt={pokemon.name}
                    />
                    {/*position: "relative", color:"white", fontSize:"15px", display:"flex", justifyContent:"center", alignItems:"flex-end", height: "10%"*/}
                    <p style={{marginTop: "25px", marginBottom: "7px"}}>{pokemon.name}</p>
                    <Grid
                        className={"types"}
                        container
                        columns={{ xs: 4, sm: 8, md: 12 }}
                        sx={{right: pokemon.types.length > 1 ? "10%" : "3%"}}
                    >
                        {pokemon.types.map((type, typeIndex) => (
                            <Grid
                                item
                                xs={2}
                                sm={4}
                                md={4}
                                key={typeIndex}
                            >
                                <Item  style={{ marginLeft: typeIndex === 0 ? '0' : '25px', backgroundColor: niceColors[pokemonTypes.indexOf(type.toLowerCase())]}}>{type}</Item>
                            </Grid>
                        ))}
                    </Grid>

                </div>
                ))}
            </div>
            )}


            {displayablePokemons.length > 0 && (
                <div className={"grid-of-squares"}>
                    {displayablePokemons.map((pokemon, index) => (
                        <div key={index} className="square"  onClick={()=> handleNavigate(pokemon.name)}>
                            <img
                                src={pokemon.image}
                                alt={pokemon.name}
                            />
                            {/*position: "relative", color:"white", fontSize:"15px", display:"flex", justifyContent:"center", alignItems:"flex-end", height: "10%"*/}
                            <p style={{marginTop: "25px", marginBottom: "7px"}}>{pokemon.name}</p>
                            <Grid
                                className={"types"}
                                container
                                columns={{ xs: 4, sm: 8, md: 12 }}
                                sx={{right: pokemon.types.length > 1 ? "10%" : "3%"}}
                            >
                                {pokemon.types.map((type, typeIndex) => (
                                    <Grid
                                        item
                                        xs={2}
                                        sm={4}
                                        md={4}
                                        key={typeIndex}
                                         // Apply marginLeft 0 for the first item
                                    >
                                        <Item style={{marginLeft: typeIndex === 0 ? '0' : '25px', backgroundColor: niceColors[pokemonTypes.indexOf(type.toLowerCase())]}}>{type}</Item>
                                    </Grid>
                                ))}
                            </Grid>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
