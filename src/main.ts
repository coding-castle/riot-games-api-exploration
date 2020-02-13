import axios from "axios"
import { Match, MatchHistory, LaneCount, ChampionCount, Summoner } from "./types"
// import fs from "fs"
import * as fs from "fs"
// const fs = require("fs")
const KEY = "RGAPI-51bddc9d-f5ca-4a5e-83ad-1f470e1d1899"
const BASEURL = "https://euw1.api.riotgames.com"

async function getSummonerId(summonerName: string): Promise<string> {
    try {
        const headers = {
            "X-Riot-Token": KEY,
        }
        const result = await axios.get(`${BASEURL}/lol/summoner/v4/summoners/by-name/${summonerName}`, { headers })
        return result.data.id
    } catch (error) {
        console.log(error)
        return ""
    }
}

async function getSummonerAccountId(summonerName: string): Promise<string> {
    try {
        const headers = {
            "X-Riot-Token": KEY,
        }
        const result = await axios.get(`${BASEURL}/lol/summoner/v4/summoners/by-name/${summonerName}`, { headers })
        return result.data.accountId
    } catch (error) {
        console.log(error)
        return ""
    }
}

/**
 * Get List of Matches for Summoner
 * @param summonerId AccountId of Summoner
 * @param startTime startTime in MS since epoch, default seems 30 days ago
 */
async function getMatches(summonerId: string, startTime?: number): Promise<MatchHistory> {
    try {
        const headers = {
            "X-Riot-Token": KEY,
        }
        const result = await axios.get(
            `${BASEURL}/lol/match/v4/matchlists/by-account/${summonerId}${startTime ? `?beginTime=${startTime}` : ""}`,
            { headers },
        )
        return result.data as MatchHistory
    } catch (error) {
        console.log(error.message)
        return error
    }
}

function getMsThirtyDaysAgo(): number {
    // Get a date object for the current time
    const d = new Date()

    // Set it to one month ago
    d.setMonth(d.getMonth() - 1)

    // Zero the hours
    d.setHours(0, 0, 0)

    // Zero the milliseconds
    d.setMilliseconds(0)

    // Get the time value in milliseconds and convert to seconds
    return Date.now() - 1000 * 60 * 60 * 24 * 30
}

async function getLatestPatch(): string {
    const result = await axios.get("http://ddragon.leagueoflegends.com/api/versions.json")
    return result.data[0]
}

async function getChampions()  {
    const currentPatch = await getLatestPatch()
    let champions = fs.readFileSync("data/champions.json", { encoding: "utf-8" })
    champions = JSON.parse(champions)
    const obs = Object.keys(champions).map(key => champions[key])
    const cachedPatch:string = obs[0].version
    if (currentPatch)
    // const result = await axios.get(`http://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
    // fs.writeFileSync("data/champions.json", JSON.stringify(result.data.data))
}

async function getChampionName(id: number): Promise<string> {
    const obs = Object.keys(result.data.data).map(key => result.data.data[key])
    const champ = obs.find(item => item.key == id)
    return champ.id
}

function getLanesDesc(matches: Match[]): LaneCount[] {
    const lanes = matches.map(match => match.lane)
    const result: LaneCount[] = []
    for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i]
        const el = result.find(item => item.lane === lane)
        if (el) {
            el.count++
        } else {
            result.push({ lane, count: 1 })
        }
    }
    return result
}

async function getChampionsDesc(matches: Match[]): Promise<ChampionCount[]> {
    const champions = matches.map(match => match.champion)
    const result: ChampionCount[] = []
    for (let i = 0; i < champions.length; i++) {
        const champion = champions[i]
        const el = result.find(item => item.championId === champion)
        if (el) {
            el.count++
        } else {
            result.push({ championId: champion, count: 1 })
        }
    }
    for (let i = 0; i < result.length; i++) {
        const champion = result[i]
        champion.championName = await getChampionName(champion.championId)
    }
    return result.sort((a, b) => b.count - a.count)
}

/**
 * BIG DATA
 * League-v4 endpoint
 * /lol/league/v4/entries/{queue}/{tier}/{division}
 * /lol/league/v4/entries/RANKED_SOLO_5x5/DIAMOND/I?page=2
 *
 * increase pages until array is empty
 *
 * --> SummonerName, SummonerId, wins, losses
 *
 * SummonerName --> AccountId -> Matches -> GameId --> GameDetails
 * Match-V4 -> participants -> teamId, champion, lane, role, win, kills, deaths, assists
 *
 * Save GameId and skip if it appears again (when querying teammates later on)
 * Get Matches by Id
 * for each match: save champion + win/loss
 */
async function bigData(): Promise<boolean> {
    let summoners: Summoner[] = []
    const headers = {
        "X-Riot-Token": KEY,
    }
    for (let page = 1; page < 1000; page++) {
        const result = await axios.get(`${BASEURL}/lol/league/v4/entries/RANKED_SOLO_5x5/DIAMOND/I?page=${page}`, {
            headers,
        })
        if (result.data.length > 0) {
            summoners = [...summoners, ...result.data]
        } else {
            break
        }
    }
    console.log(summoners)
    console.log(summoners.length)
    const summonerAccountIdRequests = []
    for (let i = 0; i < summoners.length; i++) {
        const summoner = summoners[i]
        summonerAccountIdRequests.push(getSummonerAccountId(summoner.summonerName))
    }
    const accountIds = await Promise.all(summonerAccountIdRequests)
    console.log(accountIds)
    return true
}

async function main(): Promise<void> {
    // const id = await getSummonerAccountId("Don Noway")
    // const timeInMs = getMsThirtyDaysAgo()
    // const matchHistory = await getMatches(id, timeInMs)
    // const lanes = getLanesDesc(matchHistory.matches)
    // console.log("most played lanes are:")
    // console.log(lanes)
    // const champions = await getChampionsDesc(matchHistory.matches)

    // console.log("most played champions are:")
    // console.log(champions)
    // await getChampionName(2)
    await getChampions()
    //await bigData()
}

main()
