import { Request, Response, Router } from "express";
import { TileTemplateType } from "../../TileTemplateType";
import { createBindingFromTemplate, createRoot, createVisual, Mutex } from "../../utils";
import { XMLSerializer } from "xmldom";
import PackageRegistry from "../../PackageRegistry";

const WeatherCodeLookup = {
    113: "Sunny",
    116: "PartlyCloudy",
    119: "Cloudy",
    122: "VeryCloudy",
    143: "Fog",
    176: "LightShowers",
    179: "LightSleetShowers",
    182: "LightSleet",
    185: "LightSleet",
    200: "ThunderyShowers",
    227: "LightSnow",
    230: "HeavySnow",
    248: "Fog",
    260: "Fog",
    263: "LightShowers",
    266: "LightRain",
    281: "LightSleet",
    284: "LightSleet",
    293: "LightRain",
    296: "LightRain",
    299: "HeavyShowers",
    302: "HeavyRain",
    305: "HeavyShowers",
    308: "HeavyRain",
    311: "LightSleet",
    314: "LightSleet",
    317: "LightSleet",
    320: "LightSnow",
    323: "LightSnowShowers",
    326: "LightSnowShowers",
    329: "HeavySnow",
    332: "HeavySnow",
    335: "HeavySnowShowers",
    338: "HeavySnow",
    350: "LightSleet",
    353: "LightShowers",
    356: "HeavyShowers",
    359: "HeavyRain",
    362: "LightSleetShowers",
    365: "LightSleetShowers",
    368: "LightSnowShowers",
    371: "HeavySnowShowers",
    374: "LightSleetShowers",
    377: "LightSleet",
    386: "ThunderyShowers",
    389: "ThunderyHeavyRain",
    392: "ThunderySnowShowers",
    395: "HeavySnowShowers",
}

const WeatherTileBackgroundLookupDay = {
    "Unknown": "01_02",
    "Sunny": "01_02",
    "PartlyCloudy": "03_04_05",
    "Cloudy": "06_07_08",
    "VeryCloudy": "06_07_08",
    "Fog": "11",
    "LightRain": "12_13_39_40",
    "LightShowers": "12_13_39_40",
    "HeavyRain": "18",
    "HeavyShowers": "18",
    "HeavySnow": "22_23_44",
    "HeavySnowShowers": "22_23_44",
    "LightSleet": "29",
    "LightSleetShowers": "29",
    "LightSnow": "22_23_44",
    "LightSnowShowers": "22_23_44",
    "ThunderyHeavyRain": "15_41_42",
    "ThunderyShowers": "16_17",
    "ThunderySnowShowers": "22_23_44",
}

const WeatherTileBackgroundLookupNight = {
    "Unknown": "30_31_32_34_35_36_37",
    "Sunny": "33",
    "PartlyCloudy": "30_31_32_34_35_36_37",
    "Cloudy": "38",
    "VeryCloudy": "38",
    "Fog": "11",
    "LightRain": "12_13_39_40",
    "LightShowers": "12_13_39_40",
    "HeavyRain": "18",
    "HeavyShowers": "18",
    "HeavySnow": "22_23_44",
    "HeavySnowShowers": "22_23_44",
    "LightSleet": "29",
    "LightSleetShowers": "29",
    "LightSnow": "22_23_44",
    "LightSnowShowers": "22_23_44",
    "ThunderyHeavyRain": "15_41_42",
    "ThunderyShowers": "16_17",
    "ThunderySnowShowers": "22_23_44",
}

const WeatherTileIconLookupDay = {
    "Unknown": "44",
    "Sunny": "31",
    "PartlyCloudy": "29",
    "Cloudy": "27",
    "VeryCloudy": "26",
    "Fog": "20",
    "LightRain": "9",
    "LightShowers": "9",
    "HeavyRain": "11",
    "HeavyShowers": "11",
    "HeavySnow": "7",
    "HeavySnowShowers": "7",
    "LightSleet": "5",
    "LightSleetShowers": "5",
    "LightSnow": "13_41_46",
    "LightSnowShowers": "13_41_46",
    "ThunderyHeavyRain": "1",
    "ThunderyShowers": "1",
    "ThunderySnowShowers": "1",
}

