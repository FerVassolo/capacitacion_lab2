import React, {useEffect, useState} from 'react';
import '../css/PokemonInfo.css'
import {useParams} from "react-router-dom";
import axios from "axios";
import Grid from "@mui/material/Grid";
import ListItemText from '@mui/material/ListItemText'
import {experimentalStyled as styled} from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StraightenIcon from '@mui/icons-material/Straighten';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Slider from '@mui/material/Slider';

export default function PokemonInfoPage() {

    const {name} = useParams();
    const PokemonAPI = "https://pokeapi.co/api/v2/pokemon/";
    const TypesAPI = "https://pokeapi.co/api/v2/type/"
    const EvolutionAPI = "https://pokeapi.co/api/v2/pokemon-species/" //.evolution-chain.url
    // axio get ese url que adentro tiene: .chain.evolvesTo


    const [data, setData] = useState();
    const [pokemonData, setPokemonData] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const niceColors = ["#FF5733", "#F3722C", "#577590",  "#F8961E", "#90BE6D",
        "#F9C74F", "#43AA8B", "#4D908E",  "#277DA1", "#F94144", "#764E9F", "#6A4C93",
        "#7D3C98", "#D7D2CC", "#8E8D8A", "#6B6E70", "#3E3D3D", "#222222"];

    const [dataLenght, setDataLenght] = useState();

    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1.4),
        borderRadius: '20px',
        width: '70px',
        textAlign: 'center',
        color: 'white',
        fontFamily: "Courier New",
        fontWeight: "bold",
    }));

    useEffect(() =>{

    }, [name]);


    // Lo hago async pero la verdad es q no es necesario

    useEffect(() => {
        const getPokemonData = async () => {
            try {
                const response = await axios.get(`${PokemonAPI}${name}`);
                const typesArray = [];
                for (let i = 0; i < response.data.types.length; i++) {
                    let typeName = response.data.types[i].type.name;
                    typesArray.push(typeName.charAt(0).toUpperCase() + typeName.slice(1));
                }

                const statsDict = {};
                for (let i = 0; i < 6; i++) {
                    let statName = response.data.stats[i].stat.name;
                    let baseStat = response.data.stats[i].base_stat;
                    statsDict[statName] = baseStat;
                }
                setDataLenght(typesArray.length);
                const animation = response.data.sprites.versions["generation-v"]["black-white"].animated.front_default;
                return new Promise((resolve) => {
                    ImageInfo(animation, function (img) {
                        const pokemonInfo = {
                            name: response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1),
                            types: typesArray,
                            stats: statsDict,
                            weight: response.data.weight,
                            height: response.data.height,
                            experience: response.data.base_experience,
                            animation: animation,
                            image: response.data.sprites.front_default,
                        };
                        resolve(pokemonInfo);
                    });
                });
            } catch (error) {
                console.error(`Error fetching data for Pokemon #${name}:`, error);
                return null;
            }
        }

        getPokemonData().then(pokemonInfo => {
            if (pokemonInfo) {
                setData(pokemonInfo);
            }
        });

        getAllTypes();
        getAllEvolutions();
    }, [name]);

    const getAllEvolutions = async () => {
        // Un pokemon tiene, a lo sumo, 3 evols, no más.
        try {
            const response = await axios.get(`${EvolutionAPI}${name}`);
            const evolution_chain = response.data.evolution_chain.url;
            const chain = await axios.get(`${evolution_chain}`);
            const evolutionNames = [];
            evolutionNames.push(chain.data.chain.species.name)
            if (chain.data.chain.evolves_to.length>0){
                const subChain = chain.data.chain.evolves_to[0];
                evolutionNames.push(subChain.species.name);
                if(subChain.evolves_to.length > 0){
                    evolutionNames.push(subChain.evolves_to[0].species.name);
                }
            }
            displayAllPokemons(evolutionNames);
        }
        catch (error) {
            console.error(`Error fetching data for Pokemon #${name}:`, error);
            return null;
        }
    }
    const displayAllPokemons = async (pokemonNames) => {
        const promises = Array.from({ length: pokemonNames.length }).map(async (_, index) => {
            const pName = pokemonNames[index];
            try {
                const response = await axios.get(`${PokemonAPI}${pName}`);
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
                console.error(`Error fetching data for Pokemon #${pName}:`, error);
                return null;
            }
        });

        const pokemonInfo = await Promise.all(promises);
        console.log(pokemonInfo);
        setPokemonData(pokemonInfo.filter(pokemon => pokemon !== null));
    };

    const ImageInfo = (path, onLoad) => {
        var img = new Image();
        img.src = path;
        img.onload = function() {
            onLoad(img);
        }
    }
