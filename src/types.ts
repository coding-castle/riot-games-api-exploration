export interface Match {
    platformId: string
    gameId: number
    champion: number
    queue: number
    season: number
    timestamp: number
    role: string
    lane: string
}

export interface MatchHistory {
    matches: Match[]
    startIndex: number
    endIndex: number
    totalGames: number
}

export interface LaneCount {
    lane: string
    count: number
}

export interface ChampionCount {
    championId: number
    count: number
    championName?: string
}

export interface Summoner {
    queueType: string
    summonerName: string
    hotStreak: boolean
    wins: number
    veteran: boolean
    losses: number
    rank: string
    tier: string
    inactive: boolean
    freshBlood: boolean
    leagueId: string
    summonerId: string
    leaguePoints: number
}

export interface Champion {
    version: string
    id: string
    key: number
    name: string
    title: string
    blurb: string
    info: object
    image: object
    tags: Array<string>
    partype: string
    stats: object
}