const WeatherTileIconLookupNight = {
    "Unknown": "44",
    "Sunny": "31b",
    "PartlyCloudy": "29b",
    "Cloudy": "27b",
    "VeryCloudy": "26",
    "Fog": "20b",
    "LightRain": "9b",
    "LightShowers": "9b",
    "HeavyRain": "11",
    "HeavyShowers": "11",
    "HeavySnow": "7",
    "HeavySnowShowers": "7",
    "LightSleet": "5",
    "LightSleetShowers": "5",
    "LightSnow": "13_41_46",
    "LightSnowShowers": "13_41_46",
    "ThunderyHeavyRain": "1b",
    "ThunderyShowers": "1b",
    "ThunderySnowShowers": "1b",
}


// times inm format "HH:MM AM/PM"

type WeatherData = {
    current_condition: Array<{
        temp_C: string;
        localObsDateTime: string;
        observation_time: string;
        weatherCode: string;
        weatherDesc: Array<{ value: string }>;
    }>;
    nearest_area: Array<{
        areaName: Array<{ value: string }>;
        country: Array<{ value: string }>;
    }>;
    weather: Array<{
        maxtempC: string;
        mintempC: string;
        astronomy: Array<{
            sunrise: string;
            sunset: string;
        }>;
        hourly: Array<{
            weatherDesc: Array<{ value: string }>;
        }>;
    }>;
};

type Hourly = WeatherData["weather"][0]["hourly"][0];

let weatherMutex = new Mutex();
let weatherData: Record<string, WeatherData> = null as any;
const fetchWeatherData = async () => {
    await weatherMutex.run(async () => {
        await _fetchWeatherData();
    });
}

const waitForWeatherData = async () => {
    while (weatherData === null) {
        await weatherMutex.run(async () => { });
    }
}

const _fetchWeatherData = async () => {
    const fetchCity = async (city: string) => {
        while (true) {
            try {
                const data = await fetch(`https://wttr.in/${city.trim()}?format=j1`)
                if (!data.ok) {
                    throw new Error(`Failed to fetch weather data for ${city}: ${data.statusText}`);
                }

                // weather = { ...weather, [city.trim()]: await data.json() as WeatherData };
                return { [city.trim()]: await data.json() as WeatherData };
                break
            }
            catch (e) {
                console.error(`Error fetching weather data for ${city}, retrying...:`, e);
                await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000));
            }
        }
    }

    const cities = process.env.WEATHER_CITIES!.split(',');
    const output = await Promise.all(cities.map(city => fetchCity(city)));

    let weather = {};
    for (const cityData of output) {
        weather = { ...weather, ...cityData };
    }
    weatherData = weather;

    console.log("Fetched weather data for cities:", weatherData);
}

const getMostFrequentCondition = (hourly: Hourly[]) => {
    let mostFrequenntCondition = hourly.reduce((prev: Record<string, number>, curr: Hourly) => {
        if (prev[curr.weatherDesc[0].value]) {
            prev[curr.weatherDesc[0].value]++;
        } else {
            prev[curr.weatherDesc[0].value] = 1;
        }
        return prev;
    }, {});

    let sortedConditions = Object.entries(mostFrequenntCondition).sort((a, b) => b[1] - a[1]);
    let dominantCondition = sortedConditions[0][0];
    return dominantCondition;
}

const timeToMinutes = (time: string): number => {
    const [hour, minute, period] = time.split(/:| /);
    return (period === "PM" ? 12 + parseInt(hour) : parseInt(hour)) * 60 + parseInt(minute);
}

const isDayNight = (time: string, sunrise: string, sunset: string) => {
    const timeInMinutes = timeToMinutes(time);
    const sunriseInMinutes = timeToMinutes(sunrise);
    const sunsetInMinutes = timeToMinutes(sunset);

    return timeInMinutes >= sunriseInMinutes && timeInMinutes <= sunsetInMinutes;
}

const getData = (json: WeatherData) => {
    const condition = json.current_condition[0];
    const nearestArea = json.nearest_area[0];
    const today = json.weather[0];
    const tomorrow = json.weather[1];

    const todayCondition = getMostFrequentCondition(today.hourly);
    const tomorrowCondition = getMostFrequentCondition(tomorrow.hourly);

    const localTime = condition.localObsDateTime.substring(condition.localObsDateTime.indexOf(' ') + 1);
    const isDay = isDayNight(localTime, today.astronomy[0].sunrise, today.astronomy[0].sunset);
    const weatherCode = WeatherCodeLookup[parseInt(condition.weatherCode)];
    const weatherBackgroundCode = isDay
        ? WeatherTileBackgroundLookupDay[weatherCode]
        : WeatherTileBackgroundLookupNight[weatherCode];

    const weatherIconCode = isDay
        ? WeatherTileIconLookupDay[weatherCode]
        : WeatherTileIconLookupNight[weatherCode];

    let weatherDesc = condition.weatherDesc[0].value;
    if (weatherDesc.indexOf(',') !== -1) {
        weatherDesc = weatherDesc.split(',')[0];
    }

    return {
        condition,
        nearestArea,
        todayCondition,
        tomorrowCondition,
        weatherBackgroundCode,
        weatherIconCode,
        weatherDesc,
        today, tomorrow
    }
}

