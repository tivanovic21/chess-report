export interface ChessComArchives {
    archives?: string[];
}

export interface ChessComGames {
    games: ChessComGame[];
}

export interface ChessComGame {
    url: string;
    pgn: string;
    time_control: string;
    end_time: number;
    rated: boolean;
    tcn: string;
    uuid: string;
    initial_setup: string;
    fen: string;
    time_class: string;
    rules: string;
    white: {
        rating: number;
        result: string;
        '@id': string;
        username: string;
        uuid: string;
    };
    black: {
        rating: number;
        result: string;
        '@id': string;
        username: string;
        uuid: string;
    };
}

export interface ChessComPlayer {
    avatar: string;
    player_id: number;
    '@id': string;
    url: string;
    name: string;
    username: string;
    followers: number;
    country: string;
    last_online: number;
    joined: number;
    status: string;
    is_streamer: boolean;
    verified: boolean;
    league: string;
}

export enum Months {
    January = '01',
    February = '02',
    March = '03',
    April = '04',
    May = '05',
    June = '06',
    July = '07',
    August = '08',
    September = '09',
    October = '10',
    November = '11',
    December = '12'
}