// Usage example

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

        // Wait for all promises to resolve
        const results = await Promise.all(promises);
        // Filter out any null results (failed requests)
        const validResults = results.filter(result => result !== null);

        // Update the state with the fetched data
        setPokemonTypes(validResults);
    };
    useEffect(() => {
        getAllTypes();
    }, [])

    return (
        <div className={"background"}>
            <div className={"big-square"}>
                <img
                    src={data && data.animation}
                    alt={data && data.name}
                />
                <Grid
                    className={"pokemon-types"}

                    sx={{left: dataLenght > 1 ? "12%": "20%"}}
                    container
                    columns={{ xs: 2, sm: 8, md: 25 }}
                    spacing={1} // Adjust the spacing here
                >
                    {data && data.types.map((type, typeIndex) => (
                        <Grid
                            item
                            xs={2}
                            sm={4}
                            md={4}
                            key={typeIndex}
                            sx={{ marginLeft: "0" }}
                        >
                            <Item
                                className={"pokemon-type"}
                                style={{ backgroundColor: niceColors[pokemonTypes.indexOf(type.toLowerCase())] }}>
                                {type}
                            </Item>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ position:"relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", top:"5%", left: "5%", width: "500px"}}>
                    <Box sx={{ display: "flex", height: 10 }}>
                        <FitnessCenterIcon sx={{ marginTop: '15px'}}/>
                        <p>{data && data.weight} Kg</p>
                        <Divider orientation="vertical" flexItem />
                    </Box>
                    <Box sx={{ display: "flex",  height: 10 }}>
                        <StraightenIcon sx={{ marginTop: '15px', transform: 'rotate(90deg)' }}/>
                        <p>68 Mts</p>
                        <Divider orientation="vertical" flexItem />
                    </Box>
                    <Box sx={{ display: "flex",  height: 10 }}>
                        <StarBorderIcon sx={{ marginTop: '13px'}}/>
                        <p>68 Exp</p>
                        <Divider orientation="vertical" flexItem />
                    </Box>
                    <Box sx={{ position: "relative", display: "flex", left: '10px', alignItems: "center", height: 100 }}>
                        <p>Weight</p>
                    </Box>
                    <Box sx={{ position: "relative", left: '15px', display: "flex", alignItems: "center", height: 100 }}>
                        <p>Height</p>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", height: 100 }}>
                        <p>Experience</p>
                    </Box>
                </Box>
            </div>
            <div className={"base-stats"}>
                <h3 style={{color:"white"}}>Base Stats</h3>
                {data &&
                <div style={{position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>

                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["hp"]} aria-label="Disabled slider" />
                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["attack"]} aria-label="Disabled slider" />
                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["defense"]} aria-label="Disabled slider" />
                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["special-attack"]} aria-label="Disabled slider" />
                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["special-defense"]} aria-label="Disabled slider" />
                    <Slider sx={{width: "250px", marginBottom:"15px"}} disabled defaultValue={data.stats["speed"]} aria-label="Disabled slider" />

                </div>}
                <div style={{ position: "absolute", display: "flex", flexDirection: "column", textAlign: "right", top: "52px", right: '115px', fontFamily: "Comfortaa, sans-serif", fontSize:"14px", color:"white" }}>
                    <p style={{marginBottom:"14px"}}>HP</p>
                    <p style={{marginBottom:"15px"}}>Attack</p>
                    <p style={{marginBottom:"15px"}}>Defense</p>
                    <p style={{marginBottom:"15px", whiteSpace: "nowrap" }}>Sp. Attack</p>
                    <p style={{marginBottom:"15px", whiteSpace: "nowrap" }}>Sp Defence</p>
                    <p >Speed</p>


                </div>
            </div>

            <h1>Evolutions</h1>
            <div className={"grid-of-squares1"}>
                {pokemonData.map((pokemon, index) => (
                    <div key={index} className="evolution-square" >
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
                            sx={{right: pokemon.types.length > 1 ? "4.5%" : "3%"}}
                        >
                            {pokemon.types.map((type, typeIndex) => (
                                <Grid
                                    item
                                    xs={2}
                                    sm={4}
                                    md={4}
                                    key={typeIndex}
                                    sx={{ marginLeft: typeIndex === 0 ? '0' : '25px'}} // Apply marginLeft 0 for the first item
                                >
                                    <Item style={{ left:"10%", backgroundColor: niceColors[pokemonTypes.indexOf(type.toLowerCase())]}}>{type}</Item>
                                </Grid>
                            ))}
                        </Grid>

                    </div>
                ))}
            </div>

        </div>
    )

}