const addLargeVisual = (json: WeatherData, root: Document, visual: Element) => {
    const { condition, nearestArea, todayCondition, tomorrowCondition, weatherBackgroundCode, weatherDesc, today, tomorrow } = getData(json);

    const pack = PackageRegistry.getPackage("Microsoft.BingWeather_8wekyb3d8bbwe");
    const binding = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310BlockAndText02);
    binding.getElementsByTagName("image")[0].setAttribute("src", `/packages/${pack!.identity!.packageFullName}/images/tiles/${weatherBackgroundCode}.jpg`);
    binding.getElementsByTagName("text")[0].textContent = `${condition.temp_C}°`;
    binding.getElementsByTagName("text")[1].textContent = `${nearestArea.areaName[0].value}`;
    binding.getElementsByTagName("text")[2].textContent = `${weatherDesc}`;

    binding.getElementsByTagName("text")[3].textContent = 'Today';
    binding.getElementsByTagName("text")[4].textContent = `${today.maxtempC}°/${today.mintempC}° – ${todayCondition}`;

    binding.getElementsByTagName("text")[5].textContent = 'Tomorrow';
    binding.getElementsByTagName("text")[6].textContent = `${tomorrow.maxtempC}°/${tomorrow.mintempC}° – ${tomorrowCondition}`;
}

const addMediumVisual = (json: WeatherData, root: Document, visual: Element, offset: number, binding: Element) => {
    const { condition, nearestArea, weatherIconCode, weatherDesc, today } = getData(json);

    const textOffset = offset * 3;
    binding.getElementsByTagName("image")[0 + offset].setAttribute("src", `/packages/microsoft.bingweather_3.0.4.336_x86__8wekyb3d8bbwe/images/skycodes/89x89/${weatherIconCode}.png`);
    binding.getElementsByTagName("text")[0 + textOffset].textContent = `${condition.temp_C}°`;
    binding.getElementsByTagName("text")[1 + textOffset].textContent = `${nearestArea.areaName[0].value}`;
    binding.getElementsByTagName("text")[2 + textOffset].textContent = `${today.maxtempC}°/${today.mintempC}° – ${weatherDesc}`;
}

async function getWeatherTile(req: Request, res: Response) {
    await waitForWeatherData();

    const root = createRoot();
    const visual = createVisual(root);
    visual.setAttribute("branding", "name");

    const cities = process.env.WEATHER_CITIES!.split(',').map(c => c.trim());

    addLargeVisual(weatherData[cities[0]], root, visual);

    const wideBinding = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150SmallImageAndText02);
    addMediumVisual(weatherData[cities[0]], root, visual, 0, wideBinding);

    const visual2 = createVisual(root);
    visual2.setAttribute("branding", "name");

    // group remaining cities in 3s
    const remainingCities = cities.slice(1);
    console.log("Remaining cities for medium tile:", cities, remainingCities);
    for (let i = 0; i < remainingCities.length; i += 3) {
        const group = remainingCities.slice(i, i + 3);
        const secondBinding = createBindingFromTemplate(root, visual2, TileTemplateType.tileSquare310x310SmallImagesAndTextList01);
        for (let j = 0; j < group.length; j++) {
            let city = remainingCities[i + j];
            if (city === undefined)
                break;

            addMediumVisual(weatherData[city], root, visual2, j, secondBinding);
        }
    }

    for (let i = 1; i < cities.length; i++) {
        const visual3 = createVisual(root);
        const wideBinding2 = createBindingFromTemplate(root, visual3, TileTemplateType.tileWide310x150SmallImageAndText02);
        addMediumVisual(weatherData[cities[i]], root, visual3, 0, wideBinding2);
    }

    res.contentType('application/xml')
        .send(new XMLSerializer().serializeToString(root));
}

export default function registerRoutes(router: Router) {
    router.get('/weather/local.xml', getWeatherTile);

    setInterval(fetchWeatherData, 60 * 60 * 1000); // refresh every hour
    fetchWeatherData();
}